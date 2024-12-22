from pydantic import BaseModel, EmailStr
from typing import Optional


class JobDescriptionCreate(BaseModel):
    title: str
    description_text: str

class JobDescriptionOut(JobDescriptionCreate):
    id: int

    class Config:
        from_attributes = True  # Updated for Pydantic v2

class CandidateCreate(BaseModel):
    name: str
    resume_text: str
    job_description_id: int
    email: Optional[EmailStr] = None

class CandidateOut(CandidateCreate):
    id: int
    score: int

    class Config:
        from_attributes = True  # Updated for Pydantic v2
        
        
class Calendar(BaseModel):
    title: str
    startdate: str
    starttime: str
    enddate: str
    endtime: str
    status:str
    
