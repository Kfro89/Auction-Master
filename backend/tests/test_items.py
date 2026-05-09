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
