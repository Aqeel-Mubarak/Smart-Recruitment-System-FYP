from pydantic import BaseModel, EmailStr
from typing import Optional


class JobDescriptionCreate(BaseModel):
    title: str
    description_text: str

class JobDescriptionOut(JobDescriptionCreate):
    id: int

    class Config:
        from_attributes = True 

class CandidateCreate(BaseModel):
    name: str
    resume_text: str
    job_description_id: int
    email: Optional[EmailStr] = None

class CandidateOut(CandidateCreate):
    id: int
    score: int

    class Config:
        from_attributes = True  

class UserCreate(BaseModel):
    email: str
    id: int
    company_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
