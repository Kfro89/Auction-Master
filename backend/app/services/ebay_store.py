from typing import List, Dict, Any
from .ebay_auth import EbayAuthClient

class EbayStoreClient:
    def __init__(self, auth_client: EbayAuthClient):
        self.auth_client = auth_client

    async def get_sales_stats(self) -> Dict[str, Any]:
        # Mock data for now
        return {
            "totalSales": 12450.50,
            "listingCount": 42,
            "averageSellingPrice": 296.44,
            "salesTrend": [
                {"date": "2024-04-01", "sales": 450},
                {"date": "2024-04-02", "sales": 320},
                {"date": "2024-04-03", "sales": 680},
                {"date": "2024-04-04", "sales": 150},
                {"date": "2024-04-05", "sales": 490},
                {"date": "2024-04-06", "sales": 720},
                {"date": "2024-04-07", "sales": 510}
            ]
        }

    async def get_active_listings(self) -> List[Dict[str, Any]]:
        # Mock data for now
        return [
            {
                "id": "item123",
                "title": "Vintage Camera",
                "price": 150.00,
                "status": "active",
                "views": 24,
                "watchers": 3
            },
            {
                "id": "item456",
                "title": "Retro Game Console",
                "price": 200.00,
                "status": "active",
                "views": 45,
                "watchers": 8
            }
        ]
