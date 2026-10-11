from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Wishlist, Destination, User
from app.schemas import WishlistToggleRequest, WishlistResponse, DestinationResponse
from app.auth import get_current_user
import json

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.post("/toggle", response_model=WishlistResponse)
def toggle_wishlist(
    req: WishlistToggleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    destination = db.query(Destination).filter(Destination.id == req.destination_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.destination_id == req.destination_id
    ).first()

    is_saved = False
    if existing:
        db.delete(existing)
        db.commit()
        is_saved = False
    else:
        new_item = Wishlist(user_id=current_user.id, destination_id=req.destination_id)
        db.add(new_item)
        db.commit()
        is_saved = True

    total = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).count()
    return {
        "destination_id": req.destination_id,
        "is_saved": is_saved,
        "total_saved": total
    }

@router.get("", response_model=List[DestinationResponse])
def get_user_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(Destination).join(Wishlist).filter(
        Wishlist.user_id == current_user.id
    ).all()

    result = []
    for d in items:
        amenities = []
        try:
            amenities = json.loads(d.amenities) if d.amenities else []
        except Exception:
            amenities = []

        result.append({
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
            "amenities": amenities,
            "is_featured": d.is_featured,
            "is_wishlisted": True,
            "dist_km": None
        })
    return result
