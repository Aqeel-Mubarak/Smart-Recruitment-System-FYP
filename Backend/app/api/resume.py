from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Candidate, JobDescription
from app.parsers import parse_pdf, parse_doc, extract_email
from app.ai_scoring import calculate_ai_score
from app.utils.faiss_utils import index, faiss_index_to_candidate_id, embedding_model, faiss_lock
from app.schemas import CandidateOut

router = APIRouter()


@router.post("/upload_resume", response_model=CandidateOut)
def upload_resume(file: UploadFile = File(...), job_description_id: int = None, db: Session = Depends(get_db)):
    """
    Uploads a resume, parses its content, calculates an AI score,
    extracts email, and updates the FAISS index with its embedding.
    """
    allowed_content_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    # Validate file type
    if file.content_type not in allowed_content_types:
        raise HTTPException(status_code=400, detail="Only PDF, DOC, and DOCX files are supported.")

    # Fetch the job description
    job_description = db.query(JobDescription).filter(JobDescription.id == job_description_id).first()
    if not job_description:
        raise HTTPException(status_code=404, detail="Job description not found.")

    # Parse the resume
    try:
        if file.content_type == "application/pdf":
            resume_text = parse_pdf(file)
        else:
            resume_text = parse_doc(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

    # Extract email from the resume text
    email = extract_email(resume_text)

    # Calculate AI score based on job description
    ai_score = calculate_ai_score(resume_text, job_description.description_text)

    # Save the candidate data in the database
    candidate = Candidate(
        name=file.filename,
        resume_text=resume_text,
        job_description_id=job_description_id,
        email=email,
        score=ai_score,
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    # Generate and add the embedding to the FAISS index
    try:
        embedding = embedding_model.encode([resume_text], convert_to_numpy=True)
        with faiss_lock:
            index.add(embedding)
            faiss_index_to_candidate_id[index.ntotal - 1] = candidate.id
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating embedding: {str(e)}")

    return candidate
