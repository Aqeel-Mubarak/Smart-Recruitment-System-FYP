from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class JobDescriptionCreate(BaseModel):
    title: str
    description_text: str

class JobDescriptionOut(JobDescriptionCreate):
    id: int

    class Config:
        orm_mode = True

class CandidateCreate(BaseModel):
    name: str
    resume_text: str
    job_description_id: int  # Link candidate to a job description
    email: Optional[EmailStr] = None

class CandidateOut(CandidateCreate):
    id: int
    score: int

    class Config:
        orm_mode = True
