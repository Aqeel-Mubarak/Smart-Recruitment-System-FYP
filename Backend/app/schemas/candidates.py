from pydantic import BaseModel, EmailStr
from typing import Optional


class CandidateCreate(BaseModel):
    name: str
    resume_text: str
    job_description_id: int  # Link candidate to a job description
    email: Optional[EmailStr] = None

class CandidateRead(CandidateCreate):
    id: int
    score: int

    class Config:
        orm_mode = True
