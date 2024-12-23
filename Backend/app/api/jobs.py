from fastapi import Depends,APIRouter
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import JobDescription

from app.schemas import JobDescriptionCreate, JobDescriptionOut


router = APIRouter()

# Endpoint to add a job description
@router.post("/add_job_description", response_model=JobDescriptionOut)
def add_job_description(job: JobDescriptionCreate, db: Session = Depends(get_db)):
    new_job = JobDescription(**job.dict())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job