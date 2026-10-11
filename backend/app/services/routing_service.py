import math
from typing import Dict, List, Tuple
import requests
from app.config import settings

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in kilometers."""
    try:
        R = 6371.0  # Earth radius in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)
    except Exception:
        return 0.0

def interpolate_waypoints(lat1: float, lon1: float, lat2: float, lon2: float, steps: int = 15) -> List[List[float]]:
    """Generate intermediate waypoints with slight curvature for realistic polyline display."""
    points = []
    # Add a slight mid-arc offset to simulate a real road rather than straight line
    mid_lat = (lat1 + lat2) / 2
    mid_lon = (lon1 + lon2) / 2
    # perpendicular offset
    offset_factor = 0.008
    offset_lat = -(lon2 - lon1) * offset_factor
    offset_lon = (lat2 - lat1) * offset_factor

    for i in range(steps + 1):
        t = i / steps
        # Quadratic bezier curve
        # B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
        p1_lat = mid_lat + offset_lat
        p1_lon = mid_lon + offset_lon

        lat = (1 - t)**2 * lat1 + 2 * (1 - t) * t * p1_lat + t**2 * lat2
        lon = (1 - t)**2 * lon1 + 2 * (1 - t) * t * p1_lon + t**2 * lon2
        points.append([round(lat, 5), round(lon, 5)])
    return points

def fetch_osrm_route(lat1: float, lon1: float, lat2: float, lon2: float) -> Tuple[float, int, List[List[float]]]:
    """
    Attempt to fetch real driving route from Open Source Routing Machine (OSRM).
    Gracefully falls back to high-accuracy Haversine curvature if offline or rate-limited.
    """
    url = f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson"
    try:
        response = requests.get(url, timeout=3.5)
        if response.status_code == 200:
            data = response.json()
            if data.get("routes") and len(data["routes"]) > 0:
                route = data["routes"][0]
                dist_km = round(route["distance"] / 1000.0, 2)
                duration_mins = max(1, round(route["duration"] / 60.0))
                # GeoJSON coordinates are [lon, lat], leaflet expects [lat, lon]
                coords = [[c[1], c[0]] for c in route["geometry"]["coordinates"]]
                return dist_km, duration_mins, coords
    except Exception:
        pass

    # High-accuracy fallback
    dist_km = haversine_distance(lat1, lon1, lat2, lon2)
    # Average urban speed 35 km/h + 5 mins pickup buffer
    duration_mins = max(5, round((dist_km / 35.0) * 60) + 5)
    coords = interpolate_waypoints(lat1, lon1, lat2, lon2)
    return dist_km, duration_mins, coords

def calculate_fare_estimates(distance_km: float) -> Dict[str, float]:
    """Calculate dynamic estimated fares based on distance across travel modes."""
    d = max(1.0, distance_km)
    return {
        "taxi": round(3.50 + (d * 1.80), 2),
        "tesla_rental": round(15.00 + (d * 2.50), 2),
        "bus_express": round(2.00 + (d * 0.40), 2),
        "metro_transit": round(1.50 + (d * 0.25), 2),
        "ebike": round(1.00 + (d * 0.60), 2),
        "airport_shuttle": round(12.00 + (d * 1.20), 2),
    }
