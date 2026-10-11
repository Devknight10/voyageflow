from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Booking, Payment, User
from app.schemas import (
    PaymentOrderCreate, PaymentOrderResponse,
    PaymentVerifyRequest, PaymentVerifyResponse
)
from app.auth import get_current_user
from app.services.payment_service import (
    create_payment_order, verify_payment_signature, generate_receipt_data
)

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/create-order", response_model=PaymentOrderResponse)
def create_order(
    req: PaymentOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized booking access")

    # Generate gateway order details
    order_data = create_payment_order(
        amount=booking.total_amount,
        currency=booking.currency,
        booking_ref=booking.reference_code,
        gateway=req.gateway
    )

    # Upsert payment record
    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if not payment:
        payment = Payment(
            booking_id=booking.id,
            order_id=order_data["order_id"],
            gateway=req.gateway,
            payment_method=req.payment_method,
            amount=booking.total_amount,
            currency=booking.currency,
            status="PENDING"
        )
        db.add(payment)
    else:
        payment.order_id = order_data["order_id"]
        payment.gateway = req.gateway
        payment.payment_method = req.payment_method
        payment.status = "PENDING"

    db.commit()

    return {
        "order_id": order_data["order_id"],
        "amount": order_data["amount"],
        "currency": order_data["currency"],
        "gateway": order_data["gateway"],
        "key_id": order_data["key_id"],
        "booking_reference": booking.reference_code
    }

@router.post("/verify", response_model=PaymentVerifyResponse)
def verify_payment(
    verify_in: PaymentVerifyRequest,
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.order_id == verify_in.order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment order not found")

    booking = payment.booking

    # Check simulated failure
    if verify_in.simulate_fail:
        payment.status = "FAILED"
        db.commit()
        return {
            "success": False,
            "status": "FAILED",
            "message": "Payment simulation was failed by user testing trigger.",
            "booking_reference": booking.reference_code,
            "receipt_url": None
        }

    # Verify signature
    is_valid = verify_payment_signature(
        order_id=verify_in.order_id,
        payment_id=verify_in.payment_id,
        signature=verify_in.signature
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cryptographic payment signature verification failed."
        )

    # Transition booking state securely
    payment.payment_id = verify_in.payment_id
    payment.signature = verify_in.signature
    payment.status = "SUCCESS"
    payment.receipt_url = f"/api/payments/receipt/{booking.reference_code}"

    booking.status = "CONFIRMED"
    db.commit()

    return {
        "success": True,
        "status": "CONFIRMED",
        "message": f"Payment verified successfully. Booking {booking.reference_code} is confirmed!",
        "booking_reference": booking.reference_code,
        "receipt_url": payment.receipt_url
    }

@router.get("/receipt/{booking_reference}")
def get_receipt(booking_reference: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.reference_code == booking_reference).first()
    if not booking or not booking.payment:
        raise HTTPException(status_code=404, detail="Receipt not found for this reference")

    receipt = generate_receipt_data(booking, booking.payment)
    return receipt
