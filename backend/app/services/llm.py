import os
import httpx
import logging

logger = logging.getLogger(__name__)

async def extract_product_name(title: str) -> str:
    """
    Uses a local LLM to extract a clean product name and model number from a noisy auction title.
    """
    base_url = os.getenv("LLM_BASE_URL", "http://localhost:1234/v1")
    prompt = f"Extract only the core product name and model number from this auction title, removing all auction-specific noise (lot numbers, locations, adjectives like 'Huge'). Title: {title}"
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{base_url}/chat/completions",
                json={
                    "model": "local-model",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1
                }
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"].strip()
            
            # Remove quotes if LLM added them
            content = content.strip('"').strip("'")
            
            # If the LLM returned something very long or empty, fallback
            if not content or len(content) > 100:
                return title[:50]
                
            return content
            
    except Exception as e:
        logger.error(f"LLM extraction failed for title '{title}': {e}")
        # Fallback to a simplified version of the title
        return title[:50]
