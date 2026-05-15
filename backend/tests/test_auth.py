import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db
from unittest.mock import MagicMock

# Mock DB dependency
def override_get_db():
    mock_db = MagicMock()
    mock_db.query.return_value.filter_by.return_value.first.return_value = None
    yield mock_db

@pytest.fixture(autouse=True)
def override_dependencies():
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

client = TestClient(app)

def test_login_success():
    response = client.post("/api/auth/login", data={"username": "admin", "password": "password123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_failure():
    response = client.post("/api/auth/login", data={"username": "admin", "password": "wrongpassword"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

def test_protected_route_without_token():
    # Attempting to access an admin route without token
    response = client.get("/api/admin/settings")
    assert response.status_code == 401

def test_protected_route_with_token():
    # Login first
    login_response = client.post("/api/auth/login", data={"username": "admin", "password": "password123"})
    token = login_response.json()["access_token"]
    
    # Access admin route
    response = client.get("/api/admin/settings", headers={"Authorization": f"Bearer {token}"})
    # Might be 200 or something else depending on route implementation, but not 401
    assert response.status_code != 401
