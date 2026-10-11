from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import json

from app.database import get_db
from app.models import Booking, User, Destination, TransportService, Payment
from app.schemas import AdminStatsResponse, BookingResponse
from app.auth import get_current_admin
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Admin Control Center"])

class StatusUpdateRequest(BaseModel):
    status: str

class AvailabilityUpdateRequest(BaseModel):
    is_available: bool

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    total_bookings = db.query(Booking).count()
    confirmed_bookings = db.query(Booking).filter(Booking.status == "CONFIRMED").count()
    cancelled_bookings = db.query(Booking).filter(Booking.status == "CANCELLED").count()
    
    # Revenue from confirmed payments
    revenue_sum = db.query(func.sum(Booking.total_amount)).filter(Booking.status == "CONFIRMED").scalar() or 0.0
    
    total_users = db.query(User).count()
    total_destinations = db.query(Destination).count()
    total_vehicles = db.query(TransportService).count()

    recent = db.query(Booking).order_by(Booking.created_at.desc()).limit(8).all()
    recent_responses = []
    for b in recent:
        passengers = []
        try:
            passengers = json.loads(b.passenger_details) if b.passenger_details else []
        except Exception:
            passengers = []
        recent_responses.append({
            "id": b.id,
            "reference_code": b.reference_code,
            "user_id": b.user_id,
            "booking_type": b.booking_type,
            "item_id": b.item_id,
            "item_name": b.item_name,
            "pickup_location": b.pickup_location,
            "dropoff_location": b.dropoff_location,
            "pickup_lat": b.pickup_lat,
            "pickup_lng": b.pickup_lng,
            "dropoff_lat": b.dropoff_lat,
            "dropoff_lng": b.dropoff_lng,
            "travel_date": b.travel_date,
            "travel_time": b.travel_time,
            "passengers_count": b.passengers_count,
            "passenger_details": passengers,
            "subtotal": b.subtotal,
            "tax_amount": b.tax_amount,
            "fees_amount": b.fees_amount,
            "discount_amount": b.discount_amount,
            "total_amount": b.total_amount,
            "currency": b.currency,
            "status": b.status,
            "cancellation_reason": b.cancellation_reason,
            "created_at": b.created_at,
            "payment_status": b.payment.status if b.payment else "PENDING",
            "payment_method": b.payment.payment_method if b.payment else None
        })

    return {
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "cancelled_bookings": cancelled_bookings,
        "total_revenue": round(revenue_sum, 2),
        "total_users": total_users,
        "total_destinations": total_destinations,
        "total_transport_vehicles": total_vehicles,
        "recent_bookings": recent_responses
    }

@router.get("/bookings", response_model=List[BookingResponse])
def get_all_bookings(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    q = db.query(Booking)
    if status and status != "ALL":
        q = q.filter(Booking.status == status)
    
    bookings = q.order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        passengers = []
        try:
            passengers = json.loads(b.passenger_details) if b.passenger_details else []
        except Exception:
            passengers = []
        result.append({
            "id": b.id,
            "reference_code": b.reference_code,
            "user_id": b.user_id,
            "booking_type": b.booking_type,
            "item_id": b.item_id,
            "item_name": b.item_name,
            "pickup_location": b.pickup_location,
            "dropoff_location": b.dropoff_location,
            "pickup_lat": b.pickup_lat,
            "pickup_lng": b.pickup_lng,
            "dropoff_lat": b.dropoff_lat,
            "dropoff_lng": b.dropoff_lng,
            "travel_date": b.travel_date,
            "travel_time": b.travel_time,
            "passengers_count": b.passengers_count,
            "passenger_details": passengers,
            "subtotal": b.subtotal,
            "tax_amount": b.tax_amount,
            "fees_amount": b.fees_amount,
            "discount_amount": b.discount_amount,
            "total_amount": b.total_amount,
            "currency": b.currency,
            "status": b.status,
            "cancellation_reason": b.cancellation_reason,
            "created_at": b.created_at,
            "payment_status": b.payment.status if b.payment else "PENDING",
            "payment_method": b.payment.payment_method if b.payment else None
        })
    return result

@router.patch("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    req: StatusUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    b.status = req.status
    db.commit()
    return {"success": True, "booking_id": b.id, "new_status": b.status}

@router.patch("/transport/{service_id}/availability")
def toggle_transport_availability(
    service_id: int,
    req: AvailabilityUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    s = db.query(TransportService).filter(TransportService.id == service_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Transport service not found")
    s.is_available = req.is_available
    db.commit()
    return {"success": True, "service_id": s.id, "is_available": s.is_available}
