from typing import List, Dict, Any, Optional
import httpx
from datetime import datetime
from .ebay_auth import EbayAuthClient

class EbayStoreClient:
    def __init__(self, auth_client: EbayAuthClient, user_token: Optional[str] = None):
        self.auth_client = auth_client
        self.user_token = user_token
        self.base_url = "https://api.ebay.com/sell"

    async def get_active_listings(self, limit: int = 100, offset: int = 0) -> Dict[str, Any]:
        """Fetch active listings from eBay Inventory API."""
        if not self.user_token:
            raise Exception("User token required for Inventory API")

        headers = {
            "Authorization": f"Bearer {self.user_token}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/inventory/v1/inventory_item?limit={limit}&offset={offset}",
                headers=headers
            )
            response.raise_for_status()
            return response.json()

    async def get_orders(self, filter_str: Optional[str] = None) -> Dict[str, Any]:
        """Fetch orders from eBay Fulfillment API."""
        if not self.user_token:
            raise Exception("User token required for Fulfillment API")

        headers = {
            "Authorization": f"Bearer {self.user_token}",
            "Content-Type": "application/json"
        }
        
        url = f"{self.base_url}/fulfillment/v1/order"
        if filter_str:
            url += f"?filter={filter_str}"
            
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()

    async def get_sales_stats(self) -> Dict[str, Any]:
        """Fetch seller analytics/KPIs."""
        # This could use sell/analytics/v1/traffic_report
        # For now, we'll calculate them from our own DB after syncing.
        # But here's a stub for an API call if needed.
        return {
            "totalSales": 0.0,
            "listingCount": 0,
            "averageSellingPrice": 0.0,
            "salesTrend": []
        }
