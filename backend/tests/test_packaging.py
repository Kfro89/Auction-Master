import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db, Base
from app.auth import get_current_user
from app.models import PackagingConfiguration

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

def test_create_packaging_config():
    response = client.post(
        "/api/packaging/",
        json={
            "name": "Medium Box",
            "length": 12.0,
            "width": 12.0,
            "height": 8.0,
            "box_cost": 1.5,
            "void_fill_cost": 0.25,
            "addon_cost": 0.05
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Medium Box"
    assert data["total_cost"] == 1.8  # 1.5 + 0.25 + 0.05
    assert data["id"] is not None

def test_list_packaging_configs():
    # Create two configs
    client.post("/api/packaging/", json={"name": "Box 1", "box_cost": 1.0})
    client.post("/api/packaging/", json={"name": "Box 2", "box_cost": 2.0})
    
    response = client.get("/api/packaging/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_get_packaging_config():
    create_resp = client.post("/api/packaging/", json={"name": "Target Box", "box_cost": 1.0})
    config_id = create_resp.json()["id"]
    
    response = client.get(f"/api/packaging/{config_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Target Box"

def test_update_packaging_config():
    create_resp = client.post("/api/packaging/", json={"name": "Old Name", "box_cost": 1.0})
    config_id = create_resp.json()["id"]
    
    response = client.patch(
        f"/api/packaging/{config_id}",
        json={"name": "New Name", "box_cost": 2.0}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name"
    assert data["total_cost"] == 2.0 # Only box_cost was provided, void/addon default to 0.0

def test_delete_packaging_config():
    create_resp = client.post("/api/packaging/", json={"name": "To Delete", "box_cost": 1.0})
    config_id = create_resp.json()["id"]
    
    response = client.delete(f"/api/packaging/{config_id}")
    assert response.status_code == 200
    
    get_resp = client.get(f"/api/packaging/{config_id}")
    assert get_resp.status_code == 404
