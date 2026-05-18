import asyncio
import logging
from sqlalchemy.orm import Session
from ..models import Item
from .llm import generate_valuation_data

logger = logging.getLogger(__name__)

async def enrich_pending_items(db: Session, batch_size: int = 10):
    """
    Independent service to categorize and tag items using AI.
    Processes items with processing_status='pending_enrichment'.
    Supports ResearchItem, BidItem, and legacy Item.
    """
    from ..models import ResearchItem, BidItem, Item
    
    enriched_count = 0
    
    # Process models in order of priority/volume
    model_types = [ResearchItem, BidItem, Item]
    
    for model in model_types:
        remaining_batch = batch_size - enriched_count
        if remaining_batch <= 0:
            break
            
        items = db.query(model).filter(model.processing_status == "pending_enrichment").limit(remaining_batch).all()
        if not items:
            continue

        logger.info(f"Enrichment: Processing {len(items)} {model.__name__} items...")
        
        tasks = []
        for item in items:
            tasks.append(_enrich_single_item(item))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, result in enumerate(results):
            item = items[i]
            if isinstance(result, Exception):
                logger.error(f"Enrichment failed for {model.__name__} {item.id}: {result}")
                item.processing_status = "error"
            else:
                cat_name, tags, brand, search_queries, normalized_condition_id, product_name, condition = result
                item.category = cat_name
                item.tags = tags
                item.brand = brand
                item.search_queries = search_queries
                item.normalized_condition_id = normalized_condition_id
                item.product_name = product_name
                item.condition = condition
                item.processing_status = "pending_valuation"
                enriched_count += 1
                
        db.commit()
        
    return enriched_count

async def _enrich_single_item(item):
    """Helper to process item tags asynchronously. Model agnostic."""
    raw_category = f"Category {item.category}" if item.category else "Unknown"
    
    classification = await generate_valuation_data(item.title, item.description or "", raw_category)
    
    if classification.get('category') == "Unknown" and item.image_url:
        logger.info(f"Category unknown for '{item.title}', retrying with image evaluation...")
        classification = await generate_valuation_data(
            item.title,
            item.description or "",
            raw_category,
            image_url=item.image_url
        )
    
    structured_category = f"{classification.get('category', 'Unknown')} > {classification.get('type', 'General')}"
    brand = classification.get('brand', '')
    tags = classification.get('tags', {})
    
    if brand and "Brand" not in tags:
        tags["Brand"] = brand

    return (
        structured_category, 
        tags, 
        brand, 
        classification['search_queries'], 
        classification.get('normalized_condition_id', '3000'),
        classification.get('product_name', ''),
        classification.get('condition', 'Unknown')
    )
