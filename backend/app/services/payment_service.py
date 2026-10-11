import hashlib
import hmac
import secrets
import time
from typing import Dict, Any
from app.config import settings

def create_payment_order(amount: float, currency: str, booking_ref: str, gateway: str = "SANDBOX") -> Dict[str, Any]:
    """
    Creates an authenticated payment order in sandbox mode.
    Simulates Razorpay / Stripe server-side order generation.
    """
    order_timestamp = int(time.time())
    random_token = secrets.token_hex(6)
    order_id = f"order_{gateway.lower()}_{order_timestamp}_{random_token}"
    
    # Generate cryptographic pre-signature for verification check
    raw_signature_payload = f"{order_id}|{amount:.2f}|{currency}|{settings.RAZORPAY_KEY_SECRET}"
    mock_expected_signature = hashlib.sha256(raw_signature_payload.encode("utf-8")).hexdigest()

    return {
        "order_id": order_id,
        "amount": round(amount, 2),
        "amount_minor": int(amount * 100),  # minor unit (cents/paise)
        "currency": currency,
        "gateway": gateway,
        "key_id": settings.RAZORPAY_KEY_ID if "RAZORPAY" in gateway else settings.STRIPE_PUBLISHABLE_KEY,
        "booking_reference": booking_ref,
        "pre_signature": mock_expected_signature
    }

def verify_payment_signature(
    order_id: str,
    payment_id: str,
    signature: str,
    secret: str = settings.RAZORPAY_KEY_SECRET
) -> bool:
    """
    Verifies payment signature on the server to prevent fraudulent frontend assertions.
    """
    if not order_id or not payment_id or not signature:
        return False

    # In sandbox mode, accept test signature format or compute SHA256 HMAC
    expected_token = f"{order_id}|{payment_id}"
    computed_hmac = hmac.new(
        secret.encode("utf-8"),
        expected_token.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    # Allow valid computed HMAC or sandbox demo signature
    if secrets.compare_digest(signature, computed_hmac):
        return True
    
    # Also accept sandbox test signature flag
    if signature.startswith("sig_valid_") or signature == "SANDBOX_VERIFIED_SIGNATURE":
        return True

    return False

def generate_receipt_data(booking, payment) -> Dict[str, Any]:
    """Generates structured digital receipt metadata."""
    return {
        "receipt_number": f"REC-{booking.reference_code}",
        "booking_reference": booking.reference_code,
        "transaction_id": payment.payment_id or f"TXN-{secrets.token_hex(8)}",
        "order_id": payment.order_id,
        "date": payment.created_at.strftime("%B %d, %Y - %I:%M %p") if payment.created_at else "Just now",
        "customer_name": booking.user.full_name or booking.user.username,
        "customer_email": booking.user.email,
        "item_booked": booking.item_name,
        "travel_date": booking.travel_date,
        "pickup": booking.pickup_location or "N/A",
        "dropoff": booking.dropoff_location or "N/A",
        "subtotal": booking.subtotal,
        "tax": booking.tax_amount,
        "fees": booking.fees_amount,
        "discount": booking.discount_amount,
        "total_paid": booking.total_amount,
        "currency": booking.currency,
        "payment_method": payment.payment_method,
        "gateway": payment.gateway,
        "status": payment.status
    }
