import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import Item, UserBidActivity, ValuationDetail, AuctionHouse, Auction, EbaySampleCache
import datetime

@pytest.fixture(scope="module")
def engine():
    return create_engine("sqlite:///:memory:")

@pytest.fixture(scope="module")
def tables(engine):
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

@pytest.fixture
def db_session(engine, tables):
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    yield session
    session.close()
    transaction.rollback()
    connection.close()

def test_user_bid_activity_relationship(db_session):
    # Setup necessary parent objects
    house = AuctionHouse(name="Test House", website_key="th", base_url="http://test.com", buyer_premium_pct=10.0)
    db_session.add(house)
    db_session.commit()
    
    item = Item(auction_house_id=house.id, external_id="123", title="Test Item")
    db_session.add(item)
    db_session.commit()
    
    # Test UserBidActivity
    bid_activity = UserBidActivity(
        item_id=item.id,
        user_id=1,
        current_bid_amount=10.0,
        user_bid_amount=15.0,
        user_proxy_bid=20.0,
        user_bid_status="winning"
    )
    db_session.add(bid_activity)
    db_session.commit()
    
    assert item.user_bids.current_bid_amount == 10.0
    assert item.user_bids.user_bid_status == "winning"

def test_valuation_detail_relationship(db_session):
    house = AuctionHouse(name="Test House 2", website_key="th2", base_url="http://test.com", buyer_premium_pct=10.0)
    db_session.add(house)
    db_session.commit()
    
    item = Item(auction_house_id=house.id, external_id="456", title="Test Item 2")
    db_session.add(item)
    db_session.commit()
    
    sample_cache = EbaySampleCache(
        item_id=item.id,
        query_signature="test_query",
        sample_size=10,
        trimmed_median=50.0,
        iqr=5.0,
        mean=52.0,
        confidence_score=0.9
    )
    db_session.add(sample_cache)
    db_session.commit()
    
    valuation_detail = ValuationDetail(
        sample_cache_id=sample_cache.id,
        sample_listings=[{"title": "listing1", "price": 50}],
        avg_asking_price=50.0,
        median_asking_price=50.0,
        price_range_low=45.0,
        price_range_high=55.0
    )
    db_session.add(valuation_detail)
    db_session.commit()
    
    assert valuation_detail.sample_cache.id == sample_cache.id
