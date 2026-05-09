import os
import json
import httpx
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Load hierarchy for classification
HIERARCHY_PATH = Path(__file__).parent / "hierarchy.json"
def load_hierarchy():
    try:
        if HIERARCHY_PATH.exists():
            with open(HIERARCHY_PATH, "r") as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load hierarchy: {e}")
    return {}

HIERARCHY = load_hierarchy()

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
                    "model": "google/gemma-4-e4b",
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

async def generate_valuation_data(title: str, description: str, raw_category: str) -> dict:
    """
    Uses a local LLM to classify an item, generate tags, and provide a list of eBay search queries
    (from most specific to broader fallback options).
    """
    base_url = os.getenv("LLM_BASE_URL", "http://localhost:1234/v1")
    hierarchy_str = json.dumps(HIERARCHY, indent=2)
    
    system_prompt = f"""You are an expert at classifying auction items for resale and preparing eBay search terms.
Your goal is to categorize an item based on the provided hierarchy, generate tags, and provide multiple eBay search queries.

Hierarchy:
{hierarchy_str}

Instructions:
1. Choose exactly one Category from the hierarchy keys.
2. Choose exactly one Type from the selected Category's list.
3. Generate 2-3 short, descriptive tags (e.g., 'Portable', 'Industrial', 'Vintage', 'New In Box').
4. Determine the "item_class": "vehicle" (a complete drivable car/truck), "car_part" (a component for a vehicle), or "other".
5. Provide a list of exactly 3 eBay search queries:
   - If "item_class" is "car_part", the queries MUST include the vehicle Year, Make, Model, and the Part Name.
   - Otherwise, follow standard progression: [0] Highly specific, [1] Slightly broader, [2] Broad fallback.
6. Return ONLY a JSON object with keys: "category" (string), "type" (string), "tags" (list of strings), "item_class" (string), and "search_queries" (list of strings).
7. Do not include markdown formatting, code blocks, or explanations.
"""
    user_prompt = f"Raw Category: {raw_category}\nTitle: {title}\nDescription: {description[:500] if description else 'N/A'}"
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{base_url}/chat/completions",
                json={
                    "model": "google/gemma-4-e4b",
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
            
            content = content.strip()
            result = json.loads(content)
            
            cat = result.get("category", "Other")
            if cat not in HIERARCHY:
                cat = "Other"
            
            return {
                "category": cat,
                "type": result.get("type", "General"),
                "tags": [str(t) for t in result.get("tags", [])[:3]],
                "search_queries": [str(q) for q in result.get("search_queries", []) if q],
                "item_class": result.get("item_class", "other")
            }
            
    except Exception as e:
        logger.error(f"LLM valuation data generation failed for '{title}': {e}")
        return {
            "category": "Unknown",
            "type": "General",
            "tags": [],
            "search_queries": [title[:50]],
            "item_class": "other"
        }

async def classify_item(title: str, description: str, raw_category: str) -> dict:
    """
    Uses a local LLM to classify an item into the Category > Type hierarchy and generate tags.
    Returns a dict with 'category', 'type', and 'tags'.
    """
    base_url = os.getenv("LLM_BASE_URL", "http://localhost:1234/v1")
    
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
                f"{base_url}/chat/completions",
                json={
                    "model": "google/gemma-4-e4b",
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
            
            # Clean up potential markdown formatting
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            content = content.strip()
            result = json.loads(content)
            
            # Validation
            cat = result.get("category")
            typ = result.get("type")
            tags = result.get("tags", [])
            
            if cat not in HIERARCHY:
                cat = "Other"
            if typ not in HIERARCHY.get(cat, []):
                typ = "General"
                
            return {
                "category": cat,
                "type": typ,
                "tags": [str(t) for t in tags[:3]]
            }
            
    except Exception as e:
        logger.error(f"LLM classification failed for '{title}': {e}")
        return {
            "category": "Unknown",
            "type": "General",
            "tags": []
        }

async def generate_tags_for_item(title: str, description: str, category: str) -> list[str]:
    """
    Legacy wrapper for backward compatibility. Uses classify_item and returns a combined list or just tags.
    """
    result = await classify_item(title, description, category)
    # Combine type into tags or just return descriptive tags
    return result["tags"]
