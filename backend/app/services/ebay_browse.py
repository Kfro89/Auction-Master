import httpx
from typing import List, Dict, Any
from .ebay_auth import EbayAuthClient

class EbayBrowseClient:
    def __init__(self, auth_client: EbayAuthClient):
        self.auth_client = auth_client
        self.base_url = "https://api.ebay.com/buy/browse/v1"

    async def search_active_listings(self, query: str, condition_ids: List[str], category_ids: str = None, buying_options: List[str] = ["FIXED_PRICE"]) -> Dict[str, Any]:
        token = await self.auth_client.get_app_token()
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        conditions_str = "|".join(condition_ids)
        options_str = "|".join(buying_options)
        filter_str = f"buyingOptions:{{{options_str}}},conditionIds:{{{conditions_str}}}"
        
        params = {
            "q": query,
            "filter": filter_str,
            "limit": "100"
        }
        
        if category_ids:
            params["category_ids"] = category_ids

        async with httpx.AsyncClient() as client:
            max_retries = 3
            for attempt in range(max_retries + 1):
                try:
                    response = await client.get(
                        f"{self.base_url}/item_summary/search",
                        headers=headers,
                        params=params
                    )
                    
                    if response.status_code == 429:
                        if attempt < max_retries:
                            retry_after = response.headers.get("Retry-After")
                            wait_time = int(retry_after) if retry_after and retry_after.isdigit() else (2 ** attempt)
                            import logging
                            import asyncio
                            logging.getLogger(__name__).warning(f"eBay API rate limit (429) hit. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                            await asyncio.sleep(wait_time)
                            continue
                        else:
                            response.raise_for_status()
                    
                    response.raise_for_status()
                    return response.json()
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429 and attempt < max_retries:
                        continue # Handled above, but just in case
                    raise e
