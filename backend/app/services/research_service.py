from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models import AuctionHouse, Auction, ResearchItem, Setting
from ..scrapers.whitley_auction import WhitleyAuctionScraper
from ..scrapers.roller_auction import RollerAuctionScraper
from ..scrapers.public_surplus import PublicSurplusScraper
from ..scrapers.bid_wrangler import BidWranglerApiScraper
from ..scrapers.govdeals import GovDealsScraper
import logging

logger = logging.getLogger(__name__)

async def discover_auctioneer_software(db: Session, base_url: str, website_key: str, name: str, buyer_premium: float):
    """Discovery service for Apollo-based platforms (Whitley, Roller)."""
    house = db.query(AuctionHouse).filter(AuctionHouse.website_key == website_key).first()
    if not house:
        house = AuctionHouse(name=name, website_key=website_key, base_url=base_url, buyer_premium_pct=buyer_premium)
        db.add(house); db.commit(); db.refresh(house)

    if website_key == "rmeb":
        scraper = WhitleyAuctionScraper(base_url=base_url, website_key=website_key)
    else:
        scraper = RollerAuctionScraper(base_url=base_url, website_key=website_key)
        
    new_items_count = 0
    
    try:
        auctions_data = await scraper.discover_active_auctions()
        for auction_data in auctions_data:
            ext_id = auction_data.id
            if not ext_id: continue
            
            auction = db.query(Auction).filter(Auction.external_id == ext_id, Auction.auction_house_id == house.id).first()
            if not auction:
                auction = Auction(
                    auction_house_id=house.id, external_id=ext_id,
                    title=auction_data.name,
                    start_time=auction_data.start_time,
                    end_time=auction_data.end_time
                )
                db.add(auction); db.commit(); db.refresh(auction)

            _, lots_data = await scraper.fetch_auction_lots(ext_id)
            for lot in lots_data:
                lot_ext_id = lot.id
                item = db.query(ResearchItem).filter(ResearchItem.external_id == lot_ext_id, ResearchItem.auction_house_id == house.id).first()
                
                if not item:
                    item = ResearchItem(
                        auction_house_id=house.id, auction_id=auction.id,
                        external_id=lot_ext_id, lot_number=lot.lot_number or "",
                        title=lot.title or "Unknown", description=lot.description or "",
                        current_bid=lot.current_bid,
                        end_time=lot.end_time,
                        url=lot.url or "",
                        image_url=lot.image_url,
                        first_seen_at=datetime.now(timezone.utc), last_seen_at=datetime.now(timezone.utc),
                        processing_status="pending_enrichment"
                    )
                    db.add(item)
                    new_items_count += 1
                else:
                    item.current_bid = lot.current_bid
                    item.last_seen_at = datetime.now(timezone.utc)
            db.commit()
    except Exception as e:
        logger.error(f"Discovery error for {name}: {e}")
    
    return new_items_count

async def discover_public_surplus(db: Session):
    """Discovery service for Public Surplus."""
    zip_code_setting = db.query(Setting).filter(Setting.key == "public_surplus_zip").first()
    zip_code = zip_code_setting.value if zip_code_setting else "80543"
    radius_setting = db.query(Setting).filter(Setting.key == "public_surplus_radius").first()
    radius = radius_setting.value if radius_setting else "200"
    
    house = db.query(AuctionHouse).filter(AuctionHouse.website_key == "public_surplus").first()
    if not house:
        house = AuctionHouse(name="Public Surplus", website_key="public_surplus", base_url="https://www.publicsurplus.com", buyer_premium_pct=15.0)
        db.add(house); db.commit(); db.refresh(house)

    scraper = PublicSurplusScraper(zip_code=zip_code, radius=radius)
    new_items_count = 0
    
    try:
        auctions_data = await scraper.discover_active_auctions()
        for auction_data in auctions_data:
            ext_id = auction_data.id
            auction = db.query(Auction).filter(Auction.external_id == ext_id, Auction.auction_house_id == house.id).first()
            if not auction:
                auction = Auction(auction_house_id=house.id, external_id=ext_id, title=auction_data.name)
                db.add(auction); db.commit(); db.refresh(auction)

            _, lots_data = await scraper.fetch_auction_lots(ext_id)
            for lot in lots_data:
                lot_ext_id = lot.id
                item = db.query(ResearchItem).filter(ResearchItem.external_id == lot_ext_id, ResearchItem.auction_house_id == house.id).first()
                if not item:
                    item = ResearchItem(
                        auction_house_id=house.id, auction_id=auction.id,
                        external_id=lot_ext_id, lot_number=lot.lot_number or "",
                        title=lot.title or "Unknown", description=lot.description or "",
                        current_bid=lot.current_bid,
                        end_time=lot.end_time,
                        url=lot.url or "",
                        image_url=lot.image_url,
                        first_seen_at=datetime.now(timezone.utc), last_seen_at=datetime.now(timezone.utc),
                        processing_status="pending_enrichment"
                    )
                    db.add(item)
                    new_items_count += 1
                else:
                    item.current_bid = lot.current_bid
                    item.last_seen_at = datetime.now(timezone.utc)
            db.commit()
    except Exception as e:
        logger.error(f"Discovery error for Public Surplus: {e}")
    
    return new_items_count

