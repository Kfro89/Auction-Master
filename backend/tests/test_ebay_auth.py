import pytest
from app.services.ebay_auth import EbayAuthClient

@pytest.mark.asyncio
async def test_get_token(httpx_mock):
    httpx_mock.add_response(json={"access_token": "mock_token", "expires_in": 7200})
    client = EbayAuthClient(client_id="test", client_secret="test")
    token = await client.get_token()
    assert token == "mock_token"
