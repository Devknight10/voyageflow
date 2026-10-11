import datetime
import json
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    phone = Column(String(25), nullable=True)
    role = Column(String(20), default="traveler")  # "traveler", "admin"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")


class Destination(Base):
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), index=True, nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(50), index=True, nullable=False)  # "stays", "experiences", "attractions"
    city = Column(String(80), index=True, nullable=False)
    country = Column(String(80), default="India")
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    unit = Column(String(20), default="night")  # "night", "entry", "trip"
    rating = Column(Float, default=4.8)
    reviews_count = Column(Integer, default=120)
    image_url = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    amenities = Column(Text, default="[]")  # JSON string
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    wishlists = relationship("Wishlist", back_populates="destination", cascade="all, delete-orphan")


class TransportProvider(Base):
    __tablename__ = "transport_providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    logo_url = Column(Text, nullable=True)
    rating = Column(Float, default=4.8)
    contact_phone = Column(String(30), nullable=True)
    support_email = Column(String(100), nullable=True)

    services = relationship("TransportService", back_populates="provider", cascade="all, delete-orphan")


class TransportService(Base):
    __tablename__ = "transport_services"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("transport_providers.id"), nullable=False)
    name = Column(String(120), nullable=False)
    type = Column(String(40), index=True, nullable=False)  # "car", "taxi", "bus", "train", "airport_transfer", "rental", "bike", "boat"
    vehicle_model = Column(String(100), nullable=False)
    capacity = Column(Integer, default=4)
    base_fare = Column(Float, nullable=False)
    per_km_rate = Column(Float, default=1.5)
    image_url = Column(Text, nullable=False)
    cancellation_policy = Column(String(100), default="Free cancellation up to 2 hours before trip")
    rating = Column(Float, default=4.8)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    is_available = Column(Boolean, default=True)
    features = Column(Text, default="[]")  # JSON list

    provider = relationship("TransportProvider", back_populates="services")
    schedules = relationship("RouteSchedule", back_populates="service", cascade="all, delete-orphan")


class RouteSchedule(Base):
    __tablename__ = "route_schedules"

    id = Column(Integer, primary_key=True, index=True)
    transport_service_id = Column(Integer, ForeignKey("transport_services.id"), nullable=False)
    origin_name = Column(String(100), nullable=False)
    destination_name = Column(String(100), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    departure_time = Column(String(30), nullable=False)
    arrival_time = Column(String(30), nullable=False)
    distance_km = Column(Float, nullable=False)
    estimated_duration_mins = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    service = relationship("TransportService", back_populates="schedules")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    reference_code = Column(String(30), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_type = Column(String(30), nullable=False)  # "transport", "destination"
    item_id = Column(Integer, nullable=False)
    item_name = Column(String(150), nullable=False)
    
    pickup_location = Column(String(150), nullable=True)
    dropoff_location = Column(String(150), nullable=True)
    pickup_lat = Column(Float, nullable=True)
    pickup_lng = Column(Float, nullable=True)
    dropoff_lat = Column(Float, nullable=True)
    dropoff_lng = Column(Float, nullable=True)
    
    travel_date = Column(String(30), nullable=False)
    travel_time = Column(String(30), nullable=True)
    passengers_count = Column(Integer, default=1)
    passenger_details = Column(Text, default="[]")  # JSON array
    
    subtotal = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    fees_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    
    status = Column(String(30), default="PENDING")  # "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"
    cancellation_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    payment = relationship("Payment", uselist=False, back_populates="booking", cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    order_id = Column(String(100), unique=True, nullable=False)
    payment_id = Column(String(100), nullable=True)
    signature = Column(String(255), nullable=True)
    gateway = Column(String(30), default="SANDBOX")  # "STRIPE_TEST", "RAZORPAY_TEST", "SANDBOX"
    payment_method = Column(String(30), default="CARD")  # "CARD", "UPI", "NETBANKING"
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    status = Column(String(30), default="PENDING")  # "PENDING", "SUCCESS", "FAILED"
    receipt_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    booking = relationship("Booking", back_populates="payment")


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    destination_id = Column(Integer, ForeignKey("destinations.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="wishlist_items")
    destination = relationship("Destination", back_populates="wishlists")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_type = Column(String(30), nullable=False)  # "destination", "transport"
    target_id = Column(Integer, nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reviews")
