from fastapi import Depends, File, UploadFile, HTTPException, APIRouter
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Candidate, JobDescription
from app.ai_scoring import calculate_ai_score
from app.parsers import parse_pdf, parse_doc, extract_email

from app.schemas import  CandidateOut

router = APIRouter()

@router.post("/upload_resume", response_model=CandidateOut)
def upload_resume(file: UploadFile = File(...), job_description_id: int = None, db: Session = Depends(get_db)):
    allowed_content_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    
    if file.content_type not in allowed_content_types:
        raise HTTPException(status_code=400, detail="Only PDF, DOC, and DOCX files are supported.")
    
    # Get the job description from the database
    job_description = db.query(JobDescription).filter(JobDescription.id == job_description_id).first()
    if not job_description:
        raise HTTPException(status_code=404, detail="Job description not found.")
    


    # Parse the resume based on file type
    if file.content_type == "application/pdf":
        resume_text = parse_pdf(file)
    elif file.content_type in ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        resume_text = parse_doc(file)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")
        
        
    email = extract_email(resume_text)


    # Calculate the AI score
    ai_score = calculate_ai_score(resume_text, job_description.description_text)

    candidate = Candidate(
        name=file.filename, 
        resume_text=resume_text, 
        job_description_id=job_description_id, 
        email= email,
        score=ai_score

    )
    
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate