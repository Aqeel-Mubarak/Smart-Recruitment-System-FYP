# Import required FastAPI and related dependencies
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from typing import List, Union
from pydantic import (
    AnyHttpUrl,
    PostgresDsn,
    StrictStr,
)
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Basic application settings
    PROJECT_NAME: StrictStr = "FastAPI Backend"  # Name of the project/application
    API_PATH: StrictStr = "/api/"  # Base path for all API endpoints
    FRONTEND_URL: AnyHttpUrl = "http://localhost:5173/"  # URL where the frontend is hosted
    
    # CORS (Cross-Origin Resource Sharing) configuration
    # List of allowed origins that can access the API
    BACKEND_CORS_ORIGINS: Union[str, List[AnyHttpUrl]] = ["http://localhost:5173", "http://localhost:8000"]
    DATABASE_URL: PostgresDsn = "postgresql://postgres:password@localhost:5433/databasext22"
    #Auth
    SECRET_KEY: str = "this is the secret key for fyp" 
    ALGORITHM: str = "HS256" 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080 # session will expire in 7 days.

    
    # Database configuration
    # PostgreSQL connection string with credentials and database name
    DATABASE_URL: PostgresDsn = "postgresql://postgres:bsdsf21m019@localhost/remoteDB"
    
    # Authentication settings
    SECRET_KEY: str = "this is the secret key for fyp"  # Secret key for JWT token generation
    ALGORITHM: str = "HS256"  # Algorithm used for JWT token signing
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # Token expiration time (7 days in minutes)

# Create a global settings instance that can be imported and used throughout the application
settings = Settings()
