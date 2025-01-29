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
    PROJECT_NAME: StrictStr = "FastAPI Backend"
    API_PATH: StrictStr = "/api/"
    FRONTEND_URL: AnyHttpUrl = "http://207.180.240.67/"
    BACKEND_CORS_ORIGINS: Union[str, List[AnyHttpUrl]] = ["http://localhost:5173", "http://localhost:8000"]

    DATABASE_URL: PostgresDsn = "postgresql://postgres:Aqeel1032@localhost/fyp"

    #Auth
    SECRET_KEY: str = "this is the secret key for fyp" 
    ALGORITHM: str = "HS256"  # Algorithm for hashing JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 100000000

settings = Settings()
