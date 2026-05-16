from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any
from datetime import datetime, timedelta

from ..database import get_db
from .. import models
from ..auth import get_current_user

router = APIRouter()

@router.get("/pnl")
def get_pnl_report(timeframe: str = "YTD", db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # 1. Determine start date
    now = datetime.utcnow()
    if timeframe == "30D":
        start_date = now - timedelta(days=30)
    elif timeframe == "90D":
        start_date = now - timedelta(days=90)
    elif timeframe == "YTD":
        start_date = datetime(now.year, 1, 1)
    else:
        start_date = datetime(2000, 1, 1) # All time

    # 2. Get Gross Inventory Profit (Module 3 logic)
    # Gross Profit = Sold Price - Total COGS - eBay Fees - Actual Shipping
    # For now, we'll sum total_paid from EbayOrder and subtract related costs
    orders = db.query(models.EbayOrder).filter(models.EbayOrder.paid_at >= start_date).all()
    
    total_revenue = sum(o.total_paid for o in orders)
    total_ebay_fees = sum(o.ebay_fees or 0.0 for o in orders)
    total_shipping_costs = sum(o.actual_shipping_cost or 0.0 for o in orders)
    
    # We also need to subtract the original COGS of these items
    # In a full impl, we'd traverse order -> listing -> inventory_item -> cost_line_items
    total_cogs = 0.0
    for order in orders:
        if order.listing and order.listing.inventory_item:
            inv_item = order.listing.inventory_item
            item_cogs = sum(c.amount for c in inv_item.cost_line_items)
            total_cogs += item_cogs

    gross_inventory_profit = total_revenue - total_ebay_fees - total_shipping_costs - total_cogs

    # 3. Get Operational Expenses (Module 4 logic)
    expenses = db.query(models.BusinessExpense).filter(models.BusinessExpense.date >= start_date).all()
    total_operational_overhead = sum(e.amount for e in expenses)

    # 4. Final Calculation
    net_business_income = gross_inventory_profit - total_operational_overhead

    return {
        "timeframe": timeframe,
        "revenue": total_revenue,
        "cogs": total_cogs,
        "ebayFees": total_ebay_fees,
        "shippingCosts": total_shipping_costs,
        "grossProfit": gross_inventory_profit,
        "operationalOverhead": total_operational_overhead,
        "netBusinessIncome": net_business_income,
        "margin": (net_business_income / total_revenue * 100) if total_revenue > 0 else 0
    }
