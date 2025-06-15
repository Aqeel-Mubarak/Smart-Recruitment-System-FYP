# Import required SQLAlchemy components for database operations
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


# Create the SQLAlchemy engine instance
# This engine is responsible for managing database connections and executing SQL statements
# It uses the database URL from the application settings
engine = create_engine(settings.DATABASE_URL.unicode_string())

# Create a session factory using the engine
# SessionLocal will be used to create individual database sessions
# autocommit=False: Changes are not automatically committed to the database
# autoflush=False: Changes are not automatically flushed to the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a base class for declarative models
# All database models will inherit from this Base class
Base = declarative_base()

# Dependency function for FastAPI to get database sessions
# This function creates a new database session for each request
# and ensures the session is properly closed after use
def get_db():
    db = SessionLocal()
    try:
        yield db  # Provide the database session to the route handler
    finally:
        db.close()  # Ensure the database session is closed after use