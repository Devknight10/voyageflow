from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.metro_service import metro_service, METRO_LINES, STATIONS

router = APIRouter(prefix="/metro", tags=["Chennai Metro (CMRL)"])

@router.get("/lines")
def get_metro_lines():
    """Returns official Chennai Metro lines with verified hex colors."""
    return METRO_LINES

@router.get("/stations")
def get_metro_stations(
    line: Optional[str] = None,
    query: Optional[str] = None
):
    """Returns Chennai Metro stations, optionally filtered by line or search query."""
    stations = STATIONS
    if line:
        stations = [s for s in stations if line in s["lines"]]
    if query:
        q = query.lower().strip()
        stations = [
            s for s in stations 
            if q in s["name"].lower() or q in s.get("tamil_name", "").lower()
        ]
    return stations

@router.get("/stations/nearby")
def get_nearby_stations(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    limit: int = 5
):
    """Finds verified metro stations nearest to user GPS coordinates."""
    return metro_service.get_nearby_stations(lat, lng, limit=limit)

@router.get("/route")
def get_metro_route(
    origin: str = Query(..., description="Origin station ID (e.g. airport, central, koyambedu)"),
    destination: str = Query(..., description="Destination station ID (e.g. alandur, egmore, saidapet)")
):
    """
    Computes optimal transit route between two stations using Dijkstra's algorithm.
    Includes station order, line interchanges, estimated duration, and official CMRL fare.
    """
    route = metro_service.find_route(origin, destination)
    if not route:
        raise HTTPException(
            status_code=404,
            detail=f"No route found between station '{origin}' and '{destination}'."
        )
    return route
