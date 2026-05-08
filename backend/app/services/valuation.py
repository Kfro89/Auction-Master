import math
import statistics
from typing import List, Optional, Dict, Any

def calculate_valuation(prices: List[float], target_roi: float = 0.30, auction_premium: float = 0.0) -> Optional[Dict[str, Any]]:
    initial_sample_size = len(prices)
    
    if initial_sample_size < 30:
        return None
        
    mean_price = statistics.mean(prices)
    try:
        stdev_price = statistics.stdev(prices)
    except statistics.StatisticsError:
        stdev_price = 0.0
        
    if stdev_price == 0.0:
        valid_prices = prices
    else:
        valid_prices = [p for p in prices if abs((p - mean_price) / stdev_price) <= 2]
        
    sample_size_after_zscore = len(valid_prices)
    if sample_size_after_zscore == 0:
        return None
        
    valid_prices.sort()
    
    trim_count = int(sample_size_after_zscore * 0.15)
    
    if trim_count * 2 >= sample_size_after_zscore:
        trimmed_prices = valid_prices
    else:
        trimmed_prices = valid_prices[trim_count : sample_size_after_zscore - trim_count]
        
    final_sample_size = len(trimmed_prices)
    
    if final_sample_size == 0:
        return None
        
    trimmed_median = statistics.median(trimmed_prices)
    est_market_value = trimmed_median * 0.75
    
    ebay_fees = est_market_value * 0.1325 + 0.40
    
    max_bid_for_target_roi = (est_market_value / (1 + target_roi)) - ebay_fees - auction_premium
    
    return {
        "initial_sample_size": initial_sample_size,
        "sample_size_after_zscore": sample_size_after_zscore,
        "final_sample_size": final_sample_size,
        "trimmed_median": trimmed_median,
        "est_market_value": est_market_value,
        "ebay_fees": ebay_fees,
        "max_bid_for_target_roi": max_bid_for_target_roi
    }
