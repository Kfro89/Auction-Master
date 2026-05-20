import os
import json
import httpx
import logging
import base64
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
        logger.error(f"GeminiProvider: Failed to load hierarchy: {e}")
    return {}

HIERARCHY = load_hierarchy()

class GeminiProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "gemini-3.1-flash-lite"):
        self.api_key = api_key
        # Ensure model doesn't have models/ prefix as it's added in the URL
        self.model = model.replace("models/", "")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def _generate_content(self, contents: List[Dict], system_instruction: Optional[str] = None, response_schema: Optional[Dict] = None) -> str:
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        generation_config = {
            "temperature": 0.1,
        }
        
        if response_schema:
            generation_config["response_mime_type"] = "application/json"
            generation_config["response_schema"] = response_schema

        payload = {
            "contents": contents,
            "generationConfig": generation_config
        }
        
        if system_instruction:
            payload["system_instruction"] = {
                "parts": [{"text": system_instruction}]
            }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                logger.error(f"Gemini API Error: {resp.status_code} - {resp.text}")
                resp.raise_for_status()
            
            data = resp.json()
            try:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError) as e:
                logger.error(f"Gemini Response Parsing Error: {e} - Data: {data}")
                raise ValueError("Unexpected Gemini API response format")

    async def extract_product_name(self, title: str) -> str:
        prompt = f"Extract a clean, professional product name from this auction title. It MUST include the Brand and specific Model Number if found, but remove auction-specific noise like lot numbers, locations, or quantity words. Return ONLY the product name string.\n\nTitle: {title}"
        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        
        try:
            content = await self._generate_content(contents)
            content = content.strip().strip('"').strip("'")
            if not content or len(content) > 100:
                return title[:50]
            return content
        except Exception as e:
            logger.error(f"GeminiProvider: Extraction failed: {e}")
            return title[:50]

    async def extract_buyers_premium(self, auction_terms: str, default_pct: float = 15.0) -> float:
        if not auction_terms:
            return default_pct
            
        prompt = f"Extract only the buyer's premium percentage from these auction terms. Return ONLY the number as a float (e.g., 15.0 or 18.5). If you cannot confidently find a buyer's premium percentage, return 'NOT_FOUND'.\n\nTerms: {auction_terms[:1000]}"
        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        
        try:
            content = await self._generate_content(contents)
            content = content.replace('%', '').strip().strip('"').strip("'")
            if content == 'NOT_FOUND':
                return default_pct
            try:
                return float(content)
            except ValueError:
                return default_pct
        except Exception as e:
            logger.error(f"GeminiProvider: Buyer's premium extraction failed: {e}")
            return default_pct

    async def generate_valuation_data(self, title: str, description: str, raw_category: str, image_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        hierarchy_str = json.dumps(HIERARCHY, indent=2)
        
        system_instruction = f"""You are an expert at classifying auction items for resale and preparing eBay search terms.
Your goal is to categorize an item based on the provided hierarchy, generate tags, and provide multiple eBay search queries.

Hierarchy:
{hierarchy_str}

Instructions:
1. Choose exactly one Category from the hierarchy keys.
2. Choose exactly one Type from the selected Category's list.
3. Determine the "item_class": "vehicle" (a complete drivable car/truck), "car_part" (a component for a vehicle), or "other".
4. Extract a clean, standardized "product_name". This should be the full descriptive name of the item including its Brand, model series, and key technical specifications.
5. Determine the "condition": Strictly one of "New", "Used", "Salvage", or "Unknown".
6. Extract specific item attributes into a "tags" JSON dictionary (Brand, Model Name / Number, VIN, etc.).
7. Provide a list of exactly 3 eBay search queries.
8. Determine the "normalized_condition_id": "1000" (New), "3000" (Used), "7000" (For parts/not working).
"""
        user_prompt_text = f"Raw Category: {raw_category}\nTitle: {title}\nDescription: {description[:1000] if description else 'N/A'}"
        
        parts = [{"text": user_prompt_text}]
        
        # Phase 2: Handle multiple images
        if image_urls:
            # Limit to top 5 images to avoid token bloat/timeout
            for url in image_urls[:5]:
                try:
                    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                        img_resp = await client.get(url)
                        img_resp.raise_for_status()
                        content_type = img_resp.headers.get("Content-Type", "image/jpeg")
                        parts.append({
                            "inline_data": {
                                "mime_type": content_type,
                                "data": base64.b64encode(img_resp.content).decode("utf-8")
                            }
                        })
                except Exception as e:
                    logger.error(f"GeminiProvider: Image fetch failed for {url}: {e}")

        contents = [{"role": "user", "parts": parts}]
        
        schema = {
            "type": "object",
            "properties": {
                "category": {"type": "string"},
                "type": {"type": "string"},
                "product_name": {"type": "string"},
                "condition": {"type": "string", "enum": ["New", "Used", "Salvage", "Unknown"]},
                "tags": {"type": "object"},
                "search_queries": {"type": "array", "items": {"type": "string"}},
                "item_class": {"type": "string", "enum": ["vehicle", "car_part", "other"]},
                "normalized_condition_id": {"type": "string", "enum": ["1000", "3000", "7000"]}
            },
            "required": ["category", "type", "product_name", "condition", "tags", "search_queries", "item_class", "normalized_condition_id"]
        }

        try:
            content = await self._generate_content(contents, system_instruction=system_instruction, response_schema=schema)
            result = json.loads(content.strip())
            
            cat = result.get("category", "Other")
            if cat not in HIERARCHY:
                cat = "Other"
            
            raw_tags = result.get("tags", {})
            brand = raw_tags.get("Brand", "") if isinstance(raw_tags, dict) else ""

            return {
                "category": cat,
                "type": result.get("type", "General"),
                "product_name": result.get("product_name", "").strip(),
                "condition": result.get("condition", "Unknown"),
                "tags": raw_tags if isinstance(raw_tags, dict) else {},
                "brand": str(brand).strip(),
                "search_queries": [str(q) for q in result.get("search_queries", []) if q],
                "item_class": result.get("item_class", "other"),
                "normalized_condition_id": str(result.get("normalized_condition_id", "3000"))
            }
            
        except Exception as e:
            logger.error(f"GeminiProvider: Valuation data generation failed: {e}")
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

    async def classify_item(self, title: str, description: str, raw_category: str) -> Dict[str, Any]:
        hierarchy_str = json.dumps(HIERARCHY, indent=2)
        
        system_instruction = f"""You are an expert at classifying auction items for resale.
Your goal is to categorize an item based on the provided hierarchy and generate descriptive tags.

Hierarchy:
{hierarchy_str}

Instructions:
1. Choose exactly one Category from the hierarchy keys.
2. Choose exactly one Type from the selected Category's list.
3. Generate 2-3 short, descriptive tags.
"""
        user_prompt = f"Raw Category: {raw_category}\nTitle: {title}\nDescription: {description[:1000] if description else 'N/A'}"
        contents = [{"role": "user", "parts": [{"text": user_prompt}]}]
        
        schema = {
            "type": "object",
            "properties": {
                "category": {"type": "string"},
                "type": {"type": "string"},
                "tags": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["category", "type", "tags"]
        }
        
        try:
            content = await self._generate_content(contents, system_instruction=system_instruction, response_schema=schema)
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
            logger.error(f"GeminiProvider: Classification failed: {e}")
            return {"category": "Unknown", "type": "General", "tags": []}

    async def classify_item_v2(self, title: str, description: str, raw_category: str) -> Dict[str, Any]:
        hierarchy_str = json.dumps(HIERARCHY, indent=2)
        
        system_instruction = f"""You are an expert at classifying auction items for resale.
Your goal is to categorize an item based on the provided hierarchy and extract basic attributes.

Hierarchy:
{hierarchy_str}

Instructions:
1. Choose exactly one Category from the hierarchy keys.
2. Choose exactly one Type from the selected Category's list.
3. Extract specific item attributes into a "tags" JSON dictionary (e.g., Brand, Model).
"""
        user_prompt = f"Raw Category: {raw_category}\nTitle: {title}\nDescription: {description[:1000] if description else 'N/A'}"
        contents = [{"role": "user", "parts": [{"text": user_prompt}]}]
        
        schema = {
            "type": "object",
            "properties": {
                "category": {"type": "string"},
                "type": {"type": "string"},
                "tags": {"type": "object"}
            },
            "required": ["category", "type", "tags"]
        }
        
        try:
            content = await self._generate_content(contents, system_instruction=system_instruction, response_schema=schema)
            result = json.loads(content.strip())
            cat = result.get("category")
            typ = result.get("type")
            raw_tags = result.get("tags", {})
            
            if cat not in HIERARCHY:
                cat = "Unknown"
            if typ not in HIERARCHY.get(cat, []):
                typ = "General"
                
            return {
                "category": cat,
                "type": typ,
                "tags": raw_tags if isinstance(raw_tags, dict) else {},
                "brand": str(raw_tags.get("Brand", "") if isinstance(raw_tags, dict) else "").strip()
            }
        except Exception as e:
            logger.error(f"GeminiProvider: classify_item_v2 failed: {e}")
            return {"category": "Unknown", "type": "General", "tags": {}, "brand": ""}
