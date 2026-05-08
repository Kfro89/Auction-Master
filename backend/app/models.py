from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class AuctionHouse(Base):
    __tablename__ = "auction_houses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    website_key = Column(String, unique=True, index=True, nullable=False) # e.g., 'rmeb', 'rol', 'ps'
    base_url = Column(String, nullable=False)
    buyer_premium_pct = Column(Float, nullable=False)
    cash_discount_pct = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    terms_url = Column(String)

    auctions = relationship("Auction", back_populates="auction_house")
    items = relationship("Item", back_populates="auction_house")


class Auction(Base):
    __tablename__ = "auctions"

    id = Column(Integer, primary_key=True, index=True)
    auction_house_id = Column(Integer, ForeignKey("auction_houses.id"), nullable=False)
    external_id = Column(String, index=True, nullable=False) # e.g., '24953'
    title = Column(String, nullable=False)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    location_address = Column(String)
    location_city = Column(String)
    location_state = Column(String)
    location_zip = Column(String)

    auction_house = relationship("AuctionHouse", back_populates="auctions")
    items = relationship("Item", back_populates="auction")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    auction_house_id = Column(Integer, ForeignKey("auction_houses.id"), nullable=False)
    auction_id = Column(Integer, ForeignKey("auctions.id"), nullable=True)
    
    external_id = Column(String, index=True, nullable=False) # lot_id
    lot_number = Column(String)
    title = Column(String, nullable=False)
    description = Column(String)
    
    current_bid = Column(Float, default=0.0)
    bid_count = Column(Integer, default=0)
    end_time = Column(DateTime)
    status = Column(String) # open, closed, passed
    
    # Discovery and Tracking
    url = Column(String)
    image_url = Column(String)
    first_seen_at = Column(DateTime)
    last_seen_at = Column(DateTime)
    
    # Valuation parameters
    raw_condition = Column(String)
    normalized_condition_id = Column(String) # eBay condition ID
    brand = Column(String)
    mpn = Column(String)
    
    auction_house = relationship("AuctionHouse", back_populates="items")
    auction = relationship("Auction", back_populates="items")


class ConditionMap(Base):
    __tablename__ = "condition_map"

    id = Column(Integer, primary_key=True, index=True)
    auction_house_id = Column(Integer, ForeignKey("auction_houses.id"), nullable=False)
    raw_pattern = Column(String, nullable=False) # e.g., "Used - Good"
    ebay_condition_id = Column(String, nullable=False) # e.g., "3000"
