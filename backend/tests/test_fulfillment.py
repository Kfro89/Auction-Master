# backend/tests/test_fulfillment.py
def test_get_sold_items_queue():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    
    response = client.get("/api/inventory/sold-queue")
    assert response.status_code == 200
    # Should contain items with storage_location and packaging_config details
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "storage_location" in data[0]
        assert "packaging_config" in data[0]
