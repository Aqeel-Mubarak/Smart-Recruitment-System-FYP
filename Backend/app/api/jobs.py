from fastapi import Depends,APIRouter, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import JobDescription
from app.api.users import get_current_user
from app.schemas import JobDescriptionCreate, JobDescriptionOut
from app.models import User

router = APIRouter()

# Endpoint to add a job description
@router.post("/add_job_description", response_model=JobDescriptionOut)
def add_job_description(
    db: Session = Depends(get_db),
    title: str = Form(...),
    description: str = Form(...),
    current_user : User = Depends(get_current_user)
):
    new_job = JobDescription(
        title = title,
        description_text = description,
        hr_id = current_user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job