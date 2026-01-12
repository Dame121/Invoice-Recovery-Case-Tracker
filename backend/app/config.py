from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database configuration - using SQLite for easy local development
    DATABASE_URL: str = "sqlite:///./invoice_recovery.db"
    
    # Application settings
    APP_NAME: str = "Invoice Recovery Tracker"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
