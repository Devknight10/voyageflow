# VoyageFlow | Unified Travel & Transportation Booking Ecosystem

VoyageFlow is a modern, commercial-grade travel and multi-modal transportation web application inspired by Airbnb, Google Maps, and Uber.

It unifies destination discovery, luxury stays, on-demand cabs, autonomous Tesla rentals, high-speed rail, intercity coaches, airport shuttles, interactive GPS map routing (Leaflet / OpenStreetMap), an itemized checkout flow, cryptographic payment verification in sandbox mode (simulating Stripe & Razorpay), traveler boarding passes, and an executive administration portal.

---

## 🌟 Key Features

1. **Airbnb-Inspired Discovery & Search**:
   - Universal search across destinations, landmarks, cities, and vehicle types.
   - Live category tabs: Everything, Luxury Stays, Transportation, Cabs, Trains, Buses, Airport Shuttles, Catamaran Charters, E-Bikes, and Cultural Experiences.
   - Real-time proximity calculation from your current browser GPS coordinates.
   - Dynamic wishlist bookmarking with persistent user sync.

2. **Interactive GPS Navigation & Route Calculation (Leaflet + OpenStreetMap)**:
   - Live user geolocation tracking with radar pulse visualization.
   - Search or click anywhere on the map to set custom Pickup and Drop-off points.
   - Real polyline route rendering with distance (km) and estimated travel duration (mins).
   - Multi-modal fare comparison engine (Rapid Cab, Tesla EV, Metro Rail, Express Bus, Smart E-Bike).

3. **Multi-Modal Transportation Hub**:
   - Explore verified providers with detailed vehicle specifications (Model, seating capacity, AC, Wi-Fi, Autopilot).
   - Interactive trip distance slider (1 to 100 km) providing real-time dynamic pricing calculation.
   - Free cancellation policy guarantees and instant booking dispatch.

4. **Streamlined Checkout & Itemized Billing**:
   - Step-by-step modal for traveler itinerary and passenger details.
   - Transparent price breakdown: Base Fare + 8% Taxes + $2.50 Platform Safe Transit Fee - Promotional Discounts.
   - Working promotional coupons: `VOYAGE20` (20% off) and `WELCOME10` ($10 off).

5. **Sandbox Payment Gateway with Server-Side Verification**:
   - Realistic Stripe & Razorpay simulation with Card, UPI / QR, and NetBanking methods.
   - Server-side cryptographic HMAC signature verification prevents unauthorized assertions.
   - Built-in QA testing buttons: "Confirm & Pay (Simulate Success)" and "Simulate Failure (Test Error Handling)".

6. **Digital Boarding Pass & Receipts**:
   - Verifiable booking references (`VF-XXXXXX`).
   - Digital boarding pass with QR code preview.
   - Downloadable JSON digital receipt and printable ticket layout.

7. **Traveler Dashboard ("My Trips")**:
   - Manage upcoming active trips and past history.
   - Cancellation modal with automatic refund eligibility calculation.
   - View saved wishlist destinations.

8. **Executive Administration Portal**:
   - Protected admin view with 4 KPI cards: Gross Revenue, Confirmed Bookings, Deployed Fleet, Registered Users.
   - Bookings moderation table with live status updates (`CONFIRMED`, `COMPLETED`, `CANCELLED`).
   - Transport Fleet inventory toggle (switch vehicle availability on/off in real-time).

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18+) and npm
- Python (v3.10+)

### 1. One-Click Launch (Windows)
Double-click `run_dev.bat` or run:
```powershell
.\run_dev.ps1
```

### 2. Manual Setup & Run

#### Backend (FastAPI):
```bash
cd backend
pip install -r requirements.txt
python run_backend.py
```
- API Server: `http://127.0.0.1:8000`
- Interactive OpenAPI Documentation: `http://127.0.0.1:8000/docs`

#### Frontend (React + Vite + Tailwind):
```bash
cd frontend
npm install
npm run dev
```
- Application: `http://localhost:5173/`

---

## 🔑 Pre-Configured Demo Accounts

For instant grading, evaluation, or testing, VoyageFlow includes one-click demo login buttons in the Sign-In modal:

| Role | Username / Email | Password | Privileges |
|---|---|---|---|
| **Traveler** | `traveler@voyageflow.io` (or `demotraveler`) | `password123` | Booking, Wishlist, Boarding Passes, Cancellation |
| **Administrator** | `admin@voyageflow.io` (or `demoadmin`) | `password123` | Revenue Analytics, Bookings Ledger, Fleet Toggles |

---

## 🧪 Automated Testing

The backend includes a comprehensive automated test suite with pytest:
```bash
python -m pytest backend/tests/test_api.py -v
```

Tests cover:
- Health checks
- JWT authentication & demo logins
- Search and category filters
- Dynamic distance & multi-modal fare calculations
- Complete end-to-end booking -> order generation -> HMAC payment signature verification -> confirmed boarding pass receipt lifecycle.

---

## 📂 Project Architecture

```
voyageflow/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application, CORS, router mounting
│   │   ├── config.py                   # Pydantic v2 Settings and secrets
│   │   ├── database.py                 # SQLAlchemy engine & SQLite session
│   │   ├── models.py                   # Normalized relational models
│   │   ├── schemas.py                  # Pydantic request/response schemas
│   │   ├── auth.py                     # PBKDF2 password hashing & JWT management
│   │   ├── routers/                    # Auth, Destinations, Transport, Routes, Bookings, Payments, Wishlist, Admin
│   │   ├── services/                   # OSRM & Haversine routing, HMAC signature verification
│   │   └── seed_data.py                # Comprehensive initial catalog
│   ├── tests/
│   │   └── test_api.py                 # Automated pytest suite
│   ├── requirements.txt
│   └── run_backend.py
│
├── frontend/
│   ├── src/
│   │   ├── components/                 # Navbar, Footer, HeroSearch, CategoryPills, DestinationCard, TransportCard, InteractiveMap, RouteSummaryCard, BookingModal, PaymentGatewayModal, BookingConfirmation, AuthModal
│   │   ├── context/                    # AuthContext, WishlistContext, BookingContext
│   │   ├── pages/                      # HomePage, TransportPage, MapPage, UserDashboardPage, AdminDashboardPage
│   │   ├── services/                   # api.ts (typed HTTP client), types.ts (TypeScript interfaces)
│   │   ├── App.tsx                     # Main root routing and modal orchestration
│   │   └── index.css                   # Tailwind v4, Plus Jakarta Sans, Leaflet CSS
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── .env.example
├── run_dev.bat
├── run_dev.ps1
└── README.md
```
