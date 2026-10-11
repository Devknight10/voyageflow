import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import Base, engine
from app.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    seed_database()

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_auth_demo_login():
    # Traveler demo login
    res_traveler = client.post("/api/auth/demo-login", json={"role": "traveler"})
    assert res_traveler.status_code == 200
    data_t = res_traveler.json()
    assert "access_token" in data_t
    assert data_t["user"]["role"] == "traveler"

    # Admin demo login
    res_admin = client.post("/api/auth/demo-login", json={"role": "admin"})
    assert res_admin.status_code == 200
    data_a = res_admin.json()
    assert "access_token" in data_a
    assert data_a["user"]["role"] == "admin"

def test_destinations_search_and_filter():
    # Fetch all destinations
    res = client.get("/api/destinations")
    assert res.status_code == 200
    destinations = res.json()
    assert len(destinations) >= 5

    # Filter by category 'stays'
    res_stays = client.get("/api/destinations?category=stays")
    assert res_stays.status_code == 200
    for item in res_stays.json():
        assert item["category"] == "stays"

    # Search by keyword
    res_search = client.get("/api/destinations?query=Resort")
    assert res_search.status_code == 200
    assert any("Resort" in item["name"] for item in res_search.json())

def test_transport_search():
    res = client.get("/api/transport")
    assert res.status_code == 200
    services = res.json()
    assert len(services) >= 5

    # Test with trip distance calculation
    res_fare = client.get("/api/transport?trip_distance_km=25.0")
    assert res_fare.status_code == 200
    first = res_fare.json()[0]
    assert first["estimated_price"] is not None
    assert first["estimated_price"] > first["base_fare"]

def test_routes_calculation():
    payload = {
        "origin_lat": 13.0674,
        "origin_lng": 80.2376,
        "dest_lat": 12.8230,
        "dest_lng": 80.2412,
        "origin_name": "Anna Salai, Chennai",
        "dest_name": "Ocean Azure Resort"
    }
    res = client.post("/api/routes/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["distance_km"] > 0
    assert data["duration_mins"] > 0
    assert len(data["polyline_coords"]) > 0
    assert "taxi" in data["estimated_fares"]

def test_full_booking_and_payment_flow():
    # 1. Login demo traveler
    login_res = client.post("/api/auth/demo-login", json={"role": "traveler"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Booking
    booking_payload = {
        "booking_type": "transport",
        "item_id": 1,
        "item_name": "Tesla Model S Plaid",
        "pickup_location": "Airport Terminal 2",
        "dropoff_location": "Ocean Azure Resort",
        "pickup_lat": 12.9900,
        "pickup_lng": 80.1693,
        "dropoff_lat": 12.8230,
        "dropoff_lng": 80.2412,
        "travel_date": "2026-10-15",
        "travel_time": "11:00 AM",
        "passengers_count": 2,
        "passenger_details": [{"name": "Alex Mercer", "age": 30, "gender": "Male"}],
        "subtotal": 95.0,
        "coupon_code": "VOYAGE20"
    }
    b_res = client.post("/api/bookings", json=booking_payload, headers=headers)
    assert b_res.status_code == 200
    booking_data = b_res.json()
    booking_id = booking_data["id"]
    booking_ref = booking_data["reference_code"]
    assert booking_data["status"] == "PENDING"
    assert booking_data["discount_amount"] > 0  # Coupon applied

    # 3. Create Payment Order
    pay_order_payload = {
        "booking_id": booking_id,
        "gateway": "STRIPE_TEST",
        "payment_method": "CARD"
    }
    order_res = client.post("/api/payments/create-order", json=pay_order_payload, headers=headers)
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert "order_id" in order_data

    # 4. Verify Payment with Sandbox Signature
    verify_payload = {
        "order_id": order_data["order_id"],
        "payment_id": "test_pay_998822",
        "signature": "SANDBOX_VERIFIED_SIGNATURE",
        "simulate_fail": False
    }
    verify_res = client.post("/api/payments/verify", json=verify_payload)
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["success"] is True
    assert verify_data["status"] == "CONFIRMED"

    # 5. Check Booking is now Confirmed
    check_res = client.get(f"/api/bookings/{booking_id}", headers=headers)
    assert check_res.status_code == 200
    assert check_res.json()["status"] == "CONFIRMED"

    # 6. Verify Digital Receipt
    receipt_res = client.get(f"/api/payments/receipt/{booking_ref}")
    assert receipt_res.status_code == 200
    receipt_data = receipt_res.json()
    assert receipt_data["booking_reference"] == booking_ref or receipt_data["receipt_number"].endswith(booking_ref)
