import json
import random
import string
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Booking, User, Payment
from app.schemas import BookingCreate, BookingResponse, BookingCancelRequest
from app.auth import get_current_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def generate_booking_reference() -> str:
    """Generate professional alphanumeric booking code like VF-782942"""
    digits = ''.join(random.choices(string.digits, k=6))
    return f"VF-{digits}"

@router.post("", response_model=BookingResponse)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Calculate fees and taxes
    subtotal = max(1.0, booking_in.subtotal)
    tax_rate = 0.08  # 8% tax
    tax_amount = round(subtotal * tax_rate, 2)
    fees_amount = 2.50  # Platform booking insurance and handling fee

    discount_amount = 0.0
    if booking_in.coupon_code:
        code = booking_in.coupon_code.strip().upper()
        if code in ["VOYAGE20", "EXPLORE20"]:
            discount_amount = round(subtotal * 0.20, 2)
        elif code in ["WELCOME10", "FIRSTTRIP"]:
            discount_amount = min(subtotal, 10.00)

    total_amount = max(1.0, round(subtotal + tax_amount + fees_amount - discount_amount, 2))

    ref_code = generate_booking_reference()
    # Ensure reference code is unique
    while db.query(Booking).filter(Booking.reference_code == ref_code).first():
        ref_code = generate_booking_reference()

    passenger_details_json = json.dumps([p.model_dump() for p in booking_in.passenger_details])

    new_booking = Booking(
        reference_code=ref_code,
        user_id=current_user.id,
        booking_type=booking_in.booking_type,
        item_id=booking_in.item_id,
        item_name=booking_in.item_name,
        pickup_location=booking_in.pickup_location,
        dropoff_location=booking_in.dropoff_location,
        pickup_lat=booking_in.pickup_lat,
        pickup_lng=booking_in.pickup_lng,
        dropoff_lat=booking_in.dropoff_lat,
        dropoff_lng=booking_in.dropoff_lng,
        travel_date=booking_in.travel_date,
        travel_time=booking_in.travel_time or "09:00 AM",
        passengers_count=booking_in.passengers_count,
        passenger_details=passenger_details_json,
        subtotal=subtotal,
        tax_amount=tax_amount,
        fees_amount=fees_amount,
        discount_amount=discount_amount,
        total_amount=total_amount,
        currency="USD",
        status="PENDING"
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # Parse passenger details for response
    parsed_passengers = []
    try:
        parsed_passengers = json.loads(new_booking.passenger_details)
    except Exception:
        parsed_passengers = []

    return {
        "id": new_booking.id,
        "reference_code": new_booking.reference_code,
        "user_id": new_booking.user_id,
        "booking_type": new_booking.booking_type,
        "item_id": new_booking.item_id,
        "item_name": new_booking.item_name,
        "pickup_location": new_booking.pickup_location,
        "dropoff_location": new_booking.dropoff_location,
        "pickup_lat": new_booking.pickup_lat,
        "pickup_lng": new_booking.pickup_lng,
        "dropoff_lat": new_booking.dropoff_lat,
        "dropoff_lng": new_booking.dropoff_lng,
        "travel_date": new_booking.travel_date,
        "travel_time": new_booking.travel_time,
        "passengers_count": new_booking.passengers_count,
        "passenger_details": parsed_passengers,
        "subtotal": new_booking.subtotal,
        "tax_amount": new_booking.tax_amount,
        "fees_amount": new_booking.fees_amount,
        "discount_amount": new_booking.discount_amount,
        "total_amount": new_booking.total_amount,
        "currency": new_booking.currency,
        "status": new_booking.status,
        "cancellation_reason": new_booking.cancellation_reason,
        "created_at": new_booking.created_at,
        "payment_status": "PENDING",
        "payment_method": None
    }

@router.get("", response_model=List[BookingResponse])
def get_user_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).order_by(Booking.created_at.desc()).all()

    result = []
    for b in bookings:
        parsed_passengers = []
        try:
            parsed_passengers = json.loads(b.passenger_details) if b.passenger_details else []
        except Exception:
            parsed_passengers = []

        pm_status = b.payment.status if b.payment else "PENDING"
        pm_method = b.payment.payment_method if b.payment else None

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
            "passenger_details": parsed_passengers,
            "subtotal": b.subtotal,
            "tax_amount": b.tax_amount,
            "fees_amount": b.fees_amount,
            "discount_amount": b.discount_amount,
            "total_amount": b.total_amount,
            "currency": b.currency,
            "status": b.status,
            "cancellation_reason": b.cancellation_reason,
            "created_at": b.created_at,
            "payment_status": pm_status,
            "payment_method": pm_method
        })
    return result

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_by_id(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Authorize: user can only see their own booking, unless admin
    if b.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")

    parsed_passengers = []
    try:
        parsed_passengers = json.loads(b.passenger_details) if b.passenger_details else []
    except Exception:
        parsed_passengers = []

    pm_status = b.payment.status if b.payment else "PENDING"
    pm_method = b.payment.payment_method if b.payment else None

    return {
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
        "passenger_details": parsed_passengers,
        "subtotal": b.subtotal,
        "tax_amount": b.tax_amount,
        "fees_amount": b.fees_amount,
        "discount_amount": b.discount_amount,
        "total_amount": b.total_amount,
        "currency": b.currency,
        "status": b.status,
        "cancellation_reason": b.cancellation_reason,
        "created_at": b.created_at,
        "payment_status": pm_status,
        "payment_method": pm_method
    }

@router.post("/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    cancel_req: BookingCancelRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    if b.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    if b.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    b.status = "CANCELLED"
    b.cancellation_reason = cancel_req.reason or "Cancelled by user"
    db.commit()

    return {
        "success": True,
        "message": f"Booking {b.reference_code} has been successfully cancelled.",
        "refund_status": "ELIGIBLE_FOR_FULL_REFUND" if b.payment and b.payment.status == "SUCCESS" else "NO_PAYMENT_COLLECTED",
        "refund_amount": b.total_amount if b.payment and b.payment.status == "SUCCESS" else 0.0
    }
