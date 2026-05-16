import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db, Base
from app.auth import get_current_user
from app.models import Item, InventoryItem, InventoryParentLot, InventoryCostLineItem, PackagingConfiguration

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
    db = TestingSessionLocal()
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.commit()
    db.close()

def test_mark_item_as_won_single():
    # 1. Create a mock auction item
    db = TestingSessionLocal()
    auction_item = Item(
        external_id="LOT123",
        title="Expensive Widget",
        auction_house_id=1,
        status="open"
    )
    db.add(auction_item)
    db.commit()
    item_id = auction_item.id
    db.close()

    # 2. Mark as won
    response = client.post(
        f"/api/inventory/items/{item_id}/won",
        json={
            "hammer_price": 100.0,
            "buyer_premium_pct": 15.0,
            "tax_rate": 8.0,
            "misc_fees": 5.0
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["parent_lot_id"] is not None
    assert len(data["inventory_item_ids"]) == 1

    # 3. Verify COGS
    db = TestingSessionLocal()
    inv_item = db.query(InventoryItem).filter_by(id=data["inventory_item_ids"][0]).first()
    assert inv_item.status == "WON"
    assert len(inv_item.cost_line_items) == 1
    # 100 + 15 + 8 + 5 = 128.0
    assert inv_item.cost_line_items[0].amount == 128.0
    
    # Verify auction item status
    updated_auction_item = db.query(Item).filter_by(id=item_id).first()
    assert updated_auction_item.status == "won"
    db.close()

def test_mark_item_as_won_split():
    # 1. Create a mock auction item
    db = TestingSessionLocal()
    auction_item = Item(
        external_id="LOT456",
        title="Box Lot of Tools",
        auction_house_id=1,
        status="open"
    )
    db.add(auction_item)
    db.commit()
    item_id = auction_item.id
    db.close()

    # 2. Mark as won and split into 4
    response = client.post(
        f"/api/inventory/items/{item_id}/won",
        json={
            "split_count": 4,
            "hammer_price": 200.0,
            "buyer_premium_pct": 0.0,
            "tax_rate": 0.0,
            "misc_fees": 0.0
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["inventory_item_ids"]) == 4

    # 3. Verify allocated COGS
    db = TestingSessionLocal()
    for inv_id in data["inventory_item_ids"]:
        inv_item = db.query(InventoryItem).filter_by(id=inv_id).first()
        assert inv_item.cost_line_items[0].amount == 50.0 # 200 / 4
    db.close()

def test_status_transition_validation():
    # Create an inventory item
    create_resp = client.post(
        "/api/inventory/items/1/won", # item_id doesn't exist but we already tested it fails, wait
        json={"hammer_price": 10.0}
    )
    # Re-use setup from previous test or create manually
    db = TestingSessionLocal()
    inv_item = InventoryItem(title="Test Transition", status="WON")
    db.add(inv_item)
    db.commit()
    inv_id = inv_item.id
    db.close()

    # Valid transition
    resp = client.patch(f"/api/inventory/{inv_id}", json={"status": "PAID"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "PAID"

    # Invalid status
    resp = client.patch(f"/api/inventory/{inv_id}", json={"status": "INVALID_STATE"})
    assert resp.status_code == 400
    assert "Invalid status" in resp.json()["detail"]

def test_add_refurbishment_costs():
    # 1. Create inventory item
    db = TestingSessionLocal()
    inv_item = InventoryItem(title="Item for Refurb", status="REFURBISH")
    db.add(inv_item)
    db.commit()
    inv_id = inv_item.id
    db.close()

    # 2. Add cost
    response = client.post(
        f"/api/inventory/{inv_id}/costs",
        json={"label": "New Battery", "amount": 15.0, "category": "refurb"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["label"] == "New Battery"
    assert data[0]["amount"] == 15.0

    # 3. Transition to STAGING
    resp = client.patch(f"/api/inventory/{inv_id}", json={"status": "STAGING"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "STAGING"

def test_auto_packaging():
    db = TestingSessionLocal()
    # 1. Create packaging configs
    config1 = PackagingConfiguration(name="Small Box", length=5.0, width=5.0, height=5.0, total_cost=1.0)
    config2 = PackagingConfiguration(name="Medium Box", length=10.0, width=10.0, height=10.0, total_cost=2.0)
    db.add_all([config1, config2])
    db.commit()

    # 2. Create item
    inv_item = InventoryItem(title="Gadget", status="STAGING", length=8.0, width=8.0, height=8.0)
    db.add(inv_item)
    db.commit()
    inv_id = inv_item.id
    db.close()

    # 3. Trigger auto-package
    response = client.post(f"/api/inventory/{inv_id}/auto-package")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["package_name"] == "Medium Box" # Fits in medium, but not small
    assert data["cost"] == 2.0
