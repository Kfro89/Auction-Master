from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ScrapedAuction(BaseModel):
    id: str
    name: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class ScrapedLot(BaseModel):
    id: str
    lot_number: Optional[str] = None
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    image_url: Optional[str] = None
    current_bid: float = 0.0
    end_time: Optional[datetime] = None

class ScrapedBid(BaseModel):
    id: str
    title: str
    status: str
    user_bid_status: str
    current_bid: float = 0.0
    user_bid: float = 0.0
    proxy_bid: float = 0.0
    end_time: Optional[datetime] = None
