from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models import AuctionHouse, Auction, Item
from ..scrapers.auctioneer_software import AuctioneerSoftwareScraper
from .category_classifier import classify_item
import logging

logger = logging.getLogger(__name__)

async def ingest_auctioneer_software(db: Session, base_url: str, website_key: str, name: str, buyer_premium: float):
    """
    Orchestrates the scraping and ingestion of data from an Auctioneer Software platform.
    """
    # 1. Ensure AuctionHouse exists
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
            ext_id = str(auction_data.get('id'))
            if not ext_id or ext_id == 'None':
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
            
            # Now fetch lots for this auction
            _, lots_data = await scraper.fetch_auction_lots(ext_id)
            logger.info(f"Fetched {len(lots_data)} lots for auction {ext_id}")
            
            for lot in lots_data:
                lot_ext_id = str(lot.get('id'))
                if not lot_ext_id or lot_ext_id == 'None':
                    continue
                    
                item = db.query(Item).filter(Item.external_id == lot_ext_id, Item.auction_house_id == house.id).first()
                
                # Extract values robustly
                current_bid_obj = lot.get('currentBid', {})
                current_bid = float(current_bid_obj.get('amount', 0.0)) if current_bid_obj else 0.0
                
                end_time_str = lot.get('endDate')
                end_time = None
                if end_time_str:
                    try:
                        # Assuming ISO 8601 format from GraphQL
                        end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
                    except Exception:
                        pass

                if not item:
                    item = Item(
                        auction_house_id=house.id,
                        auction_id=auction.id,
                        external_id=lot_ext_id,
                        lot_number=str(lot.get('lotNumber', '')),
                        title=lot.get('title', 'Unknown'),
                        current_bid=current_bid,
                        bid_count=lot.get('bidCount', 0),
                        end_time=end_time,
                        status=lot.get('status', 'open').lower(),
                        url=f"{base_url}/auctions/{ext_id}/lot/{lot_ext_id}",
                        category=classify_item(
                            lot.get('title', ''),
                            lot.get('description', ''),
                        ),
                        first_seen_at=datetime.now(timezone.utc),
                        last_seen_at=datetime.now(timezone.utc)
                    )
                    db.add(item)
                else:
                    item.current_bid = current_bid
                    item.bid_count = lot.get('bidCount', 0)
                    item.end_time = end_time
                    item.status = lot.get('status', 'open').lower()
                    item.last_seen_at = datetime.now(timezone.utc)
                    # Re-classify if category is missing
                    if not item.category:
                        item.category = classify_item(
                            item.title, item.description or ''
                        )
                    
            db.commit()
            
    finally:
        await scraper.close()
        
    return {"status": "success", "message": f"Ingested data for {name}"}
