# Import required FastAPI components and utilities
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
    This is the main application factory that sets up all necessary components:
    - FastAPI application instance
    - API routing
    - CORS middleware
    - Database initialization
    - Qdrant collection setup
    """
    # Set up the API description and metadata
    description = f"{settings.PROJECT_NAME} API"
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_PATH}/openapi.json",
        docs_url="/docs/",
        description=description,
        redoc_url=None,
    )

    # Include API router - connects all API endpoints defined in the application
    app.include_router(api_router)
    
    # Setup CORS middleware to handle cross-origin requests
    setup_cors_middleware(app)

    # Initialize the database and create tables if they don't exist
    initialize_database()

    # Initialize Qdrant collection for vector search functionality
    create_qdrant_collection()

    return app

def setup_cors_middleware(app):
    """
    Configures CORS middleware for the app.
    This middleware handles Cross-Origin Resource Sharing (CORS) to allow
    requests from different origins (domains) to access the API.
    Currently configured to allow all origins during development.
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
    This function:
    1. Checks if the database exists
    2. Creates the database if it doesn't exist
    3. Creates all tables defined in the models using SQLAlchemy Base
    """
    # Extract the database URL from the engine configuration
    database_url = engine.url

    # Check if the database exists and create it if it doesn't
    if not database_exists(database_url):
        print(f"Database does not exist. Creating database: {database_url.database}")
        create_database(database_url)

    # Create all tables defined in the models if they don't exist
    Base.metadata.create_all(bind=engine)
