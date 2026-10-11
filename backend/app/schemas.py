from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

# ==================== AUTH & USERS ====================
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    full_name: Optional[str]
    phone: Optional[str]
    role: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==================== DESTINATIONS ====================
class DestinationBase(BaseModel):
    name: str
    title: str
    category: str
    city: str
    country: str = "India"
    lat: float
    lng: float
    price: float
    unit: str = "night"
    rating: float = 4.8
    reviews_count: int = 120
    image_url: str
    description: str
    amenities: List[str] = []
    is_featured: bool = False

class DestinationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    title: str
    category: str
    city: str
    country: str
    lat: float
    lng: float
    price: float
    unit: str
    rating: float
    reviews_count: int
    image_url: str
    description: str
    amenities: List[str]
    is_featured: bool
    is_wishlisted: Optional[bool] = False
    dist_km: Optional[float] = None


# ==================== TRANSPORT ====================
class TransportProviderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    logo_url: Optional[str]
    rating: float
    contact_phone: Optional[str]
    support_email: Optional[str]

class TransportServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    provider_id: int
    provider_name: Optional[str] = None
    name: str
    type: str
    vehicle_model: str
    capacity: int
    base_fare: float
    per_km_rate: float
    image_url: str
    cancellation_policy: str
    rating: float
    current_lat: Optional[float]
    current_lng: Optional[float]
    is_available: bool
    features: List[str] = []
    dist_km: Optional[float] = None
    estimated_price: Optional[float] = None


# ==================== ROUTING ====================
class RouteCalculationRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    origin_name: Optional[str] = "Pickup Location"
    dest_name: Optional[str] = "Destination"
    transport_mode: Optional[str] = "driving"

class RouteCalculationResponse(BaseModel):
    distance_km: float
    duration_mins: int
    origin_name: str
    dest_name: str
    origin_coords: List[float]
    dest_coords: List[float]
    polyline_coords: List[List[float]]
    estimated_fares: Dict[str, float]


# ==================== BOOKINGS ====================
class PassengerDetail(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None

class BookingCreate(BaseModel):
    booking_type: str  # "transport", "destination"
    item_id: int
    item_name: str
    pickup_location: Optional[str] = None
    dropoff_location: Optional[str] = None
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None
    dropoff_lat: Optional[float] = None
    dropoff_lng: Optional[float] = None
    travel_date: str
    travel_time: Optional[str] = "09:00 AM"
    passengers_count: int = 1
    passenger_details: List[PassengerDetail] = []
    subtotal: float
    coupon_code: Optional[str] = None

class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference_code: str
    user_id: int
    booking_type: str
    item_id: int
    item_name: str
    pickup_location: Optional[str]
    dropoff_location: Optional[str]
    pickup_lat: Optional[float]
    pickup_lng: Optional[float]
    dropoff_lat: Optional[float]
    dropoff_lng: Optional[float]
    travel_date: str
    travel_time: Optional[str]
    passengers_count: int
    passenger_details: List[Dict[str, Any]]
    subtotal: float
    tax_amount: float
    fees_amount: float
    discount_amount: float
    total_amount: float
    currency: str
    status: str
    cancellation_reason: Optional[str]
    created_at: datetime
    payment_status: Optional[str] = "PENDING"
    payment_method: Optional[str] = None

class BookingCancelRequest(BaseModel):
    reason: Optional[str] = "Customer initiated cancellation"


# ==================== PAYMENTS ====================
class PaymentOrderCreate(BaseModel):
    booking_id: int
    gateway: str = "SANDBOX"  # "STRIPE_TEST", "RAZORPAY_TEST", "SANDBOX"
    payment_method: str = "CARD"  # "CARD", "UPI", "NETBANKING"

class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: float
    currency: str
    gateway: str
    key_id: str
    booking_reference: str

class PaymentVerifyRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    simulate_fail: Optional[bool] = False

class PaymentVerifyResponse(BaseModel):
    success: bool
    status: str
    message: str
    booking_reference: str
    receipt_url: Optional[str]


# ==================== WISHLIST ====================
class WishlistToggleRequest(BaseModel):
    destination_id: int

class WishlistResponse(BaseModel):
    destination_id: int
    is_saved: bool
    total_saved: int


# ==================== ADMIN STATS ====================
class AdminStatsResponse(BaseModel):
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    total_revenue: float
    total_users: int
    total_destinations: int
    total_transport_vehicles: int
    recent_bookings: List[BookingResponse]
