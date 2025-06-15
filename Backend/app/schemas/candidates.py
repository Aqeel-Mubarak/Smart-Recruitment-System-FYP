# Import required Pydantic components for data validation and email handling
from pydantic import BaseModel, EmailStr
from typing import Optional


# Schema for creating a new candidate
# This class defines the required and optional fields when creating a candidate record
class CandidateCreate(BaseModel):
    name: str  # Full name of the candidate
    resume_text: str  # Text content of the candidate's resume
    job_description_id: int  # ID of the job description this candidate is applying for
    email: Optional[EmailStr] = None  # Optional email address of the candidate, validated as proper email format

# Schema for reading/retrieving candidate information
# Extends CandidateCreate to include additional fields returned from the database
class CandidateRead(CandidateCreate):
    id: int  # Unique identifier for the candidate record
    score: int  # Matching score between candidate's resume and job description

    class Config:
        orm_mode = True  # Enables ORM mode for Pydantic model to work with SQLAlchemy models
