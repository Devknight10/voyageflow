import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import Destination, Wishlist, User
from app.schemas import DestinationResponse
from app.auth import oauth2_scheme
from app.services.routing_service import haversine_distance
import jwt
from app.config import settings

router = APIRouter(prefix="/destinations", tags=["Destinations"])

def get_optional_user_id(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[int]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except Exception:
        return None

@router.get("", response_model=List[DestinationResponse])
def get_destinations(
    query: Optional[str] = None,
    category: Optional[str] = None,
    city: Optional[str] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    sort_by: Optional[str] = "popular",  # "popular", "price_asc", "price_desc", "rating", "distance"
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    featured_only: Optional[bool] = False,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_optional_user_id)
):
    q = db.query(Destination)

    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            or_(
                Destination.name.ilike(search_pattern),
                Destination.title.ilike(search_pattern),
                Destination.city.ilike(search_pattern),
                Destination.description.ilike(search_pattern)
            )
        )

    if category and category != "all":
        q = q.filter(Destination.category == category)

    if city:
        q = q.filter(Destination.city.ilike(f"%{city}%"))

    if max_price is not None:
        q = q.filter(Destination.price <= max_price)

    if min_rating is not None:
        q = q.filter(Destination.rating >= min_rating)

    if featured_only:
        q = q.filter(Destination.is_featured == True)

    results = q.all()

    # Get user wishlists if logged in
    wishlist_ids = set()
    if user_id:
        wishlist_records = db.query(Wishlist.destination_id).filter(Wishlist.user_id == user_id).all()
        wishlist_ids = {r[0] for r in wishlist_records}

    response_items = []
    for d in results:
        amenities_list = []
        try:
            amenities_list = json.loads(d.amenities) if d.amenities else []
        except Exception:
            amenities_list = []

        dist = None
        if lat is not None and lng is not None:
            dist = haversine_distance(lat, lng, d.lat, d.lng)

        response_items.append({
            "id": d.id,
            "name": d.name,
            "title": d.title,
            "category": d.category,
            "city": d.city,
            "country": d.country,
            "lat": d.lat,
            "lng": d.lng,
            "price": d.price,
            "unit": d.unit,
            "rating": d.rating,
            "reviews_count": d.reviews_count,
            "image_url": d.image_url,
            "description": d.description,
            "amenities": amenities_list,
            "is_featured": d.is_featured,
            "is_wishlisted": d.id in wishlist_ids,
            "dist_km": dist
        })

    # Sorting
    if sort_by == "price_asc":
        response_items.sort(key=lambda x: x["price"])
    elif sort_by == "price_desc":
        response_items.sort(key=lambda x: x["price"], reverse=True)
    elif sort_by == "rating":
        response_items.sort(key=lambda x: x["rating"], reverse=True)
    elif sort_by == "distance" and (lat is not None and lng is not None):
        response_items.sort(key=lambda x: x["dist_km"] if x["dist_km"] is not None else float("inf"))
    else:  # "popular"
        response_items.sort(key=lambda x: (x["rating"] * x["reviews_count"]), reverse=True)

    return response_items

@router.get("/{destination_id}", response_model=DestinationResponse)
def get_destination_details(
    destination_id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_optional_user_id)
):
    d = db.query(Destination).filter(Destination.id == destination_id).first()
    if not d:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination #{destination_id} not found"
        )

    is_wishlisted = False
    if user_id:
        is_wishlisted = bool(
            db.query(Wishlist).filter(
                Wishlist.user_id == user_id,
                Wishlist.destination_id == destination_id
            ).first()
        )

    amenities_list = []
    try:
        amenities_list = json.loads(d.amenities) if d.amenities else []
    except Exception:
        amenities_list = []

    return {
        "id": d.id,
        "name": d.name,
        "title": d.title,
        "category": d.category,
        "city": d.city,
        "country": d.country,
        "lat": d.lat,
        "lng": d.lng,
        "price": d.price,
        "unit": d.unit,
        "rating": d.rating,
        "reviews_count": d.reviews_count,
        "image_url": d.image_url,
        "description": d.description,
        "amenities": amenities_list,
        "is_featured": d.is_featured,
        "is_wishlisted": is_wishlisted,
        "dist_km": None
    }
