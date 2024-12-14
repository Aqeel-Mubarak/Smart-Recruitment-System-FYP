from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from app.database import get_db
from app.models import Candidate, JobDescription
from app.parsers import parse_pdf, parse_doc, extract_email
from app.ai_scoring import calculate_ai_score
from app.utils.qdrant_utils import upload_embeddings_to_qdrant  # Corrected import
from app.schemas import CandidateOut
import logging
from sentence_transformers import SentenceTransformer  # Import the embedding model

router = APIRouter()

logger = logging.getLogger(__name__)

# Initialize the embedding model (for example, paraphrase-MiniLM-L6-v2)
embedding_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

def remove_nul_characters(text: str) -> str:
    """Remove NUL characters from the string to prevent database errors."""
    return text.replace('\x00', '')

@router.post("/upload_resume", response_model=List[CandidateOut])
def upload_resume(files: List[UploadFile] = File(...), job_description_id: int = None, db: Session = Depends(get_db)):
    allowed_content_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    candidates = []
    for file in files:
        if file.content_type not in allowed_content_types:
            logger.warning(f"Unsupported file type: {file.content_type} for file {file.filename}")
            continue
        
        job_description = db.query(JobDescription).filter(JobDescription.id == job_description_id).first()
        if not job_description:
            logger.error(f"Job description not found for ID {job_description_id}")
            continue
        
        try:
            # Parse the resume based on its type
            if file.content_type == "application/pdf":
                resume_text = parse_pdf(file)
            else:
                resume_text = parse_doc(file)
            
            # Clean up any NUL characters from the resume text
            resume_text = remove_nul_characters(resume_text)
            
            # Extract the email and calculate AI score
            email = extract_email(resume_text)
            ai_score = calculate_ai_score(resume_text, job_description.description_text)
            
            # Create a new Candidate object
            candidate = Candidate(
                name=file.filename,
                resume_text=resume_text,
                job_description_id=job_description_id,
                email=email,
                score=ai_score,
            )
            
            # Add the candidate to the database and commit
            db.add(candidate)
            db.commit()
            db.refresh(candidate)

            # Generate embeddings for the resume and upload to Qdrant
            embedding = embedding_model.encode([resume_text], convert_to_numpy=True).flatten()  # Use the initialized embedding model
            upload_embeddings_to_qdrant(embedding, candidate.id)  # Upload the embeddings to Qdrant

            # Append the candidate to the list for response
            candidates.append(candidate)
        except SQLAlchemyError as e:
            db.rollback()
            logger.exception(f"Database error for file {file.filename}: {str(e)}")
            continue
        except Exception as e:
            db.rollback()
            logger.exception(f"Unexpected error for file {file.filename}: {str(e)}")
            continue

    # If no valid candidates were processed, raise an HTTP exception
    if not candidates:
        raise HTTPException(status_code=400, detail="No valid resumes processed. Check the files and try again.")
    
    return candidates
