import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db, Base
from app.auth import get_current_user
from app.models import Item

# In-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

def override_get_current_user():
    return "admin"

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(autouse=True)
def clear_db():
    # Clear tables between tests
    db = TestingSessionLocal()
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.commit()
    db.close()

def test_toggle_watch_status():
    db = TestingSessionLocal()
    item = Item(
        id=1,
        title="Test Item",
        lot_number="123",
        current_bid=10.0,
        auction_house_id="1",
        external_id="ext1",
        url="http://example.com",
        is_watched=False
    )
    db.add(item)
    db.commit()
    db.close()

    response = client.post("/api/items/1/watch", json={"is_watched": True})
    assert response.status_code == 200
    data = response.json()
    assert data["is_watched"] == True

def test_get_watchlist():
    db = TestingSessionLocal()
    item1 = Item(id=1, title="Item 1", lot_number="111", auction_house_id="1", external_id="ext111", is_watched=True)
    item2 = Item(id=2, title="Item 2", lot_number="222", auction_house_id="1", external_id="ext222", is_watched=False)
    item3 = Item(id=3, title="Item 3", lot_number="333", auction_house_id="1", external_id="ext333", is_watched=True)
    db.add_all([item1, item2, item3])
    db.commit()
    db.close()

    response = client.get("/api/items/watchlist")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    titles = [i["title"] for i in data]
    assert "Item 1" in titles
    assert "Item 3" in titles

def test_item_serialization_with_valuation_and_bids():
    from app.models import Valuation, EbaySampleCache, ValuationDetail, UserBidActivity
    import datetime
    db = TestingSessionLocal()
    
    item = Item(
        id=10, 
        title="Test Serialization", 
        lot_number="555", 
        auction_house_id="1", 
        external_id="ext555", 
        is_watched=False
    )
    db.add(item)
    db.flush()
    
    sample_cache = EbaySampleCache(
        item_id=item.id,
        query_signature="test query",
        sample_size=20,
        trimmed_median=100.0,
        mean=105.0,
        fetched_at=datetime.datetime.utcnow()
    )
    db.add(sample_cache)
    db.flush()
    
    val_detail = ValuationDetail(
        sample_cache_id=sample_cache.id,
        sample_listings=[{"title": "Listing 1", "price": 100.0}],
        avg_asking_price=100.0,
        median_asking_price=100.0,
        price_range_low=100.0,
        price_range_high=100.0
    )
    db.add(val_detail)
    
    valuation = Valuation(
        item_id=item.id,
        sample_cache_id=sample_cache.id,
        est_market_value=80.0,
        market_adjustment_factor_applied=0.8,
        max_bid_for_target_roi=50.0,
        target_roi_pct=0.3,
        computed_at=datetime.datetime.utcnow()
    )
    db.add(valuation)
    
    user_bid = UserBidActivity(
        item_id=item.id,
        current_bid_amount=10.0,
        user_bid_amount=20.0,
        user_proxy_bid=30.0,
        user_bid_status="winning",
        updated_at=datetime.datetime.utcnow()
    )
    db.add(user_bid)
    db.commit()
    db.close()

    response = client.get("/api/items/")
    assert response.status_code == 200
    data = response.json()
    
    # Find the serialized item
    item_data = next((i for i in data if i["id"] == 10), None)
    assert item_data is not None
    
    # Assert valuation_detail is present
    assert "valuation" in item_data
    assert "valuation_detail" in item_data["valuation"]
    assert item_data["valuation"]["valuation_detail"]["avg_asking_price"] == 100.0
    assert len(item_data["valuation"]["valuation_detail"]["sample_listings"]) == 1
    
    # Assert user_bid_activity is present
    assert "user_bid_activity" in item_data
    assert item_data["user_bid_activity"]["user_bid_amount"] == 20.0
    assert item_data["user_bid_activity"]["user_bid_status"] == "winning"