async def discover_bidwrangler(db: Session, base_url: str, website_key: str, name: str, buyer_premium: float = 15.0):
    """Discovery service for BidWrangler-based platforms (Dickensheet)."""
    house = db.query(AuctionHouse).filter(AuctionHouse.website_key == website_key).first()
    if not house:
        house = AuctionHouse(name=name, website_key=website_key, base_url=base_url, buyer_premium_pct=buyer_premium)
        db.add(house); db.commit(); db.refresh(house)

    scraper = BidWranglerApiScraper(base_url=base_url)
    new_items_count = 0
    try:
        auctions_data = await scraper.discover_active_auctions()
        for auction_data in auctions_data:
            ext_id = auction_data.id
            auction = db.query(Auction).filter(Auction.external_id == ext_id, Auction.auction_house_id == house.id).first()
            if not auction:
                auction = Auction(
                    auction_house_id=house.id, external_id=ext_id,
                    title=auction_data.name,
                    start_time=auction_data.start_time,
                    end_time=auction_data.end_time
                )
                db.add(auction); db.commit(); db.refresh(auction)

            _, lots_data = await scraper.fetch_auction_lots(ext_id)
            for lot in lots_data:
                lot_ext_id = lot.id
                item = db.query(ResearchItem).filter(ResearchItem.external_id == lot_ext_id, ResearchItem.auction_house_id == house.id).first()
                if not item:
                    item = ResearchItem(
                        auction_house_id=house.id, auction_id=auction.id,
                        external_id=lot_ext_id, lot_number=lot.lot_number or "",
                        title=lot.title or "Unknown", description=lot.description or "",
                        current_bid=lot.current_bid,
                        end_time=lot.end_time,
                        url=lot.url or "",
                        image_url=lot.image_url,
                        first_seen_at=datetime.now(timezone.utc), last_seen_at=datetime.now(timezone.utc),
                        processing_status="pending_enrichment"
                    )
                    db.add(item)
                    new_items_count += 1
                else:
                    item.current_bid = lot.current_bid
                    item.last_seen_at = datetime.now(timezone.utc)
            db.commit()
    except Exception as e:
        logger.error(f"Discovery error for {name}: {e}")
    return new_items_count

async def discover_govdeals(db: Session):
    """Discovery service for GovDeals."""
    zip_code_setting = db.query(Setting).filter(Setting.key == "govdeals_zip").first()
    zip_code = zip_code_setting.value if zip_code_setting else "80543"
    radius_setting = db.query(Setting).filter(Setting.key == "govdeals_radius").first()
    radius = radius_setting.value if radius_setting else "100"
    bidder_id_setting = db.query(Setting).filter(Setting.key == "govdeals_bidder_id").first()
    buyer_id = str(bidder_id_setting.value) if bidder_id_setting else None
    
    house = db.query(AuctionHouse).filter(AuctionHouse.website_key == "govdeals").first()
    if not house:
        house = AuctionHouse(name="GovDeals", website_key="govdeals", base_url="https://www.govdeals.com", buyer_premium_pct=12.5)
        db.add(house); db.commit(); db.refresh(house)

    scraper = GovDealsScraper(zip_code=zip_code, radius=radius, buyer_id=buyer_id)
    new_items_count = 0
    try:
        auctions_data = await scraper.discover_active_auctions()
        for auction_data in auctions_data:
            ext_id = auction_data.id
            auction = db.query(Auction).filter(Auction.external_id == ext_id, Auction.auction_house_id == house.id).first()
            if not auction:
                auction = Auction(auction_house_id=house.id, external_id=ext_id, title=auction_data.name)
                db.add(auction); db.commit(); db.refresh(auction)

            _, lots_data = await scraper.fetch_auction_lots(ext_id)
            for lot in lots_data:
                lot_ext_id = lot.id
                item = db.query(ResearchItem).filter(ResearchItem.external_id == lot_ext_id, ResearchItem.auction_house_id == house.id).first()
                if not item:
                    item = ResearchItem(
                        auction_house_id=house.id, auction_id=auction.id,
                        external_id=lot_ext_id, lot_number=lot.lot_number or "",
                        title=lot.title or "Unknown", description=lot.description or "",
                        current_bid=lot.current_bid,
                        end_time=lot.end_time,
                        url=lot.url or "",
                        image_url=lot.image_url,
                        first_seen_at=datetime.now(timezone.utc), last_seen_at=datetime.now(timezone.utc),
                        processing_status="pending_enrichment"
                    )
                    db.add(item)
                    new_items_count += 1
                else:
                    item.current_bid = lot.current_bid
                    item.last_seen_at = datetime.now(timezone.utc)
            db.commit()
    except Exception as e:
        logger.error(f"Discovery error for GovDeals: {e}")
    return new_items_count

async def prune_expired_items(db: Session):
    """
    Aggressively prunes expired research items.
    Deletes items where end_time < now() and is_watched is False.
    """
    now = datetime.now(timezone.utc)
    try:
        deleted_count = db.query(ResearchItem).filter(
            ResearchItem.end_time < now,
            ResearchItem.is_watched == False
        ).delete(synchronize_session=False)
        db.commit()
        if deleted_count > 0:
            logger.info(f"Pruned {deleted_count} expired research items.")
        return deleted_count
    except Exception as e:
        db.rollback()
        logger.error(f"Error pruning expired items: {e}")
        return 0
