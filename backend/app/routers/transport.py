import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import TransportService, TransportProvider
from app.schemas import TransportServiceResponse, TransportProviderResponse
from app.services.routing_service import haversine_distance

router = APIRouter(prefix="/transport", tags=["Transportation"])

@router.get("", response_model=List[TransportServiceResponse])
def get_transport_services(
    type: Optional[str] = None,
    capacity: Optional[int] = None,
    max_price: Optional[float] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    trip_distance_km: Optional[float] = None,
    available_only: Optional[bool] = True,
    sort_by: Optional[str] = "price_asc",  # "price_asc", "price_desc", "rating", "distance"
    db: Session = Depends(get_db)
):
    q = db.query(TransportService).join(TransportProvider)

    if available_only:
        q = q.filter(TransportService.is_available == True)

    if type and type != "all":
        q = q.filter(TransportService.type == type)

    if capacity:
        q = q.filter(TransportService.capacity >= capacity)

    if max_price is not None:
        q = q.filter(TransportService.base_fare <= max_price)

    services = q.all()

    results = []
    for s in services:
        features_list = []
        try:
            features_list = json.loads(s.features) if s.features else []
        except Exception:
            features_list = []

        dist = None
        if lat is not None and lng is not None and s.current_lat is not None and s.current_lng is not None:
            dist = haversine_distance(lat, lng, s.current_lat, s.current_lng)

        # Dynamic trip price calculation if trip distance is supplied
        est_price = s.base_fare
        if trip_distance_km is not None and trip_distance_km > 0:
            est_price = round(s.base_fare + (trip_distance_km * s.per_km_rate), 2)

        results.append({
            "id": s.id,
            "provider_id": s.provider_id,
            "provider_name": s.provider.name if s.provider else "Voyage Transit",
            "name": s.name,
            "type": s.type,
            "vehicle_model": s.vehicle_model,
            "capacity": s.capacity,
            "base_fare": s.base_fare,
            "per_km_rate": s.per_km_rate,
            "image_url": s.image_url,
            "cancellation_policy": s.cancellation_policy,
            "rating": s.rating,
            "current_lat": s.current_lat,
            "current_lng": s.current_lng,
            "is_available": s.is_available,
            "features": features_list,
            "dist_km": dist,
            "estimated_price": est_price
        })

    # Sort
    if sort_by == "price_asc":
        results.sort(key=lambda x: x["estimated_price"] or x["base_fare"])
    elif sort_by == "price_desc":
        results.sort(key=lambda x: x["estimated_price"] or x["base_fare"], reverse=True)
    elif sort_by == "rating":
        results.sort(key=lambda x: x["rating"], reverse=True)
    elif sort_by == "distance" and (lat is not None and lng is not None):
        results.sort(key=lambda x: x["dist_km"] if x["dist_km"] is not None else float("inf"))

    return results

@router.get("/{service_id}", response_model=TransportServiceResponse)
def get_transport_service(service_id: int, db: Session = Depends(get_db)):
    s = db.query(TransportService).filter(TransportService.id == service_id).first()
    if not s:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transport service #{service_id} not found"
        )

    features_list = []
    try:
        features_list = json.loads(s.features) if s.features else []
    except Exception:
        features_list = []

    return {
        "id": s.id,
        "provider_id": s.provider_id,
        "provider_name": s.provider.name if s.provider else "Voyage Transit",
        "name": s.name,
        "type": s.type,
        "vehicle_model": s.vehicle_model,
        "capacity": s.capacity,
        "base_fare": s.base_fare,
        "per_km_rate": s.per_km_rate,
        "image_url": s.image_url,
        "cancellation_policy": s.cancellation_policy,
        "rating": s.rating,
        "current_lat": s.current_lat,
        "current_lng": s.current_lng,
        "is_available": s.is_available,
        "features": features_list,
        "dist_km": None,
        "estimated_price": s.base_fare
    }
