from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.seed_data import seed_database

from app.routers import (
    auth, destinations, transport, routes, bookings, payments, wishlist, admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is created and seeded
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description="Full-Stack Travel & Multi-Modal Transportation Booking Ecosystem",
    version="1.0.0",
    lifespan=lifespan
)

# Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(destinations.router, prefix=settings.API_PREFIX)
app.include_router(transport.router, prefix=settings.API_PREFIX)
app.include_router(routes.router, prefix=settings.API_PREFIX)
app.include_router(bookings.router, prefix=settings.API_PREFIX)
app.include_router(payments.router, prefix=settings.API_PREFIX)
app.include_router(wishlist.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "payment_mode": settings.PAYMENT_GATEWAY_MODE
    }
