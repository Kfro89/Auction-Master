import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.services.ebay_auth import EbayAuthClient
from app.services.ebay_browse import EbayBrowseClient
import httpx

@pytest.mark.asyncio
async def test_search_active_listings():
    # Mock the auth client
    mock_auth_client = MagicMock(spec=EbayAuthClient)
    mock_auth_client.get_app_token = AsyncMock(return_value="fake_token")

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
        mock_auth_client.get_app_token.assert_awaited_once()

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

@pytest.mark.asyncio
async def test_search_active_listings_retry_429():
    # Mock the auth client
    mock_auth_client = MagicMock(spec=EbayAuthClient)
    mock_auth_client.get_app_token = AsyncMock(return_value="fake_token")

    # Mock httpx.AsyncClient.get to return 429 then 200
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        # First call: 429
        mock_response_429 = MagicMock()
        mock_response_429.status_code = 429
        mock_response_429.headers = {"Retry-After": "0"} # Wait 0 for tests
        
        # Second call: 200
        mock_response_200 = MagicMock()
        mock_response_200.status_code = 200
        mock_response_200.raise_for_status = MagicMock()
        mock_response_200.json.return_value = {"itemSummaries": [{"itemId": "123"}]}
        
        mock_get.side_effect = [mock_response_429, mock_response_200]

        # Instantiate Browse Client
        browse_client = EbayBrowseClient(mock_auth_client)
        
        # Call the method
        # We need to mock asyncio.sleep so it doesn't actually wait
        with patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
            result = await browse_client.search_active_listings("laptop", ["3000"])

            # Check return value
            assert result == {"itemSummaries": [{"itemId": "123"}]}
            
            # Check that get was called twice
            assert mock_get.call_count == 2
            
            # Check that sleep was called once with wait_time 0
            mock_sleep.assert_awaited_once_with(0)

@pytest.mark.asyncio
async def test_search_active_listings_max_retries_exceeded():
    # Mock the auth client
    mock_auth_client = MagicMock(spec=EbayAuthClient)
    mock_auth_client.get_app_token = AsyncMock(return_value="fake_token")

    # Mock httpx.AsyncClient.get to always return 429
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_response_429 = MagicMock()
        mock_response_429.status_code = 429
        mock_response_429.headers = {"Retry-After": "0"}
        # raise_for_status should raise if status is 429 and we've run out of retries
        mock_response_429.raise_for_status.side_effect = httpx.HTTPStatusError("Too Many Requests", request=MagicMock(), response=mock_response_429)
        
        mock_get.return_value = mock_response_429

        # Instantiate Browse Client
        browse_client = EbayBrowseClient(mock_auth_client)
        
        # Call the method and expect error
        with patch("asyncio.sleep", new_callable=AsyncMock):
            with pytest.raises(httpx.HTTPStatusError):
                await browse_client.search_active_listings("laptop", ["3000"])
            
            # Check that get was called 4 times (1 original + 3 retries)
            assert mock_get.call_count == 4
