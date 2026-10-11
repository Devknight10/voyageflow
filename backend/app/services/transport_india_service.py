import random
from typing import Dict, List, Optional, Any
from datetime import datetime
from app.services.routing_service import haversine_distance

# ==================== INDIAN RAILWAYS (TRAINS) DATASET ====================

INDIAN_TRAINS = [
    {
        "train_number": "20643",
        "train_name": "Coimbatore Vande Bharat Express",
        "origin_code": "MAS",
        "origin_name": "Chennai Central (MAS)",
        "dest_code": "CBE",
        "dest_name": "Coimbatore Junction (CBE)",
        "departure_time": "06:00 AM",
        "arrival_time": "11:50 AM",
        "duration": "5h 50m",
        "days_of_run": ["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"],
        "classes": [
            {"code": "CC", "name": "AC Chair Car", "fare": 1365, "status": "AVAILABLE (GNWL 0)"},
            {"code": "EC", "name": "Executive Chair Car", "fare": 2485, "status": "AVAILABLE (GNWL 0)"}
        ],
        "rating": 4.9,
        "food_included": True
    },
    {
        "train_number": "20607",
        "train_name": "Mysuru Vande Bharat Express",
        "origin_code": "MAS",
        "origin_name": "Chennai Central (MAS)",
        "dest_code": "SBC",
        "dest_name": "KSR Bengaluru (SBC)",
        "departure_time": "05:50 AM",
        "arrival_time": "10:15 AM",
        "duration": "4h 25m",
        "days_of_run": ["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"],
        "classes": [
            {"code": "CC", "name": "AC Chair Car", "fare": 995, "status": "AVAILABLE (GNWL 4)"},
            {"code": "EC", "name": "Executive Chair Car", "fare": 1885, "status": "AVAILABLE (GNWL 0)"}
        ],
        "rating": 4.95,
        "food_included": True
    },
    {
        "train_number": "12675",
        "train_name": "Kovai Superfast Express",
        "origin_code": "MAS",
        "origin_name": "Chennai Central (MAS)",
        "dest_code": "CBE",
        "dest_name": "Coimbatore Junction (CBE)",
        "departure_time": "06:10 AM",
        "arrival_time": "02:05 PM",
        "duration": "7h 55m",
        "days_of_run": ["Daily"],
        "classes": [
            {"code": "2S", "name": "Second Sitting", "fare": 195, "status": "AVAILABLE"},
            {"code": "CC", "name": "AC Chair Car", "fare": 690, "status": "AVAILABLE"}
        ],
        "rating": 4.7,
        "food_included": False
    },
    {
        "train_number": "12637",
        "train_name": "Pandian Superfast Express",
        "origin_code": "MS",
        "origin_name": "Chennai Egmore (MS)",
        "dest_code": "MDU",
        "dest_name": "Madurai Junction (MDU)",
        "departure_time": "09:40 PM",
        "arrival_time": "05:25 AM",
        "duration": "7h 45m",
        "days_of_run": ["Daily"],
        "classes": [
            {"code": "SL", "name": "Sleeper Class", "fare": 315, "status": "RAC 12"},
            {"code": "3A", "name": "AC 3 Tier", "fare": 830, "status": "AVAILABLE"},
            {"code": "2A", "name": "AC 2 Tier", "fare": 1180, "status": "AVAILABLE"},
            {"code": "1A", "name": "AC First Class", "fare": 1980, "status": "AVAILABLE"}
        ],
        "rating": 4.85,
        "food_included": False
    },
    {
        "train_number": "12622",
        "train_name": "Tamil Nadu Superfast Express",
        "origin_code": "NDLS",
        "origin_name": "New Delhi (NDLS)",
        "dest_code": "MAS",
        "dest_name": "Chennai Central (MAS)",
        "departure_time": "10:30 PM",
        "arrival_time": "06:15 AM",
        "duration": "31h 45m",
        "days_of_run": ["Daily"],
        "classes": [
            {"code": "SL", "name": "Sleeper Class", "fare": 780, "status": "AVAILABLE"},
            {"code": "3A", "name": "AC 3 Tier", "fare": 2085, "status": "AVAILABLE"},
            {"code": "2A", "name": "AC 2 Tier", "fare": 3050, "status": "AVAILABLE"},
            {"code": "1A", "name": "AC First Class", "fare": 5175, "status": "AVAILABLE"}
        ],
        "rating": 4.8,
        "food_included": False
    },
    {
        "train_number": "12842",
        "train_name": "Coromandel Express",
        "origin_code": "MAS",
        "origin_name": "Chennai Central (MAS)",
        "dest_code": "HWH",
        "dest_name": "Howrah / Kolkata (HWH)",
        "departure_time": "07:00 AM",
        "arrival_time": "11:50 AM",
        "duration": "28h 50m",
        "days_of_run": ["Daily"],
        "classes": [
            {"code": "SL", "name": "Sleeper Class", "fare": 690, "status": "AVAILABLE"},
            {"code": "3A", "name": "AC 3 Tier", "fare": 1845, "status": "AVAILABLE"},
            {"code": "2A", "name": "AC 2 Tier", "fare": 2690, "status": "AVAILABLE"}
        ],
        "rating": 4.6,
        "food_included": False
    }
]

