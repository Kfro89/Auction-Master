from typing import Optional, List
from ..models import InventoryItem, PackagingConfiguration

async def generate_ai_listing(item: InventoryItem, html_template: Optional[str] = None) -> dict:
    """
    Stub for AI Listing Generation.
    In Phase 2, this will call an LLM with images and item details.
    """
    return {
        "title": f"AI Draft: {item.title}",
        "description": f"<div class='template'>{html_template or ''}</div>\n<p>AI Generated description for {item.title}</p>"
    }

async def select_best_packaging(item: InventoryItem, db) -> Optional[PackagingConfiguration]:
    """
    Selects the smallest volume packaging configuration that fits the item.
    """
    if not all([item.length, item.width, item.height]):
        return None
    
    # Sort by dims to normalize (length >= width >= height)
    item_dims = sorted([item.length, item.width, item.height], reverse=True)
    
    # Fetch all active configs
    configs = db.query(PackagingConfiguration).filter(PackagingConfiguration.is_active == True).all()
    
    best_fit = None
    min_volume = float('inf')
    
    for config in configs:
        config_dims = sorted([config.length, config.width, config.height], reverse=True)
        
        # Check if item fits in this config
        if (item_dims[0] <= config_dims[0] and 
            item_dims[1] <= config_dims[1] and 
            item_dims[2] <= config_dims[2]):
            
            volume = config.length * config.width * config.height
            if volume < min_volume:
                min_volume = volume
                best_fit = config
                
    return best_fit
