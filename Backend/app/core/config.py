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
    FRONTEND_URL: AnyHttpUrl = "http://localhost:5173/"
    BACKEND_CORS_ORIGINS: Union[str, List[AnyHttpUrl]] = ["http://localhost:5173", "http://localhost:8000"]
    DATABASE_URL: PostgresDsn = "postgresql://postgres:Aqeel1032@localhost/remoteDB"
    #Auth
    SECRET_KEY: str = "this is the secret key for fyp" 
    ALGORITHM: str = "HS256" 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080 # session will expire in 7 days.

settings = Settings()