# ==================== INTERCITY BUSES DATASET ====================

INDIAN_BUSES = [
    {
        "id": "bus_101",
        "operator": "TNSTC Ultra Deluxe (Airavat)",
        "bus_type": "Multi-Axle AC Sleeper (2+1)",
        "origin": "Chennai CMBT / Koyambedu",
        "destination": "Pondicherry White Town",
        "departure_time": "07:30 AM",
        "arrival_time": "10:45 AM",
        "duration": "3h 15m",
        "fare": 380,
        "rating": 4.6,
        "seats_available": 14,
        "amenities": ["Air Conditioned", "Push Back Seats", "Mobile Charging", "Water Bottle"]
    },
    {
        "id": "bus_102",
        "operator": "Parveen Travels Signature",
        "bus_type": "Scania Multi-Axle Diamond AC Sleeper (2+1)",
        "origin": "Chennai Kilambakkam (KCBT)",
        "destination": "Bengaluru Electronic City",
        "departure_time": "10:45 PM",
        "arrival_time": "05:30 AM",
        "duration": "6h 45m",
        "fare": 950,
        "rating": 4.85,
        "seats_available": 8,
        "amenities": ["Personal TV Screen", "Blankets", "Live GPS Telemetry", "Emergency Exit", "Snack Pack"]
    },
    {
        "id": "bus_103",
        "operator": "KSRTC Swift Multi-Axle",
        "bus_type": "Volvo 9600 Multi-Axle Sleeper",
        "origin": "Chennai CMBT / Koyambedu",
        "destination": "Coimbatore Gandhipuram",
        "departure_time": "09:30 PM",
        "arrival_time": "05:45 AM",
        "duration": "8h 15m",
        "fare": 890,
        "rating": 4.8,
        "seats_available": 11,
        "amenities": ["Air Suspension", "USB Ports", "GPS Tracking", "Reading Lights"]
    },
    {
        "id": "bus_104",
        "operator": "IntrCity SmartBus",
        "bus_type": "BharatBenz AC Seater/Sleeper",
        "origin": "Chennai Guindy",
        "destination": "Madurai Periyar Bus Stand",
        "departure_time": "10:15 PM",
        "arrival_time": "06:00 AM",
        "duration": "7h 45m",
        "fare": 780,
        "rating": 4.75,
        "seats_available": 16,
        "amenities": ["Smart Lounge Access", "Wi-Fi", "CCTV Security", "Trained Captain"]
    }
]

# ==================== DOMESTIC & INTERNATIONAL FLIGHTS ====================

