import sys
import os
import statistics

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.services.valuation import calculate_valuation

def test_calculate_valuation_aggregation():
    prices = [100.0, 110.0, 120.0, 130.0, 140.0, 150.0, 160.0, 170.0, 180.0, 190.0, 200.0] * 3 # 33 items to pass min_size
    raw_listings = [
        {"price": 100.0, "title": "Item 1"},
        {"price": 200.0, "title": "Item 2"},
        {"price": 150.0, "title": "Item 3"},
    ]
    
    result = calculate_valuation(prices, raw_listings=raw_listings, target_roi=0.30, auction_premium=15.0)
    
    assert result is not None
    assert result["avg_asking_price"] == 150.0
    assert result["median_asking_price"] == 150.0
    assert result["price_range_low"] == 100.0
    assert result["price_range_high"] == 200.0
    assert len(result["raw_listings"]) == 3
    
    print("✅ test_calculate_valuation_aggregation passed!")

def test_calculate_valuation_math():
    # Test with known values
    # Prices: 100 * 30 -> mean=100, median=100
    prices = [100.0] * 30
    # est_market_value = 100 * 1.0 = 100.0
    # ebay_fees = 100 * 0.1325 + 0.40 = 13.25 + 0.40 = 13.65
    # revenue = 100 - 13.65 = 86.35
    # max_bid = 86.35 / ((1 + 0.3) * (1 + 0.15)) = 86.35 / (1.3 * 1.15) = 86.35 / 1.495 = 57.759...
    
    result = calculate_valuation(prices, target_roi=0.30, auction_premium=15.0)
    
    assert result is not None
    assert round(result["est_market_value"], 2) == 100.0
    assert round(result["ebay_fees"], 4) == 13.65
    assert round(result["max_bid_for_target_roi"], 2) == 57.76
    
    print("✅ test_calculate_valuation_math passed!")

if __name__ == "__main__":
    try:
        test_calculate_valuation_aggregation()
        test_calculate_valuation_math()
        print("ALL TESTS PASSED")
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")
        sys.exit(1)
