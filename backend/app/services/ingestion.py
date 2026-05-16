from datetime import datetime, timezone
import json
import asyncio
from sqlalchemy.orm import Session
from ..models import AuctionHouse, Auction, Item, Setting
from ..scrapers.auctioneer_software import AuctioneerSoftwareScraper
from ..scrapers.public_surplus import PublicSurplusScraper
from ..scrapers.bid_wrangler import BidWranglerApiScraper
from .llm import generate_valuation_data, extract_buyers_premium
from .valuation_worker import valuate_item_background
from .security import decrypt_value
import logging

logger = logging.getLogger(__name__)

async def _process_item_tags(item_to_process: Item, description: str, category_id: str):
    """Helper to process item tags asynchronously."""
    # Try to map category id here if possible, fallback to category_id
    raw_category = f"Category {category_id}" if category_id else "Unknown"
    
    classification = await generate_valuation_data(item_to_process.title, description, raw_category)
    
    if classification.get('category') == "Unknown" and item_to_process.image_url:
        logger.info(f"Category unknown for '{item_to_process.title}', retrying with image evaluation...")
        classification = await generate_valuation_data(
            item_to_process.title,
            description,
            raw_category,
            image_url=item_to_process.image_url
        )
    
    # Store category as "Category > Type"
    structured_category = f"{classification.get('category', 'Unknown')} > {classification.get('type', 'General')}"
    brand = classification.get('brand', '')
    tags = classification.get('tags', {}) # This is now a dictionary
    
    # If the brand was extracted but missing from the structured tags, add it
    if brand and "Brand" not in tags:
        tags["Brand"] = brand

    return structured_category, tags, brand, classification['search_queries'], classification.get('normalized_condition_id', '3000')
