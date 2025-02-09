from pydantic import BaseModel, EmailStr
from typing import Optional


class JobDescriptionCreate(BaseModel):
    title: str
    description_text: str
    hr_id : int

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



      
class Calendar(BaseModel):
    jobtitle: str
    startdate: str
    starttime: str
    enddate: str
    endtime: str
    status:str
    # email:str
    # hiringmanagerid: int 
    jobid: int
    
    class Config:
        from_attributes = True  # Updated for Pydantic v2
        
     
class Calendar2(BaseModel):
    jobtitle: str
    startdate: str
    starttime: str
    enddate: str
    endtime: str
    status:str
    jobid: int
    candidate_id : int
    class Config:
        from_attributes = True  # Updated for Pydantic v2

class CalendarOut(Calendar):
    id:int

    class Config:
        from_attributes = True