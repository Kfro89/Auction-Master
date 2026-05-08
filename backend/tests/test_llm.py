import pytest
from app.services.llm import extract_product_name

@pytest.mark.asyncio
async def test_extract_product_name(httpx_mock):
    httpx_mock.add_response(
        url="http://192.168.0.63:1234/v1/chat/completions",
        json={"choices": [{"message": {"content": "Grizzly G0602 Lathe"}}]}
    )
    name = await extract_product_name("Lot 123 - Huge Grizzly G0602 Metal Lathe, Cheyenne Estate")
    assert name == "Grizzly G0602 Lathe"
