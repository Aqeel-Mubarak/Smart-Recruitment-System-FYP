from fastapi import Depends,APIRouter, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import JobDescription
from app.api.users import get_current_user
from app.schemas import JobDescriptionCreate, JobDescriptionOut
from app.models import User
from datetime import date
from fastapi.encoders import jsonable_encoder
import datetime


router = APIRouter()

# Endpoint to add a job description
@router.post("/create/add_job_description", response_model=JobDescriptionOut)
def add_job_description(
    db: Session = Depends(get_db),
    title: str = Form(...),
    description: str = Form(...),
    deadline: date = Form(...),
    current_user : User = Depends(get_current_user)
):
    print("nhekekjfkj")
    new_job = JobDescription(
        title = title,
        description_text = description,
        deadline = deadline,
        hr_id = current_user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.post("/resume/add_job_description", response_model=JobDescriptionOut)
def add_job_description(
    db: Session = Depends(get_db),
    title: str = Form(...),
    description: str = Form(...),
    current_user : User = Depends(get_current_user)
):
    new_job = JobDescription(
        title = title,
        description_text = description,
        deadline = date.today(),
        hr_id = current_user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job



# # Endpoint to add a job description
# @router.post("/add_job_description", response_model=JobDescriptionOut)
# def add_job_description(job: JobDescriptionCreate, db: Session = Depends(get_db)):
#     print(JobDescriptionCreate)
#     new_job = JobDescription(**job.dict())
#     db.add(new_job)
#     db.commit()
#     db.refresh(new_job)
#     return new_job

@router.get("/get_job_description")
def get_job_description(hiringmanagerid:int,db: Session = Depends(get_db)):
    present_jobs=db.query(JobDescription).filter(JobDescription.hr_id==hiringmanagerid).all()
    serialized_jobs = jsonable_encoder(present_jobs)
    return {'jobs':serialized_jobs}


@router.get("/get_job_titles")
def get_job_description(hiringmanagerid:int,db: Session = Depends(get_db)):
    present_jobs=db.query(JobDescription).filter(JobDescription.hr_id==hiringmanagerid).all()
    serialized_jobs = [job.title for job in present_jobs]

    # Return the serialized data
    return {"job_titles": serialized_jobs}
