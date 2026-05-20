import pytest
from unittest.mock import patch, MagicMock
from app.services.win_verification import verify_and_migrate_wins
from app.models import BidItem, AuctionHouse, Setting
from datetime import datetime, timezone, timedelta
from app.database import SessionLocal

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.mark.asyncio
@patch("app.scrapers.govdeals.GovDealsScraper.fetch_closed_bids")
@patch("app.scrapers.whitley_auction.WhitleyAuctionScraper.fetch_closed_bids")
@patch("app.scrapers.roller_auction.RollerAuctionScraper.fetch_closed_bids")
@patch("app.scrapers.public_surplus.PublicSurplusScraper.fetch_closed_bids")
@patch("app.scrapers.bid_wrangler.BidWranglerApiScraper.fetch_closed_bids")
@patch("app.services.win_verification.decrypt_value")
async def test_verify_and_migrate_wins_govdeals(mock_decrypt, mock_bw, mock_ps, mock_rol, mock_wh, mock_gd, db):
    # Setup test data
    # 1. Create Auction House
    house = db.query(AuctionHouse).filter_by(website_key="govdeals").first()
    if not house:
        house = AuctionHouse(name="GovDeals", website_key="govdeals", base_url="https://www.govdeals.com", buyer_premium_pct=15.0)
        db.add(house)
        db.commit()

    # 2. Create Ended BidItem (winning)
    ended_time = datetime.now(timezone.utc) - timedelta(hours=1)
    item = BidItem(
        auction_house_id=house.id,
        external_id="test_won_123",
        title="Test Won Item",
        end_time=ended_time,
        user_bid_status="winning"
    )
    db.add(item)
    
    # Create another item that was lost
    item_lost = BidItem(
        auction_house_id=house.id,
        external_id="test_lost_456",
        title="Test Lost Item",
        end_time=ended_time,
        user_bid_status="winning" # Thought we were winning
    )
    db.add(item_lost)
    db.commit()

    # Mock Scraper Returns
    from app.schemas.scraping import ScrapedBid
    mock_gd.return_value = [
        ScrapedBid(
            id="test_won_123",
            title="Test Won Item",
            status="closed",
            user_bid_status="won",
            current_bid=100.0,
            user_bid=100.0,
            proxy_bid=150.0,
            end_time=ended_time
        ),
        ScrapedBid(
            id="test_lost_456",
            title="Test Lost Item",
            status="closed",
            user_bid_status="lost",
            current_bid=200.0,
            user_bid=180.0,
            proxy_bid=180.0,
            end_time=ended_time
        )
    ]
    # Set other mocks to return empty list
    mock_wh.return_value = []
    mock_rol.return_value = []
    mock_ps.return_value = []
    mock_bw.return_value = []
    mock_decrypt.return_value = "fake_cookie"
    
    # Ensure settings exist for all platforms to avoid skip warnings/errors
    for key in ["rmeb_cookie", "rol_cookie", "public_surplus_cookie", "dickensheet_cookie", "govdeals_cookie"]:
        if not db.query(Setting).filter_by(key=key).first():
            db.add(Setting(key=key, value="encrypted"))
    db.commit()

    # Run Verification
    results = await verify_and_migrate_wins(db)
    
    # Assertions
    assert results["govdeals"]["status"] == "success"
    assert results["govdeals"]["updated"] == 2
    
    # Check if Item 1 updated to won
    db.refresh(item)
    assert item.user_bid_status == "won"
    assert item.current_bid_amount == 100.0
    
    # Check if Item 2 updated to lost
    db.refresh(item_lost)
    assert item_lost.user_bid_status == "lost"
    
    # Cleanup
    db.delete(item)
    db.delete(item_lost)
    db.commit()
