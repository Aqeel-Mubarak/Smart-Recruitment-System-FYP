# resume.py
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from app.database import get_db
from app.models import Candidate, JobDescription
from app.parsers import parse_pdf, parse_doc, extract_email
from app.ai_scoring import generate_embeddings, calculate_ai_score
from app.utils.qdrant_utils import store_embeddings, get_embedding
from app.schemas import CandidateOut
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def remove_nul_characters(text: str) -> str:
    return text.replace('\x00', '')

@router.post("/upload_resume", response_model=List[CandidateOut])
def upload_resume(
    files: List[UploadFile] = File(...),
    job_description_id: int = None,
    db: Session = Depends(get_db)
):
    allowed_content_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    
    candidates = []
    
    # Get job description and generate embeddings once
    job_description = db.query(JobDescription).filter(JobDescription.id == job_description_id).first()
    if not job_description:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    # Generate job description embeddings
    job_desc_embedding = generate_embeddings(job_description.description_text)
    
    for file in files:
        if file.content_type not in allowed_content_types:
            logger.warning(f"Unsupported file type: {file.content_type} for file {file.filename}")
            continue
        
        try:
            # Parse resume
            resume_text = parse_pdf(file) if file.content_type == "application/pdf" else parse_doc(file)
            resume_text = remove_nul_characters(resume_text)
            
            # Generate embeddings once
            resume_embedding = generate_embeddings(resume_text)
            
            # Calculate score using embeddings
            ai_score = calculate_ai_score(resume_embedding, job_desc_embedding)
            
            # Extract email
            email = extract_email(resume_text)
            
            # Create candidate record
            candidate = Candidate(
                name=file.filename,
                resume_text=resume_text,
                job_description_id=job_description_id,
                email=email,
                score=ai_score,
            )
            
            # Save to database
            db.add(candidate)
            db.commit()
            db.refresh(candidate)
            
            # Store embeddings in Qdrant with metadata
            metadata = {
                "filename": file.filename,
                "email": email,
                "score": ai_score
            }
            store_embeddings(resume_embedding, candidate.id, metadata)
            
            candidates.append(candidate)
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.exception(f"Database error for file {file.filename}: {str(e)}")
            continue
        except Exception as e:
            db.rollback()
            logger.exception(f"Unexpected error for file {file.filename}: {str(e)}")
            continue
    
    if not candidates:
        raise HTTPException(status_code=400, detail="No valid resumes processed")
    
    return candidates