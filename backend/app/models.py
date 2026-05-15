from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base
import datetime

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
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    location_address = Column(String)
    location_city = Column(String)
    location_state = Column(String)
    location_zip = Column(String)

    auction_house = relationship("AuctionHouse", back_populates="auctions")
    items = relationship("Item", back_populates="auction", cascade="all, delete-orphan")


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
    end_time = Column(DateTime(timezone=True))
    status = Column(String) # open, closed, passed
    
    # Discovery and Tracking
    url = Column(String)
    image_url = Column(String)
    first_seen_at = Column(DateTime(timezone=True))
    last_seen_at = Column(DateTime(timezone=True))
    
    # Valuation parameters
    raw_condition = Column(String)
    normalized_condition_id = Column(String) # eBay condition ID
    brand = Column(String)
    mpn = Column(String)
    
    # Vehicle specific parameters
    vin = Column(String, index=True)
    vehicle_year = Column(Integer)
    vehicle_make = Column(String)
    vehicle_model = Column(String)
    vehicle_trim = Column(String)
    
    # Enrichment
    category = Column(String)
    tags = Column(JSON, default=list)
    search_queries = Column(JSON, default=list)
    
    auction_house = relationship("AuctionHouse", back_populates="items")
    auction = relationship("Auction", back_populates="items")
    valuation = relationship("Valuation", back_populates="item", uselist=False, cascade="all, delete-orphan")
    sample_caches = relationship("EbaySampleCache", cascade="all, delete-orphan")
    
    images = Column(JSON, default=list)
    shipping_cost_est = Column(Float, default=0.0)
    user_bids = relationship("UserBidActivity", back_populates="item", uselist=False, cascade="all, delete-orphan")
    
    is_user_bidding = Column(Boolean, default=False)
    is_watched = Column(Boolean, default=False, server_default='false')


class Setting(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(String) # Stored as string or JSON string


class ConditionMap(Base):
    __tablename__ = "condition_map"

    id = Column(Integer, primary_key=True, index=True)
    auction_house_id = Column(Integer, ForeignKey("auction_houses.id"), nullable=False)
    raw_pattern = Column(String, nullable=False) # e.g., "Used - Good"
    ebay_condition_id = Column(String, nullable=False) # e.g., "3000"

class EbaySampleCache(Base):
    __tablename__ = "ebay_sample_cache"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False, index=True)
    query_signature = Column(String, index=True, nullable=False)
    sample_size = Column(Integer)
    trimmed_median = Column(Float)
    iqr = Column(Float)
    mean = Column(Float)
    confidence_score = Column(Float)
    fetched_at = Column(DateTime(timezone=True))
    ttl = Column(DateTime(timezone=True))

class Valuation(Base):
    __tablename__ = "valuations"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False, index=True)
    sample_cache_id = Column(Integer, ForeignKey("ebay_sample_cache.id"))
    est_market_value = Column(Float)
    market_adjustment_factor_applied = Column(Float)
    max_bid_for_target_roi = Column(Float)
    target_roi_pct = Column(Float)
    computed_at = Column(DateTime(timezone=True))

    item = relationship("Item", back_populates="valuation")
    sample_cache = relationship("EbaySampleCache")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String, index=True)
    title = Column(String)
    drafted_title = Column(String)
    drafted_description = Column(String)
    ebay_category_id = Column(String)
    buy_price = Column(Float)
    estimated_price = Column(Float)
    images = Column(JSON, default=list)
    status = Column(String, default='staged') # staged, listed, sold
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)


class UserBidActivity(Base):
    __tablename__ = "user_bid_activity"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False, unique=True)
    user_id = Column(Integer, default=1)
    current_bid_amount = Column(Float, default=0.0)
    user_bid_amount = Column(Float, default=0.0)
    user_proxy_bid = Column(Float, default=0.0)
    user_bid_status = Column(String) # winning, outbid, reserve_not_met, outbid_near
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    item = relationship("Item", back_populates="user_bids")


class ValuationDetail(Base):
    __tablename__ = "valuation_details"
    id = Column(Integer, primary_key=True, index=True)
    sample_cache_id = Column(Integer, ForeignKey("ebay_sample_cache.id"), nullable=False, unique=True)
    sample_listings = Column(JSON, default=list)
    avg_asking_price = Column(Float)
    median_asking_price = Column(Float)
    price_range_low = Column(Float)
    price_range_high = Column(Float)
    
    sample_cache = relationship("EbaySampleCache")


from sqlalchemy import UniqueConstraint

class UserAuctionCredential(Base):
    __tablename__ = "user_auction_credentials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False) # To tie to the user system (mocked or actual)
    auction_house = Column(String, index=True, nullable=False) # e.g., 'public_surplus'
    encrypted_cookies = Column(String, nullable=False)
    user_agent = Column(String)
    is_valid = Column(Boolean, default=True)
    last_verified_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'auction_house', name='uq_user_auction_house'),
    )
