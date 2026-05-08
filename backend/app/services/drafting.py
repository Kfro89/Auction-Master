import os
import httpx
import logging

logger = logging.getLogger(__name__)

async def generate_ebay_draft(product_name: str, condition: str = "Used") -> dict:
    """
    Uses a local LLM to generate a professional eBay listing title and description.
    """
    base_url = os.getenv("LLM_BASE_URL", "http://localhost:1234/v1")
    prompt = (
        f"Create a professional eBay listing title (max 80 chars) and a detailed product description "
        f"for: {product_name}. Condition: {condition}."
    )
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{base_url}/chat/completions",
                json={
                    "model": "google/gemma-4-e4b",
                    "messages": [
                        {"role": "system", "content": "You are an expert eBay seller."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7
                }
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"].strip()
            
            # The LLM might return a structured response or just text.
            # We'll try to parse it or just split it if it follows a common format.
            # For a more robust implementation, we could ask for JSON, but let's keep it simple for now.
            
            lines = content.split('\n')
            title = ""
            description_lines = []
            
            found_title = False
            for line in lines:
                clean_line = line.strip()
                if not clean_line:
                    continue
                if not found_title and ("Title:" in clean_line or len(clean_line) < 100):
                    title = clean_line.replace("Title:", "").strip()
                    found_title = True
                else:
                    description_lines.append(clean_line)
            
            # Fallback if title extraction failed
            if not title:
                title = product_name[:80]
                
            # If description is empty, use the whole content
            if not description_lines:
                description = content
            else:
                description = "\n\n".join(description_lines)
                
            # Ensure title is max 80 chars
            if len(title) > 80:
                title = title[:77] + "..."
                
            return {
                "title": title,
                "description": description
            }
            
    except Exception as e:
        logger.error(f"LLM drafting failed for '{product_name}': {e}")
        return {
            "title": product_name[:80],
            "description": f"Detailed description for {product_name} in {condition} condition."
        }
