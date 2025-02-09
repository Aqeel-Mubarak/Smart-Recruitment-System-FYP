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

@router.get("/get_job_by_id/{job_id}")
def get_job_by_id(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return jsonable_encoder(job)
@router.put("/update_job_description/{job_id}")
def update_job_description(
    job_id: int,
    title: str = Form(...),
    description: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(JobDescription).filter(
        JobDescription.id == job_id,
        JobDescription.hr_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.title = title
    job.description_text = description
    db.commit()
    db.refresh(job)
    return job