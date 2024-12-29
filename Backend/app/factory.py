from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.api.__init__ import api_router
from app.core.config import settings
from app.utils.qdrant_utils import create_qdrant_collection  # Import correct function
from sqlalchemy import create_engine
from sqlalchemy.exc import ProgrammingError
from sqlalchemy_utils import database_exists, create_database
from app.database import engine  # Import database engine
from app.models import Base  # Import Base for table creation

def create_app():
    """
    Factory function to create and configure the FastAPI app.
    """
    description = f"{settings.PROJECT_NAME} API"
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_PATH}/openapi.json",
        docs_url="/docs/",
        description=description,
        redoc_url=None,
    )

    # Include API router
    app.include_router(api_router)
    print("Registered Routes:")
    for route in app.routes:
        print(f"Path: {route.path}, Name: {route.name}, Methods: {route.methods}")


    # Setup CORS middleware
    setup_cors_middleware(app)

    # Create the database if it doesn't exist
    initialize_database()

    # Initialize Qdrant collection
    create_qdrant_collection()

    return app

def setup_cors_middleware(app):
    """
    Configures CORS middleware for the app.
    """
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # Allow all origins during development
            allow_credentials=True,
            allow_methods=["*"],  # Allow all methods
            allow_headers=["*"],  # Allow all headers
        )

def initialize_database():
    """
    Ensures the database and tables are created.
    """
    # Extract the database URL
    database_url = engine.url

    # Check if the database exists
    if not database_exists(database_url):
        print(f"Database does not exist. Creating database: {database_url.database}")
        create_database(database_url)

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