INDIAN_FLIGHTS = [
    {
        "id": "fl_6e_204",
        "airline": "IndiGo",
        "flight_number": "6E-204",
        "logo": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100",
        "origin_code": "MAA",
        "origin_airport": "Chennai International Airport",
        "dest_code": "DEL",
        "dest_airport": "Indira Gandhi International, New Delhi",
        "departure_time": "06:15 AM",
        "arrival_time": "09:05 AM",
        "duration": "2h 50m",
        "stops": "Non-stop",
        "fare": 4650,
        "seats_left": 9,
        "baggage": "15 kg Check-in · 7 kg Cabin"
    },
    {
        "id": "fl_uk_832",
        "airline": "Vistara",
        "flight_number": "UK-832",
        "logo": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100",
        "origin_code": "MAA",
        "origin_airport": "Chennai International Airport",
        "dest_code": "BOM",
        "dest_airport": "Chhatrapati Shivaji Maharaj, Mumbai",
        "departure_time": "08:30 AM",
        "arrival_time": "10:25 AM",
        "duration": "1h 55m",
        "stops": "Non-stop",
        "fare": 4120,
        "seats_left": 5,
        "baggage": "15 kg Check-in · 7 kg Cabin · Complimentary Meal"
    },
    {
        "id": "fl_ai_572",
        "airline": "Air India",
        "flight_number": "AI-572",
        "logo": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100",
        "origin_code": "MAA",
        "origin_airport": "Chennai International Airport",
        "dest_code": "BLR",
        "dest_airport": "Kempegowda International, Bengaluru",
        "departure_time": "11:10 AM",
        "arrival_time": "12:10 PM",
        "duration": "1h 00m",
        "stops": "Non-stop",
        "fare": 2450,
        "seats_left": 12,
        "baggage": "15 kg Check-in · 7 kg Cabin"
    },
    {
        "id": "fl_ek_543",
        "airline": "Emirates",
        "flight_number": "EK-543",
        "logo": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100",
        "origin_code": "MAA",
        "origin_airport": "Chennai International Airport",
        "dest_code": "DXB",
        "dest_airport": "Dubai International (DXB)",
        "departure_time": "04:00 AM",
        "arrival_time": "06:45 AM",
        "duration": "4h 15m",
        "stops": "Non-stop (International)",
        "fare": 18900,
        "seats_left": 4,
        "baggage": "30 kg Check-in · 7 kg Cabin · Full Hot Meal"
    }
]

# ==================== CHENNAI CABS & LOCAL MOBILITY ====================

def calculate_cab_estimates(distance_km: float) -> List[Dict[str, Any]]:
    d = max(1.5, distance_km)
    return [
        {
            "id": "cab_auto",
            "name": "Chennai City Auto",
            "category": "auto",
            "capacity": 3,
            "eta_mins": 3,
            "base_fare": 35,
            "per_km_rate": 14,
            "total_fare": round(35 + (d * 14)),
            "description": "Fast & authentic city three-wheeler auto-rickshaw. Ideal for short hops & markets."
        },
        {
            "id": "cab_mini",
            "name": "Voyage Go Mini",
            "category": "hatchback",
            "capacity": 4,
            "eta_mins": 4,
            "base_fare": 60,
            "per_km_rate": 16,
            "total_fare": round(60 + (d * 16)),
            "description": "Compact AC hatchback (Maruti WagonR / Tata Tiago). Great value city travel."
        },
        {
            "id": "cab_sedan",
            "name": "Voyage Prime Sedan",
            "category": "sedan",
            "capacity": 4,
            "eta_mins": 5,
            "base_fare": 90,
            "per_km_rate": 19,
            "total_fare": round(90 + (d * 19)),
            "description": "Spacious AC sedan (Swift Dzire / Toyota Etios). Top rated chauffeurs with boot space."
        },
        {
            "id": "cab_suv",
            "name": "Voyage Prime SUV",
            "category": "suv",
            "capacity": 6,
            "eta_mins": 7,
            "base_fare": 160,
            "per_km_rate": 26,
            "total_fare": round(160 + (d * 26)),
            "description": "Premium 6-seater SUV (Toyota Innova Crysta). Perfect for families & coastal tours."
        },
        {
            "id": "cab_airport",
            "name": "Airport FastTrack Transfer",
            "category": "airport",
            "capacity": 4,
            "eta_mins": 8,
            "base_fare": 450,
            "per_km_rate": 20,
            "total_fare": round(450 + (d * 20)),
            "description": "Guaranteed curbside pickup at Chennai Airport with flight tracking & luggage assist."
        }
    ]
