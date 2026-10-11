import json
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models import (
    User, Destination, TransportProvider, TransportService,
    RouteSchedule, Booking, Payment, Wishlist, Review
)
from app.auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Destination).count() > 0:
        print("Database already contains data. Skipping initial seed.")
        db.close()
        return

    print("Seeding database with pristine VoyageFlow catalog...")

    # 1. Users
    traveler = User(
        username="demotraveler",
        email="traveler@voyageflow.io",
        hashed_password=hash_password("password123"),
        full_name="Elena Rostova",
        phone="+1 (555) 492-1049",
        role="traveler"
    )
    admin = User(
        username="demoadmin",
        email="admin@voyageflow.io",
        hashed_password=hash_password("password123"),
        full_name="Marcus Sterling",
        phone="+1 (555) 880-9922",
        role="admin"
    )
    db.add_all([traveler, admin])
    db.commit()
    db.refresh(traveler)
    db.refresh(admin)

    # 2. Transport Providers
    p_luxury = TransportProvider(
        name="Voyage Elite Drive",
        logo_url="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=120",
        rating=4.9,
        contact_phone="+1 800-VOYAGE-LUX",
        support_email="elite@voyageflow.io"
    )
    p_metro = TransportProvider(
        name="MetroRail Express Transit",
        logo_url="https://images.unsplash.com/photo-1532105956626-ce5c407b4966?w=120",
        rating=4.8,
        contact_phone="+1 800-CITY-METRO",
        support_email="support@citytransit.org"
    )
    p_coach = TransportProvider(
        name="InterCity Prime Coach",
        logo_url="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=120",
        rating=4.7,
        contact_phone="+1 800-COACH-GO",
        support_email="routes@intercityprime.com"
    )
    p_marine = TransportProvider(
        name="Coastal Wave Charters",
        logo_url="https://images.unsplash.com/photo-1544551763-47a184117db7?w=120",
        rating=4.9,
        contact_phone="+1 800-SEA-WAVE",
        support_email="captain@coastalwave.com"
    )
    p_bike = TransportProvider(
        name="EcoMotion Smart Mobility",
        logo_url="https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=120",
        rating=4.6,
        contact_phone="+1 800-ECO-BIKE",
        support_email="help@ecomotion.io"
    )
    db.add_all([p_luxury, p_metro, p_coach, p_marine, p_bike])
    db.commit()

    # 3. Transport Services
    services_data = [
        {
            "provider_id": p_luxury.id,
            "name": "Tesla Model S Plaid",
            "type": "rental",
            "vehicle_model": "Tesla Model S (Full Self-Driving)",
            "capacity": 5,
            "base_fare": 85.0,
            "per_km_rate": 2.20,
            "image_url": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
            "cancellation_policy": "Free cancellation up to 6 hours before departure",
            "rating": 4.95,
            "current_lat": 13.0475,
            "current_lng": 80.2089,
            "features": json.dumps(["Autopilot", "Zero Emissions", "Supercharging Included", "Premium Audio", "Heated Seats"])
        },
        {
            "provider_id": p_luxury.id,
            "name": "Mercedes-Benz E-Class Chauffeur",
            "type": "car",
            "vehicle_model": "Mercedes E 350d Exclusive",
            "capacity": 4,
            "base_fare": 75.0,
            "per_km_rate": 2.40,
            "image_url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
            "cancellation_policy": "Free cancellation up to 4 hours before pickup",
            "rating": 4.90,
            "current_lat": 13.0674,
            "current_lng": 80.2376,
            "features": json.dumps(["Chauffeur Driven", "Bottled Water & Wi-Fi", "Luggage Assistance", "Leather Interior"])
        },
        {
            "provider_id": p_luxury.id,
            "name": "City Rapid Taxi",
            "type": "taxi",
            "vehicle_model": "Toyota Camry Hybrid",
            "capacity": 4,
            "base_fare": 12.0,
            "per_km_rate": 1.40,
            "image_url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
            "cancellation_policy": "Free cancellation up to 15 mins before arrival",
            "rating": 4.75,
            "current_lat": 13.0827,
            "current_lng": 80.2707,
            "features": json.dumps(["Instant Dispatch", "Contactless Payment", "Climate Controlled", "GPS Tracked"])
        },
        {
            "provider_id": p_metro.id,
            "name": "BlueLine High-Speed Metro",
            "type": "train",
            "vehicle_model": "Alstom Metropolis High-Capacity Train",
            "capacity": 250,
            "base_fare": 3.0,
            "per_km_rate": 0.20,
            "image_url": "https://images.unsplash.com/photo-1532105956626-ce5c407b4966?w=800",
            "cancellation_policy": "Non-refundable ticket after purchase",
            "rating": 4.88,
            "current_lat": 12.9941,
            "current_lng": 80.1709,
            "features": json.dumps(["High-Frequency Departures (Every 5 mins)", "Air Conditioned", "Accessibility Ramps", "Zero Traffic Delay"])
        },
        {
            "provider_id": p_coach.id,
            "name": "Scania Multiaxle Sleeper Coach",
            "type": "bus",
            "vehicle_model": "Scania Metrolink HD",
            "capacity": 42,
            "base_fare": 26.0,
            "per_km_rate": 0.55,
            "image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
            "cancellation_policy": "Free cancellation up to 12 hours before trip",
            "rating": 4.70,
            "current_lat": 13.0604,
            "current_lng": 80.2496,
            "features": json.dumps(["Reclining Sleeper Berths", "Personal USB Charging", "Live GPS Telemetry", "On-board Restroom"])
        },
        {
            "provider_id": p_luxury.id,
            "name": "SkyLink VIP Airport Shuttle",
            "type": "airport_transfer",
            "vehicle_model": "Mercedes-Benz Sprinter Executive",
            "capacity": 12,
            "base_fare": 35.0,
            "per_km_rate": 1.70,
            "image_url": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800",
            "cancellation_policy": "Free cancellation up to 3 hours before flight arrival",
            "rating": 4.85,
            "current_lat": 12.9900,
            "current_lng": 80.1693,
            "features": json.dumps(["Flight Delay Guarantee", "Ample Luggage Bay", "Curbside Meet & Greet", "High-speed Wi-Fi"])
        },
        {
            "provider_id": p_marine.id,
            "name": "Ocean Breeze Luxury Catamaran",
            "type": "boat",
            "vehicle_model": "Sunreef 50 Sailing Catamaran",
            "capacity": 10,
            "base_fare": 160.0,
            "per_km_rate": 7.50,
            "image_url": "https://images.unsplash.com/photo-1544551763-47a184117db7?w=800",
            "cancellation_policy": "Free cancellation up to 24 hours before cruise",
            "rating": 4.96,
            "current_lat": 12.9863,
            "current_lng": 80.2581,
            "features": json.dumps(["Licensed Sea Captain", "Safety Life Jackets", "Complimentary Refreshments", "Sunset Deck"])
        },
        {
            "provider_id": p_bike.id,
            "name": "Trek DualSport Smart E-Bike",
            "type": "bike",
            "vehicle_model": "Trek Allant+ 7 Smart GPS",
            "capacity": 1,
            "base_fare": 5.0,
            "per_km_rate": 0.70,
            "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800",
            "cancellation_policy": "Cancel anytime before unlock",
            "rating": 4.65,
            "current_lat": 13.0418,
            "current_lng": 80.2824,
            "features": json.dumps(["Electric Pedal Assist", "App-controlled Smart Lock", "Helmet Included", "Front Basket"])
        }
    ]

    for s_info in services_data:
        service = TransportService(**s_info)
        db.add(service)
    db.commit()

    # 4. Destinations
    destinations_data = [
        {
            "name": "Ocean Azure Cliffside Resort",
            "title": "5-Star Seaside Sanctuary with Infinity Pool & Private Beach",
            "category": "stays",
            "city": "East Coast Corridor",
            "country": "India",
            "lat": 12.8230,
            "lng": 80.2412,
            "price": 320.0,
            "unit": "night",
            "rating": 4.95,
            "reviews_count": 342,
            "image_url": "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
            "description": "Perched gracefully along the golden coast of ECR, Ocean Azure offers panoramic ocean views, private sundecks, an infinity pool, and world-class culinary dining.",
            "amenities": json.dumps(["Ocean View", "Private Beach", "Infinity Pool", "Spa & Wellness", "Free Breakfast", "EV Charging"]),
            "is_featured": True
        },
        {
            "name": "The Grand Heritage Palace",
            "title": "Colonial Boutique Oasis near the Historic City Quarter",
            "category": "stays",
            "city": "Chennai",
            "country": "India",
            "lat": 13.0674,
            "lng": 80.2376,
            "price": 180.0,
            "unit": "night",
            "rating": 4.88,
            "reviews_count": 218,
            "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            "description": "Step into aristocratic elegance with antique teak architecture, manicured botanical courtyards, high ceilings, and Michelin-inspired traditional hospitality.",
            "amenities": json.dumps(["Courtyard Dining", "Heritage Architecture", "Valet Parking", "Cocktail Bar", "High-speed Wi-Fi"]),
            "is_featured": True
        },
        {
            "name": "CloudNine Infinity Coastal Villa",
            "title": "Private Architect Villa with Panoramic Sea Balconies",
            "category": "stays",
            "city": "Mahabalipuram",
            "country": "India",
            "lat": 12.6300,
            "lng": 80.1980,
            "price": 420.0,
            "unit": "night",
            "rating": 4.97,
            "reviews_count": 189,
            "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            "description": "An architectural tour-de-force with floor-to-ceiling glass walls, private saltwater pool, personal concierge, and secluded shore access.",
            "amenities": json.dumps(["Private Pool", "Chef on Request", "Direct Beach Access", "Sonos Sound System", "BBQ Patio"]),
            "is_featured": True
        },
        {
            "name": "Shinjuku Zen Capsule Hotel",
            "title": "Futuristic Ergonomic Pods for Nomads & Business Travelers",
            "category": "stays",
            "city": "OMR Tech Corridor",
            "country": "India",
            "lat": 12.9171,
            "lng": 80.2281,
            "price": 28.0,
            "unit": "night",
            "rating": 4.75,
            "reviews_count": 520,
            "image_url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
            "description": "Ultra-efficient, sound-insulated smart sleeping pods designed for digital nomads and tech travelers, featuring ergonomic mattresses and co-working lounges.",
            "amenities": json.dumps(["High-Speed Fiber Wi-Fi", "Co-working Desks", "Keycard Security", "Espresso Bar", "Locker Room"]),
            "is_featured": False
        },
        {
            "name": "Marina Shoreline Golden Promenade",
            "title": "World's Second Longest Natural Urban Beach Experience",
            "category": "experiences",
            "city": "Chennai",
            "country": "India",
            "lat": 13.0418,
            "lng": 80.2824,
            "price": 0.0,
            "unit": "free",
            "rating": 4.80,
            "reviews_count": 1450,
            "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f7405a?w=800",
            "description": "A vibrant 13-kilometer coastline celebrated for majestic sunrise views, street food stalls, heritage statues, and cool evening sea breezes.",
            "amenities": json.dumps(["Public Promenade", "Sunrise Views", "Street Food Stalls", "Lighthouse Access", "Bicycle Paths"]),
            "is_featured": True
        },
        {
            "name": "Shore Temple UNESCO Heritage Sanctuary",
            "title": "8th-Century Granite Structural Stone Temples Overlooking the Bay",
            "category": "attractions",
            "city": "Mahabalipuram",
            "country": "India",
            "lat": 12.6160,
            "lng": 80.1925,
            "price": 15.0,
            "unit": "entry",
            "rating": 4.93,
            "reviews_count": 980,
            "image_url": "https://images.unsplash.com/photo-1623190209341-3604f8016f4d?w=800",
            "description": "A UNESCO World Heritage monument sculpted during the Pallava dynasty, resisting maritime weather for over a millennium with majestic bas-relief carvings.",
            "amenities": json.dumps(["Guided Audio Tour", "UNESCO Protected", "Photography Friendly", "Souvenir Marketplace"]),
            "is_featured": True
        },
        {
            "name": "Emerald Palms Eco-Glamping Retreat",
            "title": "Lush Tropical Safari Tents Surrounded by Bird Sanctuaries",
            "category": "stays",
            "city": "Vedanthangal",
            "country": "India",
            "lat": 12.5450,
            "lng": 79.8550,
            "price": 145.0,
            "unit": "night",
            "rating": 4.84,
            "reviews_count": 112,
            "image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
            "description": "Luxury safari canvas suites under swaying coconut groves, bird watching trails, organic farm-to-table cuisine, and stargazing bonfires.",
            "amenities": json.dumps(["Organic Dining", "Bird Watching Safari", "Open Air Showers", "Stargazing Telescope", "Campfire Nights"]),
            "is_featured": False
        },
        {
            "name": "Horizon Skyline Sky-Penthouse",
            "title": "High-Rise Duplex Penthouse with Private Jacuzzi & City View",
            "category": "stays",
            "city": "Anna Nagar",
            "country": "India",
            "lat": 13.0850,
            "lng": 80.2100,
            "price": 260.0,
            "unit": "night",
            "rating": 4.91,
            "reviews_count": 275,
            "image_url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            "description": "Floor 28 penthouse suite commanding 360-degree metropolitan panoramas, heated outdoor Jacuzzi, wine cellar, and smart home automation.",
            "amenities": json.dumps(["Rooftop Jacuzzi", "Panoramic View", "Smart Home iPad", "Wine Chiller", "Gym & Pool Access"]),
            "is_featured": True
        }
    ]

    for d_info in destinations_data:
        dest = Destination(**d_info)
        db.add(dest)
    db.commit()

    # 5. Seed an active confirmed booking & payment for the demo traveler
    first_service = db.query(TransportService).first()
    first_dest = db.query(Destination).first()

    booking_date = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")
    booking = Booking(
        reference_code="VF-892104",
        user_id=traveler.id,
        booking_type="transport",
        item_id=first_service.id,
        item_name=first_service.name,
        pickup_location="Anna Salai City Center, Chennai",
        dropoff_location="Ocean Azure Resort, ECR Highway",
        pickup_lat=13.0674,
        pickup_lng=80.2376,
        dropoff_lat=12.8230,
        dropoff_lng=80.2412,
        travel_date=booking_date,
        travel_time="10:30 AM",
        passengers_count=2,
        passenger_details=json.dumps([
            {"name": "Elena Rostova", "age": 29, "gender": "Female"},
            {"name": "Liam Vance", "age": 31, "gender": "Male"}
        ]),
        subtotal=first_service.base_fare + 45.0,
        tax_amount=10.40,
        fees_amount=2.50,
        discount_amount=10.0,
        total_amount=132.90,
        currency="USD",
        status="CONFIRMED"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    payment = Payment(
        booking_id=booking.id,
        order_id="order_sandbox_seed_9921",
        payment_id="pay_sandbox_verified_4412",
        signature="sig_valid_voyageflow_seed_9921",
        gateway="STRIPE_TEST",
        payment_method="CARD",
        amount=132.90,
        currency="USD",
        status="SUCCESS",
        receipt_url=f"/api/payments/receipt/{booking.reference_code}"
    )
    db.add(payment)

    # Wishlist item for traveler
    db.add(Wishlist(user_id=traveler.id, destination_id=first_dest.id))
    db.commit()

    print("Seed complete! Created users, providers, transport fleet, destinations, and demo booking.")
    db.close()

if __name__ == "__main__":
    seed_database()
