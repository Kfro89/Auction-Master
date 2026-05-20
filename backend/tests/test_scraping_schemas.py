from datetime import datetime
import pytest
from pydantic import ValidationError
from app.schemas.scraping import ScrapedAuction, ScrapedLot, ScrapedBid

def test_scraped_auction_valid():
    data = {
        "id": "auction-123",
        "name": "Test Auction",
        "start_time": datetime(2023, 1, 1, 10, 0),
        "end_time": datetime(2023, 1, 1, 18, 0)
    }
    auction = ScrapedAuction(**data)
    assert auction.id == "auction-123"
    assert auction.name == "Test Auction"
    assert auction.start_time == datetime(2023, 1, 1, 10, 0)

def test_scraped_lot_valid():
    data = {
        "id": "lot-456",
        "lot_number": "101",
        "title": "Vintage Watch",
        "description": "A nice watch",
        "url": "http://example.com/lot/456",
        "image_url": "http://example.com/image.jpg",
        "current_bid": 150.0,
        "end_time": datetime(2023, 1, 1, 12, 0)
    }
    lot = ScrapedLot(**data)
    assert lot.id == "lot-456"
    assert lot.current_bid == 150.0

def test_scraped_bid_valid():
    data = {
        "id": "bid-789",
        "title": "Vintage Watch",
        "status": "active",
        "user_bid_status": "winning",
        "current_bid": 150.0,
        "user_bid": 160.0,
        "proxy_bid": 200.0,
        "end_time": datetime(2023, 1, 1, 12, 0)
    }
    bid = ScrapedBid(**data)
    assert bid.id == "bid-789"
    assert bid.user_bid_status == "winning"
    assert bid.proxy_bid == 200.0
