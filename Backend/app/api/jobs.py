# Import required dependencies
from fastapi import Depends,APIRouter, Form, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import JobDescription
from app.api.users import get_current_user
from app.schemas import  JobDescriptionOut
from app.models import User
from datetime import date
from fastapi.encoders import jsonable_encoder

# Initialize FastAPI router for job-related endpoints
router = APIRouter()

# Endpoint to create a new job description with deadline
# Requires authentication and form data including title, description, and deadline
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

# Endpoint to create a job description for resume parsing
# Sets deadline to current date automatically
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

# Endpoint to get all job descriptions for a specific hiring manager
@router.get("/get_job_description")
def get_job_description(hiringmanagerid:int,db: Session = Depends(get_db)):
    present_jobs=db.query(JobDescription).filter(JobDescription.hr_id==hiringmanagerid).all()
    serialized_jobs = jsonable_encoder(present_jobs)
    return {'jobs':serialized_jobs}

# Endpoint to get only job titles for a specific hiring manager
@router.get("/get_job_titles")
def get_job_description(hiringmanagerid:int,db: Session = Depends(get_db)):
    present_jobs=db.query(JobDescription).filter(JobDescription.hr_id==hiringmanagerid).all()
    serialized_jobs = [job.title for job in present_jobs]

    # Return the serialized data
    return {"job_titles": serialized_jobs}

# Endpoint to get a specific job by its ID
# Returns 404 if job not found
@router.get("/get_job_by_id/{job_id}")
def get_job_by_id(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return jsonable_encoder(job)

# Endpoint to update an existing job description
# Requires authentication and form data
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

# Endpoint to get all open jobs for the current HR user
@router.get("/jobs/open")
def get_open_jobs_by_HR(
    Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    jobs = Session.query(JobDescription).filter(
        JobDescription.hr_id == current_user.id,
        JobDescription.status == 'open'
    ).all()
    return {"jobs" : jsonable_encoder(jobs)}

# Endpoint to get all closed jobs for the current HR user
@router.get("/jobs/closed")
def get_close_jobs_by_HR(
    Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    jobs = Session.query(JobDescription).filter(
        JobDescription.hr_id == current_user.id,
        JobDescription.status == 'closed'
    ).all()
    return {"jobs":jsonable_encoder(jobs)}

# Endpoint to get all jobs (both open and closed) for the current HR user
@router.get("/jobs/all")
def get_all_jobs_by_HR(
    Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    jobs = Session.query(JobDescription).filter(
        JobDescription.hr_id == current_user.id
    ).all()
    return {"jobs":jsonable_encoder(jobs)}

# Endpoint to close a specific job
# Requires job ID and authentication
@router.post("/jobs/close-job")
def close_job(
    session = Depends(get_db),
    current_user = Depends(get_current_user),
    job_id = Form(...)
):
    job = session.query(JobDescription).filter(
        JobDescription.id == job_id,
        JobDescription.hr_id == current_user.id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.status = 'closed'
    session.commit()
    session.refresh(job)
    return {"job": jsonable_encoder(job)}

# Endpoint to edit an existing job
# Allows updating title, description, status, and deadline
@router.put("/jobs/edit-job")
def update_job(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    id = Form(...),
    title = Form(...),
    description_text = Form(...),
    status = Form(...),
    deadline = Form(...)
):
    
    job = db.query(JobDescription).filter(
        JobDescription.id == id,
        JobDescription.hr_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.title = title
    job.description_text = description_text
    job.status = status
    job.deadline = deadline
    db.commit()
    db.refresh(job)
    return job