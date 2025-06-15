# Import Pydantic's BaseModel for data validation and serialization
from pydantic import BaseModel


# Schema for creating a new job posting
# Contains the required fields when creating a job
class JobCreate(BaseModel):
    title: str  # The title/position of the job
    description_text: str  # Detailed description of the job requirements and responsibilities

# Schema for reading/retrieving job data
# Inherits all fields from JobCreate and adds an ID field
class JobRead(JobCreate):
    id: int  # Unique identifier for the job posting

    class Config:
        orm_mode = True  # Enables ORM mode for SQLAlchemy integration