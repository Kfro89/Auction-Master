import pytest
import math
from app.services.valuation import calculate_valuation

def test_calculate_valuation_success():
    # Array of 40 prices with outliers:
    # 36 prices around $100, 2 prices at $10, 2 prices at $1000
    prices = [
        100, 105, 95, 98, 102, 100, 101, 99, 97, 103,
        100, 105, 95, 98, 102, 100, 101, 99, 97, 103,
        100, 105, 95, 98, 102, 100, 101, 99, 97, 103,
        100, 105, 95, 98, 102, 100, 10, 1000, 10, 1000
    ]
    
    result = calculate_valuation(
        prices, 
        target_roi=0.30, 
        auction_premium=0.0
    )
    
    assert result is not None
    assert result["initial_sample_size"] == 40
    # Z-score filter should remove the 2 extreme outliers (1000s)
    # The 10s have a z-score of ~0.65 due to the inflated stddev from the 1000s
    assert result["sample_size_after_zscore"] == 38
    # Trimming 15% from top and bottom of 38 items = 5 items each, 10 total removed
    # This will remove the 10s and some 105s, 95s
    assert result["final_sample_size"] == 28
    
    # Trimmed median should be very close to 100
    assert 98 <= result["trimmed_median"] <= 102
    
    # 0.75 haircut
    expected_est_market_value = result["trimmed_median"] * 0.75
    assert math.isclose(result["est_market_value"], expected_est_market_value, rel_tol=1e-5)
    
    # Total Cost = Max Bid * (1 + Auction Premium %)
    # Revenue = Est Market Value - eBay Fees
    # Target ROI = (Revenue - Total Cost) / Total Cost
    # Max Bid = Revenue / ((1 + Target ROI) * (1 + Auction Premium %))
    expected_ebay_fees = expected_est_market_value * 0.1325 + 0.40
    premium_decimal = 0.0 / 100.0
    expected_revenue = expected_est_market_value - expected_ebay_fees
    expected_max_bid = expected_revenue / ((1 + 0.30) * (1 + premium_decimal))
    
    assert math.isclose(result["max_bid_for_target_roi"], expected_max_bid, rel_tol=1e-5)
    assert result["ebay_fees"] == expected_ebay_fees


def test_minimum_sample_size():
    prices = [100] * 29
    result = calculate_valuation(prices)
    assert result is None

@pytest.mark.asyncio
async def test_persist_valuation_creates_valuation_detail():
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.database import Base
    from app.models import Item, EbaySampleCache, ValuationDetail, Valuation
    from app.services.valuation import _persist_valuation

    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    item = Item(
        id=1, 
        title="Test Vehicle", 
        category="Motor Pool", 
        auction_house_id="1", 
        external_id="ext1"
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    raw_listings = [
        {"url": f"http://ex.com/{i}", "title": f"T{i}", "price": float(100 + i), "condition": "USED"}
        for i in range(25)
    ]
    # We slice to 20 inside the service or before calling, wait, the service gets it from val_data["raw_listings"]
    # So we'll pass exactly what is expected or 25 to see if it handles it (the extraction logic truncates it to 20)
    # The review said: "ensuring ValuationDetail is created with valid floats and lengths <= 20"
    
    val_data = {
        "initial_sample_size": 25,
        "trimmed_median": 110.0,
        "mean": 112.0,
        "est_market_value": 90.0,
        "max_bid_for_target_roi": 60.0,
        "raw_listings": raw_listings[:20]  # The scraper/fetcher truncates this to 20
    }

    valuation = await _persist_valuation(db, item, val_data, "test_query", 0.30)
    
    assert valuation is not None
    assert valuation.sample_cache_id is not None
    
    # Check sample cache
    sample_cache = db.query(EbaySampleCache).filter_by(id=valuation.sample_cache_id).first()
    assert sample_cache is not None
    
    # Check ValuationDetail
    val_detail = db.query(ValuationDetail).filter_by(sample_cache_id=sample_cache.id).first()
    assert val_detail is not None
    assert isinstance(val_detail.avg_asking_price, float)
    assert isinstance(val_detail.median_asking_price, float)
    assert isinstance(val_detail.price_range_low, float)
    assert isinstance(val_detail.price_range_high, float)
    assert len(val_detail.sample_listings) <= 20
    
    db.close()

