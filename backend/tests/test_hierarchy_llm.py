import asyncio
import os
import json
import pytest
from app.services.llm import classify_item

@pytest.mark.asyncio
async def test_classification():
    test_items = [
        {
            "title": "Dell Latitude 5420 Laptop i5-1145G7 16GB RAM 256GB SSD",
            "desc": "Used Dell laptop in good condition. Power adapter included.",
            "raw_cat": "Computers"
        },
        {
            "title": "Milwaukee M18 FUEL 1/2 in. Drill Driver Kit",
            "desc": "Brand new in box. Includes two 5.0Ah batteries and charger.",
            "raw_cat": "Tools"
        },
        {
            "title": "Vintage Nikon F2 35mm Film Camera with 50mm f/1.4 Lens",
            "desc": "Classic film camera. Shutter fires, lens clear. Sold as-is.",
            "raw_cat": "Photography"
        }
    ]

    print("Starting classification test...\n")
    
    for item in test_items:
        print(f"Testing item: {item['title']}")
        result = await classify_item(item['title'], item['desc'], item['raw_cat'])
        print(f"Result: {json.dumps(result, indent=2)}")
        print("-" * 30)

if __name__ == "__main__":
    # Ensure we are in the right directory or PYTHONPATH is set
    # Run with: PYTHONPATH=. python backend/tests/test_hierarchy_llm.py
    asyncio.run(test_classification())
