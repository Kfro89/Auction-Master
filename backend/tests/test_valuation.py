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
    
    # Max Bid = (est_market_value / (1 + Target ROI)) - eBay Fees - Auction Premium
    # eBay Fees = est_market_value * 0.1325 + 0.40
    expected_ebay_fees = expected_est_market_value * 0.1325 + 0.40
    expected_max_bid = (expected_est_market_value / (1 + 0.30)) - expected_ebay_fees - 0.0
    
    assert math.isclose(result["max_bid_for_target_roi"], expected_max_bid, rel_tol=1e-5)
    assert result["ebay_fees"] == expected_ebay_fees


def test_minimum_sample_size():
    prices = [100] * 29
    result = calculate_valuation(prices)
    assert result is None
