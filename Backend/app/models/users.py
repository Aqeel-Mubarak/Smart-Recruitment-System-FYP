# Import necessary SQLAlchemy components for database modeling
from sqlalchemy import Column, Integer, String, Text, ForeignKey,Boolean
from sqlalchemy.orm import relationship
from app.database import Base


# User model representing the users table in the database
class User(Base):
    # Define the table name in the database
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    cell_phone = Column(String(15), nullable=False)
    company_name = Column(String(100), nullable=True)
    city = Column(String(50), nullable=True)
    country = Column(String(50), nullable=True)
    gender = Column(String(10), nullable=False) 
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    jobs = relationship("JobDescription", back_populates="hr")