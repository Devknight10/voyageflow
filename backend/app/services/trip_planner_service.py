from typing import Dict, List, Any, Optional
from app.services.routing_service import haversine_distance, fetch_osrm_route
from app.services.metro_service import metro_service, STATIONS

def plan_multimodal_trip(
    origin_name: str,
    dest_name: str,
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    preference: str = "fastest" # "fastest", "budget", "eco"
) -> Dict[str, Any]:
    """
    Generates a realistic multi-modal Indian journey combining Metro, Cab/Auto,
    and walking legs with transparent time & fare calculations.
    """
    # 1. Calculate direct road baseline
    direct_dist_km, direct_drive_mins, _ = fetch_osrm_route(origin_lat, origin_lng, dest_lat, dest_lng)

    # 2. Find nearest metro stations to origin and destination
    nearest_to_origin = metro_service.get_nearby_stations(origin_lat, origin_lng, limit=1)[0]
    nearest_to_dest = metro_service.get_nearby_stations(dest_lat, dest_lng, limit=1)[0]

    origin_to_metro_dist = nearest_to_origin["distance_km"]
    dest_to_metro_dist = nearest_to_dest["distance_km"]

    # 3. Check if Metro is viable (both points within 15 km of a metro station)
    is_metro_viable = (
        origin_to_metro_dist <= 15.0 and
        dest_to_metro_dist <= 15.0 and
        nearest_to_origin["id"] != nearest_to_dest["id"]
    )

    itineraries = []

    # OPTION A: Multi-Modal Transit (Auto/Cab + Metro + Walk/Cab)
    if is_metro_viable:
        metro_route = metro_service.find_route(nearest_to_origin["id"], nearest_to_dest["id"])
        if metro_route:
            legs = []
            total_cost = 0
            total_duration = 0

            # Leg 1: Origin to First Metro
            if origin_to_metro_dist > 1.2:
                cab_fare = round(35 + (origin_to_metro_dist * 14))
                cab_time = max(5, round(origin_to_metro_dist * 2.8))
                legs.append({
                    "mode": "auto",
                    "title": f"Auto-rickshaw to {nearest_to_origin['name']} Metro",
                    "from_location": origin_name,
                    "to_location": nearest_to_origin['name'],
                    "distance_km": round(origin_to_metro_dist, 1),
                    "duration_mins": cab_time,
                    "fare_inr": cab_fare,
                    "instructions": f"Board city auto or cab to {nearest_to_origin['name']} metro station entrance."
                })
                total_cost += cab_fare
                total_duration += cab_time
            else:
                walk_time = max(3, round(origin_to_metro_dist * 12))
                legs.append({
                    "mode": "walk",
                    "title": f"Walk to {nearest_to_origin['name']} Metro Station",
                    "from_location": origin_name,
                    "to_location": nearest_to_origin['name'],
                    "distance_km": round(origin_to_metro_dist, 1),
                    "duration_mins": walk_time,
                    "fare_inr": 0,
                    "instructions": f"Walk towards metro concourse (approx {walk_time} mins)."
                })
                total_duration += walk_time

            # Leg 2: Chennai Metro Rail
            legs.append({
                "mode": "metro",
                "title": f"Chennai Metro: {nearest_to_origin['name']} to {nearest_to_dest['name']}",
                "from_location": nearest_to_origin['name'],
                "to_location": nearest_to_dest['name'],
                "distance_km": metro_route["total_distance_km"],
                "duration_mins": metro_route["total_time_mins"],
                "fare_inr": metro_route["fare_inr"],
                "lines": metro_route["lines_used"],
                "stations_count": metro_route["total_stations"],
                "interchanges": metro_route["interchange_stations"],
                "instructions": f"Board {metro_route['lines_used'][0].upper()} Line train. {('Transfer at ' + ', '.join(metro_route['interchange_stations']) + '.') if metro_route['interchanges_count'] > 0 else 'Direct transit without line change.'}"
            })
            total_cost += metro_route["fare_inr"]
            total_duration += metro_route["total_time_mins"]

            # Leg 3: Destination Metro to Final Point
            if dest_to_metro_dist > 1.2:
                final_cab_fare = round(35 + (dest_to_metro_dist * 14))
                final_cab_time = max(5, round(dest_to_metro_dist * 2.8))
                legs.append({
                    "mode": "auto",
                    "title": f"Auto / Cab to {dest_name}",
                    "from_location": nearest_to_dest['name'],
                    "to_location": dest_name,
                    "distance_km": round(dest_to_metro_dist, 1),
                    "duration_mins": final_cab_time,
                    "fare_inr": final_cab_fare,
                    "instructions": f"Exit via Gate 2 and take local auto or cab to {dest_name}."
                })
                total_cost += final_cab_fare
                total_duration += final_cab_time
            else:
                final_walk = max(3, round(dest_to_metro_dist * 12))
                legs.append({
                    "mode": "walk",
                    "title": f"Walk to {dest_name}",
                    "from_location": nearest_to_dest['name'],
                    "to_location": dest_name,
                    "distance_km": round(dest_to_metro_dist, 1),
                    "duration_mins": final_walk,
                    "fare_inr": 0,
                    "instructions": "Walk to your destination entrance."
                })
                total_duration += final_walk

            itineraries.append({
                "id": "itinerary_multimodal_metro",
                "label": "Eco Smart Metro Route",
                "highlight": "Lowest Carbon & Avoid Traffic Jams",
                "total_duration_mins": total_duration,
                "total_cost_inr": total_cost,
                "legs_count": len(legs),
                "legs": legs,
                "carbon_savings_kg": round(direct_dist_km * 0.12, 1)
            })

    # OPTION B: Direct Highway Cab / Taxi
    direct_cab_fare = round(90 + (direct_dist_km * 19))
    itineraries.append({
        "id": "itinerary_direct_cab",
        "label": "Direct Prime Sedan Cab",
        "highlight": "Door-to-door Comfort with Chauffeur",
        "total_duration_mins": direct_drive_mins,
        "total_cost_inr": direct_cab_fare,
        "legs_count": 1,
        "legs": [
            {
                "mode": "car",
                "title": f"Direct Chauffeur Cab to {dest_name}",
                "from_location": origin_name,
                "to_location": dest_name,
                "distance_km": round(direct_dist_km, 1),
                "duration_mins": direct_drive_mins,
                "fare_inr": direct_cab_fare,
                "instructions": "Direct AC ride via city arterial corridors."
            }
        ],
        "carbon_savings_kg": 0.0
    })

    # OPTION C: City Express Bus Route
    direct_bus_fare = round(15 + (direct_dist_km * 1.5))
    bus_duration = round(direct_drive_mins * 1.4) + 10
    itineraries.append({
        "id": "itinerary_express_bus",
        "label": "MTC / Intercity Bus Connection",
        "highlight": "Budget Friendly Regional Journey",
        "total_duration_mins": bus_duration,
        "total_cost_inr": direct_bus_fare,
        "legs_count": 1,
        "legs": [
            {
                "mode": "bus",
                "title": f"City Express Bus to {dest_name}",
                "from_location": origin_name,
                "to_location": dest_name,
                "distance_km": round(direct_dist_km, 1),
                "duration_mins": bus_duration,
                "fare_inr": direct_bus_fare,
                "instructions": "Board state transport / MTC service via designated bus stop."
            }
        ],
        "carbon_savings_kg": round(direct_dist_km * 0.08, 1)
    })

    # Sort based on preference
    if preference == "budget":
        itineraries.sort(key=lambda x: x["total_cost_inr"])
    elif preference == "eco":
        itineraries.sort(key=lambda x: x["carbon_savings_kg"], reverse=True)
    else:  # fastest
        itineraries.sort(key=lambda x: x["total_duration_mins"])

    return {
        "origin_name": origin_name,
        "dest_name": dest_name,
        "direct_distance_km": direct_dist_km,
        "direct_drive_mins": direct_drive_mins,
        "itineraries": itineraries,
        "source_attribution": "Integrated CMRL, MTC, OSRM & VoyageFlow Graph Engine"
    }