async def ingest_auctioneer_software(db: Session, base_url: str, website_key: str, name: str, buyer_premium: float, progress: dict = None):
    """
    Orchestrates the scraping and ingestion of data from an Auctioneer Software platform.
    Returns a dict with status and new_items count.
    """
    # 1. Fetch stored Bidder IDs from settings
    settings_record = db.query(Setting).filter(Setting.key == f"{website_key}_bidder_id").first()
    user_bidder_ids = []
    if settings_record and settings_record.value:
        user_bidder_ids = [str(settings_record.value)]

    # 2. Ensure AuctionHouse exists
    house = db.query(AuctionHouse).filter(AuctionHouse.website_key == website_key).first()
    if not house:
        house = AuctionHouse(
            name=name,
            website_key=website_key,
            base_url=base_url,
            buyer_premium_pct=buyer_premium
        )
        db.add(house)
        db.commit()
        db.refresh(house)

    scraper = AuctioneerSoftwareScraper(base_url=base_url, website_key=website_key)
    
    # 3. Try to authenticate via Session Cookie to extract Bidder ID automatically
    # For Whitley (rmeb) or Roller (rol)
    cookie_setting = db.query(Setting).filter(Setting.key == f"{website_key}_cookie").first()
    if cookie_setting and cookie_setting.value:
        session_cookie = decrypt_value(cookie_setting.value)
        if session_cookie:
            await scraper.login(username="", session_cookie=session_cookie)
            my_bidder_id = await scraper.fetch_my_bidder_id()
            if my_bidder_id and my_bidder_id not in user_bidder_ids:
                user_bidder_ids.append(str(my_bidder_id))
                logger.info(f"{name}: Automatically extracted Bidder ID '{my_bidder_id}' from session cookie.")

    total_new_items = 0
    try:
        auctions_data = await scraper.discover_active_auctions()
        logger.info(f"Discovered {len(auctions_data)} active auctions for {name}")
        
        for auction_data in auctions_data:
            # Apollo State typically uses 'id' and 'name' for Auctions
            ext_id = str(auction_data.get('auction_id') or auction_data.get('id'))
            if not ext_id or ext_id == 'None':
                logger.warning(f"Skipping auction with no ID: {auction_data}")
                continue
                
            auction_start_str = auction_data.get('start_time') or auction_data.get('startDate')
            auction_end_str = auction_data.get('end_time') or auction_data.get('endDate')
            
            a_start_time = None
            a_end_time = None
            
            try:
                if auction_start_str:
                    a_start_time = datetime.fromisoformat(auction_start_str.replace('Z', '+00:00'))
                if auction_end_str:
                    a_end_time = datetime.fromisoformat(auction_end_str.replace('Z', '+00:00'))
            except Exception as e:
                logger.warning(f"Failed to parse auction dates: {e}")

            auction = db.query(Auction).filter(Auction.external_id == ext_id, Auction.auction_house_id == house.id).first()
            if not auction:
                auction = Auction(
                    auction_house_id=house.id,
                    external_id=ext_id,
                    title=auction_data.get('name') or auction_data.get('title', 'Unknown Auction'),
                    start_time=a_start_time,
                    end_time=a_end_time
                )
                db.add(auction)
                db.commit()
                db.refresh(auction)
                logger.info(f"Created new auction record for {ext_id}")
            else:
                # Update auction dates if they changed
                auction.start_time = a_start_time
                auction.end_time = a_end_time
            
            # Now fetch lots for this auction
            _, lots_data = await scraper.fetch_auction_lots(ext_id)
            if progress:
                progress["message"] = f"{name} — processing {len(lots_data)} items..."
            
            items_count = 0
            new_items_to_tag = []
            
            for lot in lots_data:
                lot_ext_id = str(lot.get('lot_id') or lot.get('id'))
                if not lot_ext_id or lot_ext_id == 'None':
                    continue
                    
                item = db.query(Item).filter(Item.external_id == lot_ext_id, Item.auction_house_id == house.id).first()
                
                # Extract values robustly
                current_bid = float(lot.get('winning_bid_amount') or lot.get('starting_bid') or lot.get('price') or lot.get('required_bid') or 0.0)
                
                end_time_str = lot.get('end_time') or lot.get('endDate') or lot.get('end_date')
                end_time = None
                if end_time_str:
                    try:
                        # Assuming ISO 8601 format from GraphQL
                        end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
                    except Exception as e:
                        logger.warning(f"Failed to parse date {end_time_str}: {e}")

                if not end_time and a_end_time:
                    # Fallback to auction end time if lot end time is missing
                    end_time = a_end_time
                # Extract Image URL
                primary_image = lot.get('primary_image') or lot.get('primaryImage', {})
                image_url = None
                if isinstance(primary_image, dict):
                    image_url = primary_image.get('small') or primary_image.get('thumb') or primary_image.get('url')
                
                if image_url and not image_url.startswith('http'):
                    if image_url.startswith('//'):
                        image_url = f"https:{image_url}"
                    else:
                        image_url = f"{base_url.rstrip('/')}/{image_url.lstrip('/')}"

                # 2. Check if user is bidding
                is_user_bidding = False
                if lot.get('isHighBidder') is True:
                    is_user_bidding = True
                else:
                    high_bidder_id = str(lot.get('highBidderId') or lot.get('high_bidder_id', ''))
                    if high_bidder_id in user_bidder_ids:
                        is_user_bidding = True

                category_id = str(lot.get('category_id') or '')
                description = lot.get('description', '')
                if not item:
                    item = Item(
                        auction_house_id=house.id,
                        auction_id=auction.id,
                        external_id=lot_ext_id,
                        lot_number=str(lot.get('lotNumber') or lot.get('lot_number', '')),
                        title=lot.get('title') or lot.get('name', 'Unknown'),
                        description=description,
                        current_bid=current_bid,
                        bid_count=lot.get('bidCount') or lot.get('bid_count', 0),
                        end_time=end_time,
                        status=str(lot.get('status', 'open')).lower(),
                        url=f"{base_url}/auctions/{ext_id}/lot/{lot_ext_id}",
                        image_url=image_url,
                        first_seen_at=datetime.now(timezone.utc),
                        last_seen_at=datetime.now(timezone.utc),
                        is_user_bidding=is_user_bidding,
                        category=category_id,
                        tags=[]
                    )
                    db.add(item)
                    # We will tag this after adding to DB
                    new_items_to_tag.append((item, description, category_id))
                    items_count += 1
                    total_new_items += 1
                else:
                    item.current_bid = current_bid
                    item.bid_count = lot.get('bidCount') or lot.get('bid_count', 0)
                    item.end_time = end_time
                    item.status = str(lot.get('status', 'open')).lower()
                    item.image_url = image_url
                    item.last_seen_at = datetime.now(timezone.utc)
                    item.is_user_bidding = is_user_bidding

                    
                    if not item.category and category_id:
                        item.category = category_id
                    
                    # Update tags if none
                    if not item.tags:
                        new_items_to_tag.append((item, description, category_id))
                        
                    items_count += 1
            
            # Flush first so we have the items in the DB
            db.commit()
            
            # Fetch tags in batches to not overwhelm LLM
            batch_size = 6
            total_items = len(new_items_to_tag)
            for i in range(0, total_items, batch_size):
                batch_num = (i // batch_size) + 1
                processed_count = i + len(new_items_to_tag[i:i+batch_size])
                if progress:
                    progress["message"] = f"{name} — AI classifying items ({processed_count}/{total_items})..."
                batch = new_items_to_tag[i:i+batch_size]
                tasks = []
                for db_item, desc, cat_id in batch:
                    tasks.append(_process_item_tags(db_item, desc, cat_id))
                
                results = await asyncio.gather(*tasks)
                
                for j, (cat_name, tags, brand, search_queries, normalized_condition_id) in enumerate(results):
                    db_item = batch[j][0]
                    # Update category to a human readable name if LLM or our map improved it
                    db_item.category = cat_name
                    db_item.tags = tags
                    if brand:
                        db_item.brand = brand
                    db_item.search_queries = search_queries
                    db_item.normalized_condition_id = normalized_condition_id
                
                db.commit()
                
                # Batch eBay valuations in parallel
                if progress:
                    progress["message"] = f"{name} — running valuations ({processed_count}/{total_items})..."
                val_tasks = [valuate_item_background(db_item.id, house.buyer_premium_pct)
                             for db_item in [b[0] for b in batch]]
                await asyncio.gather(*val_tasks, return_exceptions=True)
            logger.info(f"Committed {items_count} items for auction {ext_id}")
            
    finally:
        await scraper.close()
        
    return {"status": "success", "message": f"Ingested data for {name}", "new_items": total_new_items}

async def ingest_public_surplus(db: Session, progress: dict = None):
    """
    Orchestrates the scraping and ingestion of data from Public Surplus.
    """
    settings_record_zip = db.query(Setting).filter(Setting.key == "public_surplus_zip").first()
    settings_record_radius = db.query(Setting).filter(Setting.key == "public_surplus_radius").first()
    
    zip_code = settings_record_zip.value if settings_record_zip and settings_record_zip.value else "80543"
    radius = settings_record_radius.value if settings_record_radius and settings_record_radius.value else "200"

    website_key = "public_surplus"
    name = "Public Surplus"
    buyer_premium = 0.0  # Usually buyer premium varies, default 0 or we can make it a setting

    # Ensure AuctionHouse exists
    house = db.query(AuctionHouse).filter(AuctionHouse.website_key == website_key).first()
    if not house:
        house = AuctionHouse(
            name=name,
            website_key=website_key,
            base_url="https://www.publicsurplus.com",
            buyer_premium_pct=buyer_premium
        )
        db.add(house)
        db.commit()
        db.refresh(house)

    scraper = PublicSurplusScraper(zip_code=zip_code, radius=radius)
    
    # Try to fetch user's active bids using the cookie
    cookie_setting = db.query(Setting).filter(Setting.key == "public_surplus_cookie").first()
    my_bid_ids = []
    if cookie_setting and cookie_setting.value:
        session_cookie = decrypt_value(cookie_setting.value)
        if session_cookie:
            login_ok = await scraper.login(username="", session_cookie=session_cookie)
            if login_ok:
                try:
                    my_bids_data = await scraper.fetch_my_bids()
                    my_bid_ids = [b['id'] for b in my_bids_data]
                    logger.info(f"Public Surplus: Found {len(my_bid_ids)} active bids for user.")
                except PermissionError:
                    logger.warning("Public Surplus: Cookie expired during bid fetch. Proceeding without bid status.")
                except Exception as e:
                    logger.warning(f"Public Surplus: Failed to fetch bids: {e}. Proceeding without bid status.")
            else:
                logger.warning("Public Surplus: Session cookie is expired or invalid. Proceeding without bid status.")
    
    total_new_items = 0
    try:
        auctions_data = await scraper.discover_active_auctions()
        
        for auction_data in auctions_data:
            ext_id = auction_data['id']
            
            auction = db.query(Auction).filter(Auction.external_id == ext_id, Auction.auction_house_id == house.id).first()
            if not auction:
                auction = Auction(
                    auction_house_id=house.id,
                    external_id=ext_id,
                    title=auction_data.get('name', 'Public Surplus Search'),
                    start_time=None,
                    end_time=None
                )
                db.add(auction)
                db.commit()
                db.refresh(auction)
            
            _, lots_data = await scraper.fetch_auction_lots(ext_id)
            if progress:
                progress["message"] = f"Public Surplus — processing {len(lots_data)} items..."
            
            items_count = 0
            new_items_to_tag = []
            
            for lot in lots_data:
                lot_ext_id = lot['id']
                item = db.query(Item).filter(Item.external_id == lot_ext_id, Item.auction_house_id == house.id).first()
                
                # Public Surplus doesn't have a reliable 'is user bidding' flag from the search without auth
                is_user_bidding = lot_ext_id in my_bid_ids
                
                category_id = "Public Surplus"
                description = lot.get('description', '')
                
                end_time_str = lot.get('end_time')
                end_time = datetime.fromisoformat(end_time_str) if end_time_str else None
                
                if not item:
                    item = Item(
                        auction_house_id=house.id,
                        auction_id=auction.id,
                        external_id=lot_ext_id,
                        lot_number=str(lot.get('lot_number', '')),
                        title=lot.get('title', 'Unknown'),
                        description=description,
                        current_bid=lot.get('current_bid', 0.0),
                        bid_count=0,
                        end_time=end_time,
                        status="open",
                        url=lot.get('url', ''),
                        image_url=lot.get('primary_image', {}).get('url') if lot.get('primary_image') else None,
                        first_seen_at=datetime.now(timezone.utc),
                        last_seen_at=datetime.now(timezone.utc),
                        is_user_bidding=is_user_bidding,
                        category=category_id,
                        tags=[]
                    )
                    db.add(item)
                    new_items_to_tag.append((item, description, category_id))
                    items_count += 1
                    total_new_items += 1
                else:
                    item.current_bid = lot.get('current_bid', item.current_bid)
                    item.last_seen_at = datetime.now(timezone.utc)
                    item.is_user_bidding = is_user_bidding # Update in case we started bidding
                    items_count += 1
                    
            db.commit()
            
            # Batch process tagging
            batch_size = 6
            total_items = len(new_items_to_tag)
            for i in range(0, total_items, batch_size):
                batch_num = (i // batch_size) + 1
                processed_count = i + len(new_items_to_tag[i:i+batch_size])
                if progress:
                    progress["message"] = f"Public Surplus — AI classifying items ({processed_count}/{total_items})..."
                batch = new_items_to_tag[i:i+batch_size]
                tasks = []
                for db_item, desc, cat_id in batch:
                    tasks.append(_process_item_tags(db_item, desc, cat_id))
                
                results = await asyncio.gather(*tasks)
                
                for j, (cat_name, tags, brand, search_queries, normalized_condition_id) in enumerate(results):
                    db_item = batch[j][0]
                    db_item.category = cat_name
                    db_item.tags = tags
                    if brand:
                        db_item.brand = brand
                    db_item.search_queries = search_queries
                    db_item.normalized_condition_id = normalized_condition_id
                
                db.commit()
                
                # Batch eBay valuations in parallel
                if progress:
                    progress["message"] = f"Public Surplus — running valuations ({processed_count}/{total_items})..."
                val_tasks = [valuate_item_background(db_item.id, house.buyer_premium_pct)
                             for db_item in [b[0] for b in batch]]
                await asyncio.gather(*val_tasks, return_exceptions=True)
            logger.info(f"Committed {items_count} items for Public Surplus")
            
    except Exception as e:
        logger.error(f"Error in ingest_public_surplus: {e}")
        
    return {"status": "success", "message": "Ingested data for Public Surplus", "new_items": total_new_items}

async def ingest_bidwrangler(db: Session, base_url: str, website_key: str, name: str, progress: dict = None):
    """
    Orchestrates the scraping and ingestion of data from a BidWrangler platform (like Dickensheet).
    """
    # Fetch stored Bidder IDs
    settings_record = db.query(Setting).filter(Setting.key == f"{website_key}_bidder_id").first()
    user_bidder_ids = []
    if settings_record and settings_record.value:
        user_bidder_ids = [str(settings_record.value)]

    # Ensure AuctionHouse exists
    # Default premium is 0.0 initially, we dynamically extract per auction
    house = db.query(AuctionHouse).filter(AuctionHouse.website_key == website_key).first()
    if not house:
        house = AuctionHouse(
            name=name,
            website_key=website_key,
            base_url=base_url,
            buyer_premium_pct=0.0
        )
        db.add(house)
        db.commit()
        db.refresh(house)

    scraper = BidWranglerApiScraper(base_url=base_url)
    
    total_new_items = 0
    try:
        auctions_data = await scraper.discover_active_auctions()
        logger.info(f"Discovered {len(auctions_data)} active auctions for {name}")
        
        for auction_data in auctions_data:
            ext_id = str(auction_data.get('id', ''))
            if not ext_id:
                continue
                
            # Try to extract premium
            terms = auction_data.get('terms_and_conditions', '') or auction_data.get('description', '')
            auction_premium = await extract_buyers_premium(terms, default_pct=15.0)
                
            auction_start_str = auction_data.get('starts_at')
            auction_end_str = auction_data.get('scheduled_end_time') or auction_data.get('ends_at')
            
            a_start_time = None
            a_end_time = None
            
            try:
                if auction_start_str:
                    a_start_time = datetime.fromisoformat(auction_start_str.replace('Z', '+00:00'))
                if auction_end_str:
                    a_end_time = datetime.fromisoformat(auction_end_str.replace('Z', '+00:00'))
            except Exception as e:
                logger.warning(f"Failed to parse auction dates: {e}")

            auction = db.query(Auction).filter(Auction.external_id == ext_id, Auction.auction_house_id == house.id).first()
            if not auction:
                auction = Auction(
                    auction_house_id=house.id,
                    external_id=ext_id,
                    title=auction_data.get('name', 'Unknown Auction'),
                    start_time=a_start_time,
                    end_time=a_end_time
                )
                db.add(auction)
                db.commit()
                db.refresh(auction)
            else:
                auction.start_time = a_start_time
                auction.end_time = a_end_time
            
            # Fetch lots
            _, lots_data = await scraper.fetch_auction_lots(ext_id)
            if progress:
                progress["message"] = f"{name} — processing {len(lots_data)} items..."
            
            items_count = 0
            new_items_to_tag = []
            
            for lot in lots_data:
                lot_ext_id = str(lot.get('id', ''))
                if not lot_ext_id:
                    continue
                    
                item = db.query(Item).filter(Item.external_id == lot_ext_id, Item.auction_house_id == house.id).first()
                
                current_bid = float(lot.get('next_bid_amount') or lot.get('current_bid') or lot.get('starting_bid') or 0.0)
                
                end_time_str = lot.get('end_time') or lot.get('ends_at')
                end_time = None
                if end_time_str:
                    try:
                        end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
                    except Exception:
                        pass

                if not end_time and a_end_time:
                    end_time = a_end_time

                # BidWrangler lots return images as an array of objects with xs/sm/lg/xl CDN URLs
                images = lot.get('images') or lot.get('featured_images') or []
                if images and isinstance(images, list) and len(images) > 0:
                    first_img = images[0]
                    if isinstance(first_img, dict):
                        image_url = first_img.get('sm') or first_img.get('lg') or first_img.get('xs') or first_img.get('url')
                    else:
                        image_url = str(first_img) if first_img else None
                else:
                    image_url = lot.get('thumbnail') or lot.get('primary_image') or lot.get('photo_url')
                
                is_user_bidding = False
                high_bidder_id = str(lot.get('high_bidder_id') or lot.get('high_bidder', ''))
                if high_bidder_id and high_bidder_id in user_bidder_ids:
                    is_user_bidding = True

                category_id = str(lot.get('category_id') or '')
                description = lot.get('description', '')
                
                if not item:
                    item = Item(
                        auction_house_id=house.id,
                        auction_id=auction.id,
                        external_id=lot_ext_id,
                        lot_number=str(lot.get('lot_identifier') or lot.get('lot_number', '')),
                        title=lot.get('title') or lot.get('name', 'Unknown'),
                        description=description,
                        current_bid=current_bid,
                        bid_count=lot.get('bid_count', 0),
                        end_time=end_time,
                        status=str(lot.get('status', 'open')).lower(),
                        url=f"{base_url}/ui/auctions/{ext_id}/{lot_ext_id}",
                        image_url=image_url,
                        first_seen_at=datetime.now(timezone.utc),
                        last_seen_at=datetime.now(timezone.utc),
                        is_user_bidding=is_user_bidding,
                        category=category_id,
                        tags=[]
                    )
                    db.add(item)
                    new_items_to_tag.append((item, description, category_id))
                    items_count += 1
                    total_new_items += 1
                else:
                    item.current_bid = current_bid
                    item.bid_count = lot.get('bid_count', item.bid_count)
                    item.end_time = end_time
                    item.status = str(lot.get('status', 'open')).lower()
                    item.image_url = image_url
                    item.last_seen_at = datetime.now(timezone.utc)
                    item.is_user_bidding = is_user_bidding

                    if not item.category and category_id:
                        item.category = category_id
                    
                    if not item.tags:
                        new_items_to_tag.append((item, description, category_id))
                        
                    items_count += 1
            
            db.commit()
            
            batch_size = 6
            total_items = len(new_items_to_tag)
            for i in range(0, total_items, batch_size):
                batch_num = (i // batch_size) + 1
                processed_count = i + len(new_items_to_tag[i:i+batch_size])
                if progress:
                    progress["message"] = f"{name} — AI classifying items ({processed_count}/{total_items})..."
                batch = new_items_to_tag[i:i+batch_size]
                tasks = []
                for db_item, desc, cat_id in batch:
                    tasks.append(_process_item_tags(db_item, desc, cat_id))
                
                results = await asyncio.gather(*tasks)
                
                for j, (cat_name, tags, brand, search_queries, normalized_condition_id) in enumerate(results):
                    db_item = batch[j][0]
                    db_item.category = cat_name
                    db_item.tags = tags
                    if brand:
                        db_item.brand = brand
                    db_item.search_queries = search_queries
                    db_item.normalized_condition_id = normalized_condition_id
                
                db.commit()
                
                if progress:
                    progress["message"] = f"{name} — running valuations ({processed_count}/{total_items})..."
                val_tasks = [valuate_item_background(db_item.id, auction_premium)
                             for db_item in [b[0] for b in batch]]
                await asyncio.gather(*val_tasks, return_exceptions=True)
                    
            logger.info(f"Committed {items_count} items for auction {ext_id}")
            
    finally:
        pass
        
    return {"status": "success", "message": f"Ingested data for {name}", "new_items": total_new_items}
