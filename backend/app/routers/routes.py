import json
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Destination, TransportService
from app.schemas import RouteCalculationRequest, RouteCalculationResponse
from app.services.routing_service import fetch_osrm_route, calculate_fare_estimates, haversine_distance

router = APIRouter(prefix="", tags=["Routing & GPS"])

@router.post("/routes/calculate", response_model=RouteCalculationResponse)
def calculate_route(req: RouteCalculationRequest):
    """
    Calculates distance, drive time, polyline geometry, and multi-modal fare estimates
    between two GPS coordinates.
    """
    dist_km, duration_mins, coords = fetch_osrm_route(
        req.origin_lat, req.origin_lng, req.dest_lat, req.dest_lng
    )
    fares = calculate_fare_estimates(dist_km)

    return {
        "distance_km": dist_km,
        "duration_mins": duration_mins,
        "origin_name": req.origin_name or "Pickup Location",
        "dest_name": req.dest_name or "Destination",
        "origin_coords": [req.origin_lat, req.origin_lng],
        "dest_coords": [req.dest_lat, req.dest_lng],
        "polyline_coords": coords,
        "estimated_fares": fares
    }

@router.get("/nearby")
def get_nearby_all(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    db: Session = Depends(get_db)
):
    """
    Unified nearby endpoint returning both destinations and active transport services
    sorted by proximity to the user's GPS location.
    """
    destinations = db.query(Destination).all()
    transport = db.query(TransportService).filter(TransportService.is_available == True).all()

    combined = []

    for d in destinations:
        dist = haversine_distance(lat, lng, d.lat, d.lng)
        amenities = []
        try:
            amenities = json.loads(d.amenities) if d.amenities else []
        except Exception:
            amenities = []

        combined.append({
            "id": d.id,
            "type": "destination",
            "name": d.name,
            "title": d.title,
            "category": d.category,
            "price": d.price,
            "unit": d.unit,
            "rating": d.rating,
            "image": d.image_url,
            "description": d.description,
            "lat": d.lat,
            "lng": d.lng,
            "dist": dist,
            "amenities": amenities
        })

    for s in transport:
        if s.current_lat is not None and s.current_lng is not None:
            dist = haversine_distance(lat, lng, s.current_lat, s.current_lng)
            combined.append({
                "id": s.id,
                "type": "transport",
                "name": s.name,
                "title": f"{s.vehicle_model} ({s.capacity} seats)",
                "category": "transport",
                "price": s.base_fare,
                "unit": "base fare",
                "rating": s.rating,
                "image": s.image_url,
                "description": f"{s.type.title()} service - {s.cancellation_policy}",
                "lat": s.current_lat,
                "lng": s.current_lng,
                "dist": dist,
                "amenities": [s.vehicle_model, f"{s.capacity} Passengers", f"${s.per_km_rate}/km"]
            })

    # Sort closest first
    combined.sort(key=lambda x: x["dist"])
    return combined
