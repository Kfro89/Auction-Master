import os
import json
import httpx
import logging
import base64
import ast
from typing import Dict, List, Optional, Any
from pathlib import Path
from .base import AIProvider

logger = logging.getLogger(__name__)

# Load hierarchy for classification
HIERARCHY_PATH = Path(__file__).parent.parent / "hierarchy.json"
def load_hierarchy():
    try:
        if HIERARCHY_PATH.exists():
            with open(HIERARCHY_PATH, "r") as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"LocalProvider: Failed to load hierarchy: {e}")
    return {}

HIERARCHY = load_hierarchy()

class LocalProvider(AIProvider):
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or os.getenv("LLM_BASE_URL", "http://localhost:1234/v1")
        self.model = "google/gemma-4-e4b"

    async def _fetch_and_base64(self, url: str) -> Optional[str]:
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                content_type = resp.headers.get("Content-Type", "image/jpeg")
                encoded = base64.b64encode(resp.content).decode("utf-8")
                return f"data:{content_type};base64,{encoded}"
        except Exception as e:
            logger.error(f"LocalProvider: Failed to fetch image for base64 encoding: {e}")
            return None

    async def extract_product_name(self, title: str) -> str:
        prompt = f"Extract a clean, professional product name from this auction title. It MUST include the Brand and specific Model Number if found, but remove auction-specific noise like lot numbers, locations, or quantity words. Title: {title}"
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{self.base_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.1
                    }
                )
                resp.raise_for_status()
                data = resp.json()
                content = data["choices"][0]["message"]["content"].strip()
                content = content.strip('"').strip("'")
                if not content or len(content) > 100:
                    return title[:50]
                return content
        except Exception as e:
            logger.error(f"LocalProvider: LLM extraction failed for title '{title}': {e}")
            return title[:50]

    async def extract_buyers_premium(self, auction_terms: str, default_pct: float = 15.0) -> float:
        if not auction_terms:
            return default_pct
            
        prompt = f"Extract only the buyer's premium percentage from these auction terms. Return ONLY the number as a float (e.g., 15.0 or 18.5). If you cannot confidently find a buyer's premium percentage, return 'NOT_FOUND'. Terms: {auction_terms[:1000]}"
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{self.base_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.1
                    }
                )
                resp.raise_for_status()
                data = resp.json()
                content = data["choices"][0]["message"]["content"].strip()
                content = content.replace('%', '').strip('"').strip("'").strip()
                if content == 'NOT_FOUND':
                    return default_pct
                try:
                    return float(content)
                except ValueError:
                    return default_pct
        except Exception as e:
            logger.error(f"LocalProvider: LLM buyer's premium extraction failed: {e}")
            return default_pct

    async def generate_valuation_data(self, title: str, description: str, raw_category: str, image_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        hierarchy_str = json.dumps(HIERARCHY, indent=2)
        
        system_prompt = f"""You are an expert at classifying auction items for resale and preparing eBay search terms.
Your goal is to categorize an item based on the provided hierarchy, generate tags, and provide multiple eBay search queries.

Hierarchy:
{hierarchy_str}

Instructions:
1. Choose exactly one Category from the hierarchy keys.
2. Choose exactly one Type from the selected Category's list.
3. Determine the "item_class": "vehicle" (a complete drivable car/truck), "car_part" (a component for a vehicle), or "other".
4. Extract a clean, standardized "product_name". This should be the full descriptive name of the item including its Brand, model series, and key technical specifications (e.g., "HP Z2 Mini G9 Workstation i7-12700", "Apple iPhone 15 Pro 256GB").
5. Determine the "condition": Strictly one of "New", "Used", "Salvage", or "Unknown".
6. Extract specific item attributes into a "tags" JSON dictionary. Include ONLY the following keys if they are applicable/found:
   - "Brand": The manufacturer or brand name (e.g., Apple, Ford, DeWalt).
   - "Model Name / Number": The specific model name or alphanumeric model number.
   - "Serial Number": If explicitly listed.
   - "Item Type": A broad, recognizable noun describing what the item actually is (e.g., Laptop, Game Console, Vehicle).
   - "Color / Finish": The primary color or visual finish.
   - "Material": What the item is primarily made of.
   - "Dimensions & Weight": Only include if explicitly provided in the auction data.
   - "Era / Style": Especially useful for furniture, art, or collectibles.
   - "Condition Notes": Descriptive terms about its physical or functional state (e.g., Untested, New in Box).
   - "Features": A fallback list of 2-3 other notable semantic keywords.
   - "VIN": If the item is a vehicle, extract the exact 17-character alphanumeric Vehicle Identification Number if found.
7. Provide a list of exactly 3 eBay search queries:
   - If an image is provided, aggressively look for Model Numbers or Serial Numbers on labels/stickers to formulate highly precise queries.
   - If "item_class" is "car_part", the queries MUST include the vehicle Year, Make, Model, and the Part Name.
   - Otherwise, follow standard progression: [0] Highly specific (using model numbers if found), [1] Slightly broader, [2] Broad fallback.
8. Determine the "normalized_condition_id" for eBay based on the condition notes. Use: "1000" (New), "3000" (Used), "7000" (For parts/not working). Default to "3000" if unsure.
9. Return ONLY a JSON object with keys: "category" (string), "type" (string), "product_name" (string), "condition" (string), "tags" (dictionary mapping keys to string or list of strings), "item_class" (string), "normalized_condition_id" (string), and "search_queries" (list of strings).
10. Do not include markdown formatting, code blocks, or explanations.
"""
        user_prompt_text = f"Raw Category: {raw_category}\nTitle: {title}\nDescription: {description[:500] if description else 'N/A'}"
        
        user_message = [{"type": "text", "text": user_prompt_text}]
        if image_urls and len(image_urls) > 0:
            b64_image = await self._fetch_and_base64(image_urls[0])
            if b64_image:
                user_message.append({"type": "image_url", "image_url": {"url": b64_image}})
                logger.info(f"LocalProvider: Including base64 image in request for '{title}'")

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    f"{self.base_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_message}
                        ],
                        "temperature": 0.1
                    }
                )
                if resp.status_code != 200:
                    logger.error(f"LocalProvider: LLM Error Body: {resp.text}")
                resp.raise_for_status()
                data = resp.json()
                content = data["choices"][0]["message"]["content"].strip()
                
                # Robust JSON extraction
                if "{" in content:
                    content = content[content.find("{"):]
                if "}" in content:
                    content = content[:content.rfind("}")+1]
                
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                
                result = json.loads(content.strip())
                
                cat = result.get("category", "Other")
                if cat not in HIERARCHY:
                    cat = "Other"
                
                raw_tags = result.get("tags", {})
                if not isinstance(raw_tags, dict):
                    raw_tags = {}
                
                brand_val = raw_tags.get("Brand", "")
                if isinstance(brand_val, list):
                    brand = ", ".join([str(b) for b in brand_val if b])
                else:
                    brand = str(brand_val).strip()
                
                if brand.startswith("[") and brand.endswith("]"):
                    try:
                        brand_list = ast.literal_eval(brand)
                        if isinstance(brand_list, list):
                            brand = ", ".join([str(b) for b in brand_list if b])
                    except:
                        brand = brand.strip("[]'\" ")
                
                product_name = result.get("product_name", "").strip()
                if product_name.startswith("[") and product_name.endswith("]"):
                    try:
                        pn_list = ast.literal_eval(product_name)
                        if isinstance(pn_list, list):
                            product_name = " ".join([str(p) for p in pn_list if p])
                    except:
                        product_name = product_name.strip("[]'\" ")

                return {
                    "category": cat,
                    "type": result.get("type", "General"),
                    "product_name": product_name,
                    "condition": result.get("condition", "Unknown"),
                    "tags": raw_tags,
                    "brand": brand,
                    "search_queries": [str(q) for q in result.get("search_queries", []) if q],
                    "item_class": result.get("item_class", "other"),
                    "normalized_condition_id": str(result.get("normalized_condition_id", "3000"))
                }
                
        except Exception as e:
            logger.error(f"LocalProvider: LLM valuation data generation failed for '{title}': {e}")
            return {
                "category": "Unknown",
                "type": "General",
                "product_name": "",
                "condition": "Unknown",
                "tags": {},
                "search_queries": [title[:50]],
                "item_class": "other",
                "normalized_condition_id": "3000"
            }

    async def enrich_item_text_only(self, title: str, description: str, raw_category: str) -> Dict[str, Any]:
        """LocalProvider uses the same logic for text-only, but without images."""
        return await self.generate_valuation_data(title, description, raw_category, image_urls=None)

    async def reason_valuation_multimodal(self, title: str, description: str, image_urls: List[str], ebay_comps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Simple reasoning for LocalProvider using the existing multimodal logic."""
        # For now, local provider doesn't do deep reasoning with comps array
        # We return a stub that respects the interface
        return {
            "adjusted_market_value": None,
            "condition_grade": "Unknown",
            "reasoning_summary": "Local LLM reasoning not implemented."
        }

    async def classify_item(self, title: str, description: str, raw_category: str) -> Dict[str, Any]:
        hierarchy_str = json.dumps(HIERARCHY, indent=2)
        
        system_prompt = f"""You are an expert at classifying auction items for resale.
Your goal is to categorize an item based on the provided hierarchy and generate descriptive tags.

Hierarchy:
{hierarchy_str}

Instructions:
1. Choose exactly one Category from the hierarchy keys.
2. Choose exactly one Type from the selected Category's list.
3. Generate 2-3 short, descriptive tags (e.g., 'Portable', 'Industrial', 'Vintage', 'New In Box').
4. Return ONLY a JSON object with keys: "category", "type", "tags".
5. Do not include markdown formatting, code blocks, or explanations.
"""
        user_prompt = f"Raw Category: {raw_category}\nTitle: {title}\nDescription: {description[:500] if description else 'N/A'}"
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    f"{self.base_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.1
                    }
                )
                resp.raise_for_status()
                data = resp.json()
                content = data["choices"][0]["message"]["content"].strip()
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                result = json.loads(content.strip())
                cat = result.get("category")
                typ = result.get("type")
                tags = result.get("tags", [])
                if cat not in HIERARCHY:
                    cat = "Other"
                if typ not in HIERARCHY.get(cat, []):
                    typ = "General"
                return {"category": cat, "type": typ, "tags": [str(t) for t in tags[:3]]}
        except Exception as e:
            logger.error(f"LocalProvider: LLM classification failed for '{title}': {e}")
            return {"category": "Unknown", "type": "General", "tags": []}
