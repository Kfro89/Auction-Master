import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import InventoryItem, InventoryParentLot, InventoryCostLineItem, PackagingConfiguration, Item, AuctionHouse
import datetime

@pytest.fixture(scope="module")
def engine():
    return create_engine("sqlite:///:memory:")

@pytest.fixture(scope="module")
def tables(engine):
    # This might fail if the models are not yet defined in app.models
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

def test_inventory_parent_lot_and_item_relationship(db_session):
    # Setup parent lot
    parent_lot = InventoryParentLot(
        title="Test Parent Lot",
        hammer_price=100.0,
        buyer_premium_pct=15.0,
        tax_rate=8.25,
        misc_fees=5.0
    )
    db_session.add(parent_lot)
    db_session.commit()

    # Create inventory item linked to parent lot
    item = InventoryItem(
        title="Test Item",
        parent_lot_id=parent_lot.id,
        weight=1.5,
        length=10.0,
        width=5.0,
        height=2.0,
        storage_location="Shelf A1",
        tracking_number="TRACK123",
        qr_code_url="http://example.com/qr"
    )
    db_session.add(item)
    db_session.commit()

    # Verify relationship from parent to child
    assert len(parent_lot.items) == 1
    assert parent_lot.items[0].title == "Test Item"

    # Verify relationship from child to parent
    assert item.parent_lot.title == "Test Parent Lot"

def test_inventory_cost_line_items(db_session):
    parent_lot = InventoryParentLot(title="Lot with Costs")
    db_session.add(parent_lot)
    db_session.commit()

    item = InventoryItem(title="Item with Costs", parent_lot_id=parent_lot.id)
    db_session.add(item)
    db_session.commit()

    # Add cost line items
    cost1 = InventoryCostLineItem(
        inventory_item_id=item.id,
        label="Repair part",
        amount=25.0,
        category="refurb"
    )
    cost2 = InventoryCostLineItem(
        parent_lot_id=parent_lot.id,
        label="Hammer Price",
        amount=100.0,
        category="acquisition"
    )
    db_session.add_all([cost1, cost2])
    db_session.commit()

    # Verify relationships
    assert len(item.cost_line_items) == 1
    assert item.cost_line_items[0].label == "Repair part"
    
    assert len(parent_lot.cost_line_items) == 1
    assert parent_lot.cost_line_items[0].label == "Hammer Price"

def test_packaging_configuration(db_session):
    config = PackagingConfiguration(
        name="Large Box",
        length=20.0,
        width=20.0,
        height=20.0,
        box_cost=2.5,
        void_fill_cost=0.5,
        addon_cost=0.1,
        total_cost=3.1
    )
    db_session.add(config)
    db_session.commit()

    fetched = db_session.query(PackagingConfiguration).filter_by(name="Large Box").first()
    assert fetched.total_cost == 3.1
    assert fetched.is_active is True
