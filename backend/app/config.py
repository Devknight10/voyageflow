import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)

    PROJECT_NAME: str = "VoyageFlow India"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "voyageflow-india-super-secret-jwt-key-2026-production-min-32-chars-long")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./voyageflow.db")
    
    # Regional Configuration
    DEFAULT_CURRENCY: str = "INR"
    DEFAULT_CURRENCY_SYMBOL: str = "₹"
    DEFAULT_CITY: str = "Chennai"
    DEFAULT_STATE: str = "Tamil Nadu"
    DEFAULT_LAT: float = 13.0827
    DEFAULT_LNG: float = 80.2707

    # Payment Gateway Configuration (Razorpay Sandbox by default for Indian market)
    PAYMENT_GATEWAY_MODE: str = os.getenv("PAYMENT_GATEWAY_MODE", "SANDBOX")
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_voyageflow_india_2026")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "mock_rzp_secret_key_voyageflow_in")
    STRIPE_PUBLISHABLE_KEY: str = os.getenv("STRIPE_PUBLISHABLE_KEY", "pk_test_voyageflow51MockKey")
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "sk_test_voyageflowMockSecret")

    # Routing Services
    OSRM_API_URL: str = os.getenv("OSRM_API_URL", "https://router.project-osrm.org/route/v1/driving")

settings = Settings()
