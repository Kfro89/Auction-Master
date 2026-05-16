import base64
import time
import httpx
from typing import Optional, Dict, Any

class EbayAuthClient:
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str = "https://auction.autom8tr.com/api/ebay/callback"):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self._app_token: Optional[str] = None
        self._app_token_expires_at: float = 0.0

    async def get_app_token(self) -> str:
        """Application Access Token (Client Credentials)"""
        if self._app_token and time.time() < self._app_token_expires_at:
            return self._app_token

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

            self._app_token = token_data["access_token"]
            self._app_token_expires_at = time.time() + token_data["expires_in"] - 60

            return self._app_token

    def get_auth_url(self, state: str) -> str:
        """Generate the URL to send the user to for eBay login."""
        scopes = [
            "https://api.ebay.com/oauth/api_scope",
            "https://api.ebay.com/oauth/api_scope/sell.inventory",
            "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
            "https://api.ebay.com/oauth/api_scope/sell.marketing",
            "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly"
        ]
        scope_str = " ".join(scopes)
        
        # Production URL. Sandbox would be auth.sandbox.ebay.com
        base_url = "https://auth.ebay.com/oauth2/authorize"
        return (
            f"{base_url}?client_id={self.client_id}"
            f"&redirect_uri={self.redirect_uri}"
            f"&response_type=code"
            f"&state={state}"
            f"&scope={httpx.utils.quote(scope_str)}"
        )

    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for user access and refresh tokens."""
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode("utf-8")

        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": self.redirect_uri
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.ebay.com/identity/v1/oauth2/token",
                headers=headers,
                data=data
            )
            response.raise_for_status()
            return response.json()

    async def refresh_user_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh an expired user access token."""
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode("utf-8")

        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "scope": "https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.fulfillment"
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.ebay.com/identity/v1/oauth2/token",
                headers=headers,
                data=data
            )
            response.raise_for_status()
            return response.json()
