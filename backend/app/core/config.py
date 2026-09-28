import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PhysioDesk API"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "physiodesk")
    SQLALCHEMY_DATABASE_URI: str = f"postgresql+psycopg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    # Optional override via environment variable (comma separated)
    CORS_ORIGINS_ENV: str = os.getenv("BACKEND_CORS_ORIGINS", "")

    @property
    def cors_origins(self) -> list[str]:
        if self.CORS_ORIGINS_ENV:
            return [origin.strip() for origin in self.CORS_ORIGINS_ENV.split(",")]
        return self.BACKEND_CORS_ORIGINS

    class Config:
        case_sensitive = True

settings = Settings()
