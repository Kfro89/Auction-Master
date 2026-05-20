import pytest
from unittest.mock import patch, MagicMock
from app.scrapers.govdeals import GovDealsScraper
from app.schemas.scraping import ScrapedAuction, ScrapedLot, ScrapedBid
from datetime import datetime, timezone

@pytest.fixture
def govdeals_scraper():
    return GovDealsScraper(zip_code="80543", radius="100")

@pytest.mark.asyncio
async def test_discover_active_auctions(govdeals_scraper):
    auctions = await govdeals_scraper.discover_active_auctions()
    assert len(auctions) == 1
    assert isinstance(auctions[0], ScrapedAuction)
    assert auctions[0].id == "gd_search_80543_100"
    assert "GovDeals:" in auctions[0].name

@pytest.mark.asyncio
@patch("httpx.AsyncClient.post")
async def test_fetch_auction_lots(mock_post, govdeals_scraper):
    # Mocking JSON response for fetch_auction_lots
    mock_json = {
        "assetSearchResults": [
            {
                "accountId": 23609,
                "assetId": 234,
                "assetShortDescription": "JLG 400S Telescopic Boom",
                "currentBid": 5000.0,
                "assetAuctionEndDateUtc": "2026-05-21T20:10:00Z",
                "photo": "test_photo.jpg",
                "locationState": "TX"
            }
        ]
    }

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mock_json
    mock_response.raise_for_status = MagicMock()
    mock_post.return_value = mock_response

    auction_info, lots = await govdeals_scraper.fetch_auction_lots("gd_search_80543_100")

    # Verify payload contains zip and radius
    args, kwargs = mock_post.call_args
    payload = kwargs.get("json")
    assert payload["zipcode"] == "80543"
    assert payload["proximityWithinDistance"] == "100"

    assert isinstance(auction_info, ScrapedAuction)
    assert auction_info.id == "gd_search_80543_100"
    assert len(lots) == 1
    assert isinstance(lots[0], ScrapedLot)
    assert lots[0].id == "234"
    assert lots[0].title == "JLG 400S Telescopic Boom"
    assert lots[0].current_bid == 5000.0
    assert lots[0].url == "https://www.govdeals.com/asset/234/23609"
    assert lots[0].end_time == datetime(2026, 5, 21, 20, 10, tzinfo=timezone.utc)
    # Verify absolute image URL
    assert lots[0].image_url == "https://webassets.lqdt1.com/assets/photos/23609/test_photo.jpg"
@pytest.mark.asyncio
async def test_login_pseudo_auth(govdeals_scraper):
    # Verify that session_cookie is applied correctly
    success = await govdeals_scraper.login("user", "pass", session_cookie="test_cookie")
    assert success is True
    assert govdeals_scraper.headers.get("Cookie") == "test_cookie"

@pytest.mark.asyncio
@patch("httpx.AsyncClient.post")
async def test_fetch_my_bids(mock_post, govdeals_scraper):
    # Mocking GovDeals API response
    mock_json = [
        {
            "assetId": 17891,
            "assetShortDescription": "10 HP Elitebook 840 G8 i5",
            "highBidAmount": 510.00,
            "buyerHighestBidAmount": None,
            "buyerAutoBidAmount": 550.00,
            "isHighBidder": True,
            "auctionEndDateUTC": "2026-05-18T13:53:00Z"
        },
        {
            "assetId": 17892,
            "assetShortDescription": "Outbid Item",
            "highBidAmount": 625.00,
            "buyerHighestBidAmount": 600.00,
            "buyerAutoBidAmount": None,
            "isHighBidder": False,
            "auctionEndDateUTC": "2026-05-18T13:54:00Z"
        }
    ]
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mock_json
    mock_response.raise_for_status = MagicMock()
    mock_post.return_value = mock_response

    my_bids = await govdeals_scraper.fetch_my_bids(buyer_id="3908433")
    
    assert len(my_bids) == 2
    assert all(isinstance(bid, ScrapedBid) for bid in my_bids)
    
    # Check winning item with null buyerHighestBidAmount
    assert my_bids[0].id == "17891"
    assert my_bids[0].user_bid_status == "winning"
    assert my_bids[0].user_bid == 510.00 # Derived from highBidAmount
    assert my_bids[0].proxy_bid == 550.00
    assert my_bids[0].end_time == datetime(2026, 5, 18, 13, 53, tzinfo=timezone.utc)
    
    # Check outbid item
    assert my_bids[1].id == "17892"
    assert my_bids[1].user_bid_status == "outbid"
    assert my_bids[1].user_bid == 600.00
    assert my_bids[1].proxy_bid == 0.0
