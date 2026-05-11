"""
LLM-based category classifier for mapping auction items to the
universal Public Surplus category taxonomy.

Used for non-PS sources (Whitley, Roller, Dickensheet, etc.)
where items don't arrive pre-categorized.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)

PS_CATEGORIES = [
    "Airport", "Animals and Livestock", "Aviation", "Building", "Clothing",
    "Collectibles", "Computers", "Electronics", "Food Supply", "For Children",
    "Furniture", "Heavy Equipment", "Heavy Equipment Parts", "Housewares",
    "Industrial Equipment", "Jewelry", "Marine", "Medical", "Motor Pool",
    "Motor Pool Parts", "Music and Arts", "Office Equipment", "Outdoor Equipment",
    "Real Estate", "School Supplies", "Scrap", "Sporting Goods", "Storage",
]

CLASSIFICATION_PROMPT = """You are classifying auction items into exactly one of these categories:
{categories}

Given the item title and description below, return ONLY the category name from the list above. Nothing else.

Title: {title}
Description: {description}

Category:"""


def classify_item_rule_based(title: str, description: str = "") -> Optional[str]:
    """
    Fast rule-based classifier using keyword matching.
    Falls back to None if no confident match — caller can then use LLM.
    """
    text = f"{title} {description}".lower()

    rules = [
        (["truck", "car", "van", "suv", "sedan", "pickup", "vehicle", "ford", "chevy",
          "dodge", "toyota", "honda", "jeep", "trailer", "bus", "ambulance"], "Motor Pool"),
        (["engine", "transmission", "alternator", "tire", "rim", "bumper", "fender",
          "headlight", "taillight", "brake", "muffler", "exhaust"], "Motor Pool Parts"),
        (["excavator", "loader", "backhoe", "dozer", "bulldozer", "crane", "forklift",
          "tractor", "grader", "roller", "skid steer", "bobcat"], "Heavy Equipment"),
        (["hydraulic", "bucket", "blade", "tracks", "boom", "attachment"], "Heavy Equipment Parts"),
        (["computer", "laptop", "desktop", "server", "monitor", "printer", "keyboard",
          "mouse", "ipad", "tablet", "chromebook", "macbook"], "Computers"),
        (["tv", "television", "radio", "speaker", "camera", "projector", "dvd",
          "audio", "video", "electronic", "cable", "charger", "battery"], "Electronics"),
        (["desk", "chair", "table", "cabinet", "shelf", "bookcase", "couch",
          "sofa", "filing", "credenza", "locker"], "Furniture"),
        (["copier", "fax", "shredder", "stapler", "paper", "binder",
          "whiteboard", "office"], "Office Equipment"),
        (["mower", "trimmer", "blower", "chainsaw", "lawn", "garden",
          "snow", "plow", "park", "playground", "bench"], "Outdoor Equipment"),
        (["boat", "kayak", "canoe", "marine", "outboard", "anchor", "dock"], "Marine"),
        (["airplane", "aircraft", "helicopter", "aviation", "hangar"], "Aviation"),
        (["airport", "runway", "terminal"], "Airport"),
        (["medical", "hospital", "surgical", "wheelchair", "defibrillator",
          "exam table", "gurney", "stethoscope"], "Medical"),
        (["scrap", "salvage", "metal", "junk", "recycl"], "Scrap"),
        (["gym", "treadmill", "bicycle", "bike", "weights", "sporting",
          "golf", "fishing", "hunting", "exercise"], "Sporting Goods"),
        (["jewelry", "ring", "necklace", "bracelet", "watch", "gold", "silver"], "Jewelry"),
        (["collectible", "antique", "coin", "stamp", "art", "painting"], "Collectibles"),
        (["clothing", "uniform", "jacket", "boots", "shoes", "vest"], "Clothing"),
        (["food", "kitchen", "refrigerator", "freezer", "oven", "stove",
          "dishwasher", "microwave"], "Food Supply"),
        (["toy", "children", "school supplies", "crayons", "books"], "For Children"),
        (["building", "lumber", "brick", "concrete", "roofing", "window",
          "door", "plumbing", "hvac", "electrical panel"], "Building"),
        (["pot", "pan", "dishes", "utensil", "housewares", "vacuum",
          "iron", "blender", "toaster"], "Housewares"),
        (["piano", "guitar", "instrument", "drum", "music", "art supplies",
          "easel", "canvas", "paint"], "Music and Arts"),
        (["storage", "container", "shed", "bin", "pallet", "rack"], "Storage"),
        (["cow", "horse", "livestock", "animal", "saddle", "feed"], "Animals and Livestock"),
        (["real estate", "property", "land", "house", "building lot"], "Real Estate"),
        (["school", "desk", "chalkboard", "backpack", "textbook"], "School Supplies"),
        (["industrial", "generator", "compressor", "welder", "drill press",
          "lathe", "mill", "pump", "motor"], "Industrial Equipment"),
    ]

    for keywords, category in rules:
        if any(kw in text for kw in keywords):
            return category

    return None


def classify_item(title: str, description: str = "") -> str:
    """
    Classify an item into the PS category taxonomy.
    Uses rule-based matching first; LLM integration can be added later.
    Returns the category name string.
    """
    result = classify_item_rule_based(title, description)
    if result:
        return result

    # TODO: Add LLM-based classification as fallback when API key is configured.
    # For now, return a safe default.
    logger.debug(f"Could not classify item: {title[:80]}")
    return "Office Equipment"  # Safe default for government surplus
