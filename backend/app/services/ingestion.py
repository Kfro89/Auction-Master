from datetime import datetime, timezone
import json
from sqlalchemy.orm import Session
from ..models import AuctionHouse, Auction, Item, Setting
from ..scrapers.auctioneer_software import AuctioneerSoftwareScraper
import logging

logger = logging.getLogger(__name__)

async def ingest_auctioneer_software(db: Session, base_url: str, website_key: str, name: str, buyer_premium: float):
    """
    Orchestrates the scraping and ingestion of data from an Auctioneer Software platform.
    """
    # 1. Fetch stored Bidder IDs from settings
    settings_record = db.query(Setting).filter(Setting.key == "bidder_ids").first()
    user_bidder_ids = []
    if settings_record and settings_record.value:
        try:
            val = json.loads(settings_record.value)
            if isinstance(val, dict):
                user_bidder_ids = [str(v) for v in val.values() if v]
            else:
                user_bidder_ids = [str(val)]
        except:
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
    
    try:
        auctions_data = await scraper.discover_active_auctions()
        logger.info(f"Discovered {len(auctions_data)} active auctions for {name}")
        
        for auction_data in auctions_data:
            # Apollo State typically uses 'id' and 'name' for Auctions
            ext_id = str(auction_data.get('auction_id') or auction_data.get('id'))
            if not ext_id or ext_id == 'None':
                logger.warning(f"Skipping auction with no ID: {auction_data}")
                continue
                
            auction = db.query(Auction).filter(Auction.external_id == ext_id, Auction.auction_house_id == house.id).first()
            if not auction:
                auction = Auction(
                    auction_house_id=house.id,
                    external_id=ext_id,
                    title=auction_data.get('name') or auction_data.get('title', 'Unknown Auction')
                )
                db.add(auction)
                db.commit()
                db.refresh(auction)
                logger.info(f"Created new auction record for {ext_id}")
            
            # Now fetch lots for this auction
            _, lots_data = await scraper.fetch_auction_lots(ext_id)
            
            items_count = 0
            for lot in lots_data:
                lot_ext_id = str(lot.get('lot_id') or lot.get('id'))
                if not lot_ext_id or lot_ext_id == 'None':
                    continue
                    
                item = db.query(Item).filter(Item.external_id == lot_ext_id, Item.auction_house_id == house.id).first()
                
                # Extract values robustly
                current_bid_obj = lot.get('currentBid') or lot.get('current_bid', {})
                current_bid = 0.0
                if isinstance(current_bid_obj, dict):
                    current_bid = float(current_bid_obj.get('amount', 0.0))
                elif isinstance(current_bid_obj, (int, float)):
                    current_bid = float(current_bid_obj)
                
                end_time_str = lot.get('endDate') or lot.get('end_date')
                end_time = None
                if end_time_str:
                    try:
                        # Assuming ISO 8601 format from GraphQL
                        end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
                    except Exception as e:
                        logger.warning(f"Failed to parse date {end_time_str}: {e}")

                # Extract Image URL
                primary_image = lot.get('primary_image') or lot.get('primaryImage', {})
                image_url = None
                if isinstance(primary_image, dict):
                    image_url = primary_image.get('small') or primary_image.get('thumb') or primary_image.get('url')

                # 2. Check if user is bidding
                is_user_bidding = False
                if lot.get('isHighBidder') is True:
                    is_user_bidding = True
                else:
                    high_bidder_id = str(lot.get('highBidderId') or lot.get('high_bidder_id', ''))
                    if high_bidder_id in user_bidder_ids:
                        is_user_bidding = True

                if not item:
                    item = Item(
                        auction_house_id=house.id,
                        auction_id=auction.id,
                        external_id=lot_ext_id,
                        lot_number=str(lot.get('lotNumber') or lot.get('lot_number', '')),
                        title=lot.get('title') or lot.get('name', 'Unknown'),
                        current_bid=current_bid,
                        bid_count=lot.get('bidCount') or lot.get('bid_count', 0),
                        end_time=end_time,
                        status=str(lot.get('status', 'open')).lower(),
                        url=f"{base_url}/auctions/{ext_id}/lot/{lot_ext_id}",
                        image_url=image_url,
                        first_seen_at=datetime.now(timezone.utc),
                        last_seen_at=datetime.now(timezone.utc),
                        is_user_bidding=is_user_bidding
                    )
                    db.add(item)
                    items_count += 1
                else:
                    item.current_bid = current_bid
                    item.bid_count = lot.get('bidCount') or lot.get('bid_count', 0)
                    item.end_time = end_time
                    item.status = str(lot.get('status', 'open')).lower()
                    item.image_url = image_url
                    item.last_seen_at = datetime.now(timezone.utc)
                    item.is_user_bidding = is_user_bidding
                    items_count += 1
                    
            db.commit()
            logger.info(f"Committed {items_count} items for auction {ext_id}")
            
    finally:
        await scraper.close()
        
    return {"status": "success", "message": f"Ingested data for {name}"}
