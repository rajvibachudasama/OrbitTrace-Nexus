import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "OrbitTrace Nexus"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "orbittrace-nexus-super-secret-key-2026-space-defense")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite:///./orbittrace_nexus.db"
    
    # Simulation Parameters
    SIMULATION_INTERVAL_SECONDS: float = 1.0
    CONSTELLATION_SIZE: int = 8
    GROUND_STATION_COUNT: int = 3
    
    # Trust Thresholds
    TRUST_THRESHOLD_SUSPICIOUS: float = 80.0
    TRUST_THRESHOLD_HIGH_RISK: float = 60.0
    TRUST_THRESHOLD_UNTRUSTED: float = 40.0
    TRUST_THRESHOLD_ISOLATED: float = 20.0
    
    # Response Engine
    AUTO_RESPONSE_ENABLED: bool = True
    AUTO_ISOLATE_ON_CRITICAL: bool = True
    
    class Config:
        case_sensitive = True

settings = Settings()
