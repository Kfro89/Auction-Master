import base64
import time
import httpx
from typing import Optional

class EbayAuthClient:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self._token: Optional[str] = None
        self._token_expires_at: float = 0.0

    async def get_token(self) -> str:
        if self._token and time.time() < self._token_expires_at:
            return self._token

        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode("utf-8")

        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {
            "grant_type": "client_credentials",
            "scope": "https://api.ebay.com/oauth/api_scope"
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.ebay.com/identity/v1/oauth2/token",
                headers=headers,
                data=data
            )
            response.raise_for_status()
            token_data = response.json()

            self._token = token_data["access_token"]
            # Expiration usually comes as expires_in (seconds)
            self._token_expires_at = time.time() + token_data["expires_in"] - 60 # 60 seconds buffer

            return self._token
