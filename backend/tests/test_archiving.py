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

@pytest.fixture(autouse=True)
def override_dependencies():
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.clear()

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

def test_archive_item_endpoint():
    db = TestingSessionLocal()
    item = Item(
        id=1,
        title="Test Item",
        lot_number="123",
        current_bid=10.0,
        auction_house_id=1,
        external_id="ext1",
        url="http://example.com",
        is_archived=False
    )
    db.add(item)
    db.commit()
    db.close()

    # Test archiving
    response = client.patch("/api/items/1/archive", json={"is_archived": True})
    assert response.status_code == 200
    data = response.json()
    assert data["is_archived"] == True

    # Test unarchiving
    response = client.patch("/api/items/1/archive", json={"is_archived": False})
    assert response.status_code == 200
    data = response.json()
    assert data["is_archived"] == False

def test_list_items_filtering():
    db = TestingSessionLocal()
    item1 = Item(id=1, title="Active Item", lot_number="111", auction_house_id=1, external_id="ext1", is_archived=False)
    item2 = Item(id=2, title="Archived Item", lot_number="222", auction_house_id=1, external_id="ext2", is_archived=True)
    db.add_all([item1, item2])
    db.commit()
    db.close()

    # Default: show_archived=False
    response = client.get("/api/items/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Active Item"
    assert "is_archived" in data[0]

    # Show archived: show_archived=True
    response = client.get("/api/items/?show_archived=true")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    titles = [i["title"] for i in data]
    assert "Active Item" in titles
    assert "Archived Item" in titles
