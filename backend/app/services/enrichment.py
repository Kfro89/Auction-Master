import asyncio
import logging
from typing import Optional
from sqlalchemy.orm import Session
from ..models import ResearchItem, BidItem
from .ai_providers import get_active_provider, get_ai_concurrency_limit

logger = logging.getLogger(__name__)

async def enrich_pending_items(db: Session, batch_size: Optional[int] = None):
    """
    Independent service to categorize and tag items using AI.
    Processes items with processing_status='pending_enrichment'.
    """
    from ..models import ResearchItem, BidItem
    
    # 1. Determine provider and concurrency limit
    provider = get_active_provider(db)
    concurrency_limit = get_ai_concurrency_limit(db)
    
    # If no batch_size provided, use the concurrency limit
    if batch_size is None:
        batch_size = concurrency_limit
        
    enriched_text_count = 0
    enriched_multimodal_count = 0
    
    # Process models in order of priority/volume
    model_types = [ResearchItem, BidItem]
    
    for model in model_types:
        remaining_batch = batch_size - (enriched_text_count + enriched_multimodal_count)
        if remaining_batch <= 0:
            break
            
        items = db.query(model).filter(model.processing_status == "pending_enrichment").limit(remaining_batch).all()
        if not items:
            continue

        logger.info(f"Enrichment: Processing {len(items)} {model.__name__} items using {provider.__class__.__name__}...")
        
        tasks = []
        for item in items:
            tasks.append(_enrich_single_item(item, provider))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, result in enumerate(results):
            item = items[i]
            if isinstance(result, Exception):
                logger.error(f"Enrichment failed for {model.__name__} {item.id}: {result}")
                item.processing_status = "error"
            else:
                cat_name, tags, brand, search_queries, normalized_condition_id, product_name, condition, is_multimodal = result
                item.category = cat_name
                item.tags = tags
                item.brand = brand
                item.search_queries = search_queries
                item.normalized_condition_id = normalized_condition_id
                item.product_name = product_name
                item.condition = condition
                item.processing_status = "pending_valuation"
                if is_multimodal:
                    enriched_multimodal_count += 1
                else:
                    enriched_text_count += 1
                
        db.commit()
        
    return enriched_text_count, enriched_multimodal_count

async def _enrich_single_item(item, provider):
    """Helper to process item tags asynchronously. Model agnostic."""
    raw_category = f"Category {item.category}" if item.category else "Unknown"
    
    # Collect all available images
    image_urls = []
    if item.image_url:
        image_urls.append(item.image_url)
    if hasattr(item, 'images') and isinstance(item.images, list):
        for img in item.images:
            if img not in image_urls:
                image_urls.append(img)
    
    # Stage 1: Text-only classification
    classification = {}
    is_multimodal = False
    if hasattr(provider, 'classify_item_v2'):
        text_classification = await provider.classify_item_v2(item.title, item.description or "", raw_category)
        if text_classification.get('category') != "Unknown":
            # Text-based classification succeeded. Prepare fallback values for multimodal fields.
            classification = text_classification
            classification['search_queries'] = [item.title[:50]]
            classification['normalized_condition_id'] = '3000'
            classification['product_name'] = item.title[:50]
            classification['condition'] = 'Unknown'
            
    # Stage 2: Multimodal (Fallback/Valuation reasoning)
    if not classification or classification.get('category') == "Unknown":
        logger.info(f"Triggering multimodal valuation for '{item.title}'...")
        is_multimodal = True
        classification = await provider.generate_valuation_data(
            item.title,
            item.description or "",
            raw_category,
            image_urls=image_urls
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
        classification.get('search_queries', []), 
        classification.get('normalized_condition_id', '3000'),
        classification.get('product_name', ''),
        classification.get('condition', 'Unknown'),
        is_multimodal
    )
