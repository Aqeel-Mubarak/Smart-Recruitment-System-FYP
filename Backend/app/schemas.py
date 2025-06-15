# Import required dependencies
from pydantic import BaseModel, EmailStr
from typing import Optional

# Schema for creating a new job description
class JobDescriptionCreate(BaseModel):
    title: str  # Job title/position
    description_text: str  # Detailed job description
    hr_id : int  # ID of the HR who created the job posting

# Schema for returning job description data including its ID
class JobDescriptionOut(JobDescriptionCreate):
    id: int  # Unique identifier for the job description

    class Config:
        from_attributes = True 

# Schema for creating a new candidate application
class CandidateCreate(BaseModel):
    name: str  # Candidate's full name
    resume_text: str  # Text content of the candidate's resume
    job_description_id: int  # ID of the job being applied for
    email: Optional[EmailStr] = None  # Candidate's email address (optional)

# Schema for returning candidate data including application status
class CandidateOut(CandidateCreate):
    id: int  # Unique identifier for the candidate
    score: int  # Matching score for the job
    resume_url: str  # URL to access the candidate's resume

    class Config:
        from_attributes = True  

# Schema for creating a new user (HR/Recruiter)
class UserCreate(BaseModel):
    email: str  # User's email address
    id: int  # User's unique identifier
    company_name: str  # Name of the company the user represents

# Schema for user login credentials
class UserLogin(BaseModel):
    email: EmailStr  # User's email address
    password: str  # User's password

# Schema for JWT authentication token
class Token(BaseModel):
    access_token: str  # JWT access token
    token_type: str  # Type of token (usually "bearer")

# Schema for calendar events (job interviews)
class Calendar(BaseModel):
    jobtitle: str  # Title of the job
    startdate: str  # Interview start date
    starttime: str  # Interview start time
    enddate: str  # Interview end date
    endtime: str  # Interview end time
    status: str  # Current status of the interview
    jobid: int  # ID of the associated job
    
    class Config:
        from_attributes = True  # Updated for Pydantic v2
        
# Extended calendar schema including candidate information
class Calendar2(BaseModel):
    jobtitle: str  # Title of the job
    startdate: str  # Interview start date
    starttime: str  # Interview start time
    enddate: str  # Interview end date
    endtime: str  # Interview end time
    status: str  # Current status of the interview
    jobid: int  # ID of the associated job
    candidate_id: int  # ID of the candidate scheduled for interview
    class Config:
        from_attributes = True  # Updated for Pydantic v2

# Schema for returning calendar event data including its ID
class CalendarOut(Calendar):
    id: int  # Unique identifier for the calendar event

    class Config:
        from_attributes = True
        
# Schema for interview time slots (camelCase version)
class Slot1(BaseModel):
    id: str  # Unique identifier for the slot
    startTime: str  # Slot start time
    endTime: str  # Slot end time
    isSelected: bool  # Whether the slot is selected
    jobId: int  # Associated job ID
    
# Schema for interview time slots (snake_case version with additional fields)
class Slot2(BaseModel):
    id: str  # Unique identifier for the slot
    starttime: str  # Slot start time
    endtime: str  # Slot end time
    isselected: bool  # Whether the slot is selected
    jobid: int  # Associated job ID
    selectedby: int  # ID of the user who selected this slot
