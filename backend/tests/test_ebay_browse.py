import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.services.ebay_auth import EbayAuthClient
from app.services.ebay_browse import EbayBrowseClient
import httpx

@pytest.mark.asyncio
async def test_search_active_listings():
    # Mock the auth client
    mock_auth_client = MagicMock(spec=EbayAuthClient)
    mock_auth_client.get_token = AsyncMock(return_value="fake_token")

    # Mock httpx.AsyncClient.get
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        # Configure the mock response
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.json.return_value = {"itemSummaries": [{"itemId": "123"}]}
        mock_get.return_value = mock_response

        # Instantiate Browse Client
        browse_client = EbayBrowseClient(mock_auth_client)
        
        # Call the method
        result = await browse_client.search_active_listings("laptop", ["3000"])

        # Check that get_token was called
        mock_auth_client.get_token.assert_awaited_once()

        # Check the httpx request
        mock_get.assert_awaited_once()
        args, kwargs = mock_get.call_args
        url = args[0]
        
        assert url == "https://api.ebay.com/buy/browse/v1/item_summary/search"
        assert kwargs["headers"]["Authorization"] == "Bearer fake_token"
        assert kwargs["params"]["q"] == "laptop"
        assert kwargs["params"]["filter"] == "buyingOptions:{FIXED_PRICE},conditionIds:{3000}"
        assert kwargs["params"]["limit"] == "100"

        # Check return value
        assert result == {"itemSummaries": [{"itemId": "123"}]}
