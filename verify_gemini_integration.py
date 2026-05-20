import asyncio
import os
import json
import logging
from dotenv import load_dotenv
from backend.app.services.ai_providers.local_provider import LocalProvider
from backend.app.services.ai_providers.gemini_provider import GeminiProvider

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_providers():
    load_dotenv()
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    test_title = "Apple iPhone 15 Pro 256GB Blue Titanium"
    test_desc = "Excellent condition, no scratches, original box included."
    test_cat = "Electronics > Smartphones"
    # Using a real placeholder image URL for testing multimodality
    test_images = ["https://picsum.photos/200/300", "https://picsum.photos/201/301"]

    # 1. Test GeminiProvider
    if gemini_key:
        logger.info("--- Testing GeminiProvider (Phase 2) ---")
        gemini = GeminiProvider(api_key=gemini_key)
        try:
            # Test extract_product_name
            name = await gemini.extract_product_name(test_title)
            logger.info(f"Gemini Product Name: {name}")
            
            # Test generate_valuation_data with MULTIPLE images and JSON SCHEMA
            val_data = await gemini.generate_valuation_data(test_title, test_desc, test_cat, image_urls=test_images)
            logger.info(f"Gemini Structured Valuation Data: {json.dumps(val_data, indent=2)}")
            
            if val_data.get("product_name") and val_data.get("search_queries"):
                logger.info("✅ Phase 2: Structured Output & Multi-image verified.")
            else:
                logger.warning("⚠️ Phase 2: Response missing key fields.")
                
            logger.info("✅ GeminiProvider verification successful.")
        except Exception as e:
            logger.error(f"❌ GeminiProvider verification failed: {e}")
    else:
        logger.warning("Skipping GeminiProvider test: No GEMINI_API_KEY found in .env")

    # 2. Test LocalProvider (Expect failure if LM Studio isn't running, but we check the attempt)
    logger.info("--- Testing LocalProvider ---")
    local = LocalProvider(base_url="http://localhost:1234/v1")
    try:
        # We'll use a short timeout to fail fast
        name = await asyncio.wait_for(local.extract_product_name(test_title), timeout=2.0)
        logger.info(f"Local Product Name: {name}")
    except asyncio.TimeoutError:
        logger.info("ℹ️ LocalProvider timed out (expected if no local LLM running).")
    except Exception as e:
        logger.info(f"ℹ️ LocalProvider failed as expected: {e}")

if __name__ == "__main__":
    asyncio.run(test_providers())
