# resume.py
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
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
import boto3
import mimetypes


AWS_ACCESS_KEY = "AKIA5G4FULXWL2XCEOWF"
AWS_SECRET_KEY = "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"
BUCKET_NAME = "candidatesresume"
REGION_NAME = f"us-east-1"

s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=REGION_NAME
)
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
                score=ai_score
            )
            
            # Save to database
            db.add(candidate)
            db.commit()
            db.refresh(candidate)

            s3_filename = f"{candidate.id}+{file.filename}"
            candidate.resume_url = f"{s3_filename}"
            db.add(candidate)
            db.commit()
            db.refresh(candidate)
            if file:
                file.file.seek(0)  # Reset stream before uploading to S3
                mime_type, _ = mimetypes.guess_type(file.filename)
                if not mime_type:
                    ext = file.filename.split('.')[-1].lower()
                    if ext == "pdf":
                        mime_type = "application/pdf"
                    elif ext == "doc":
                        mime_type = "application/msword"
                    elif ext == "docx":
                        mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    else:
                        mime_type = "application/octet-stream" 

                s3_client.upload_fileobj(
                    file.file, 
                    BUCKET_NAME,
                    s3_filename,
                    ExtraArgs={'ContentType': mime_type}
                )

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

@router.get("/signed-url")
def get_signed_Url(
    id:int ,
    session = Depends(get_db),
):
    candidate = session.query(Candidate).filter(Candidate.id==id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="candidate not found")
    
    url = candidate.resume_url
    if not url:
        raise HTTPException(status_code=400, detail="Invalid Information")
    signed_url = sign_url(url)
    if not signed_url:
        raise HTTPException(status_code=400, detail="Error generating Signed URL")
    
    ext = url.split('.')[-1].lower()
    if ext == "pdf":
        return {"url":signed_url, "type": "pdf"}
    elif ext == "doc" or ext == "docx":
        return {"url": signed_url, "type":"doc/docx"}

def sign_url(file_name: str):
    try:
        mime_type, _ = mimetypes.guess_type(file_name)
        if not mime_type:
            ext = file_name.split('.')[-1].lower()
            if ext == "pdf":
                mime_type = "application/pdf"
            elif ext == "doc":
                mime_type = "application/msword"
            elif ext == "docx":
                mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            else:
                mime_type = "application/octet-stream"
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": BUCKET_NAME, 
                    "Key": file_name, 
                    "ResponseContentDisposition": "inline", 
                    "ResponseContentType": mime_type
                    },
            ExpiresIn=3600  # 1-hour validity
            )
        return url
    except Exception as e:
        return {"error": str(e)}