import pytest
from unittest.mock import patch, MagicMock
from app.scrapers.govdeals import GovDealsScraper

@pytest.fixture
def govdeals_scraper():
    return GovDealsScraper(zip_code="80543", radius="100")

@pytest.mark.asyncio
async def test_discover_active_auctions(govdeals_scraper):
    auctions = await govdeals_scraper.discover_active_auctions()
    assert len(auctions) == 1
    assert auctions[0]["id"] == "gd_search_80543_100"
    assert "GovDeals:" in auctions[0]["name"]

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
    
    assert auction_info["id"] == "gd_search_80543_100"
    assert len(lots) == 1
    assert lots[0]["id"] == "234"
    assert lots[0]["title"] == "JLG 400S Telescopic Boom"
    assert lots[0]["price"] == 5000.0
    assert lots[0]["detail_url"] == "https://www.govdeals.com/asset/234/23609"
    
@pytest.mark.asyncio
async def test_login_pseudo_auth(govdeals_scraper):
    # Verify that session_cookie is applied correctly
    success = await govdeals_scraper.login("user", "pass", session_cookie="test_cookie")
    assert success is True
    assert govdeals_scraper.headers.get("Cookie") == "test_cookie"