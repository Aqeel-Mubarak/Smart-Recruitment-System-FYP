# resume.py - API endpoints for handling resume uploads and processing
# This module provides functionality for uploading, parsing, and scoring resumes against job descriptions

# Import required FastAPI components and utilities
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from app.database import get_db
from app.models import Candidate, JobDescription
from app.parsers import parse_pdf, parse_doc, extract_email, ocr_pdf  # <-- added ocr_pdf import
from app.ai_scoring import generate_embeddings, calculate_ai_score
from app.utils.qdrant_utils import store_embeddings, get_embedding
from app.schemas import CandidateOut
import logging
import boto3
import mimetypes
from dotenv import load_dotenv

import os 

# Load environment variables from .env file
load_dotenv()

# AWS S3 configuration for storing resume files
AWS_ACCESS_KEY = "AKIA5G4FULXWL2XCEOWF"
AWS_SECRET_KEY = "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"
BUCKET_NAME = "candidatesresume"
REGION_NAME = "us-east-1"

# Initialize S3 client for file operations
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=REGION_NAME
)
router = APIRouter()
logger = logging.getLogger(__name__)

# Utility function to remove null characters from text
def remove_nul_characters(text: str) -> str:
    return text.replace('\x00', '')

# Endpoint for bulk resume upload and processing
@router.post("/upload_resume", response_model=List[CandidateOut])
def upload_resume(
    files: List[UploadFile] = File(...),
    job_description_id: int = None,
    db: Session = Depends(get_db)
):
    # Define allowed file types for resume uploads
    allowed_content_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    
    candidates = []
    
    # Fetch job description and generate embeddings for comparison
    job_description = db.query(JobDescription).filter(JobDescription.id == job_description_id).first()
    if not job_description:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    # Generate embeddings for job description text
    job_desc_embedding = generate_embeddings(job_description.description_text)
    
    # Process each uploaded resume file
    for file in files:
        if file.content_type not in allowed_content_types:
            logger.warning(f"Unsupported file type: {file.content_type} for file {file.filename}")
            continue
        
        try:
            # Parse resume content based on file type
            resume_text = parse_pdf(file) if file.content_type == "application/pdf" else parse_doc(file)
            resume_text = remove_nul_characters(resume_text)
            
            # Extract email from resume text
            email = extract_email(resume_text)
            
            # If email not found in PDF, attempt OCR extraction
            if not email and file.content_type == "application/pdf":
                file.file.seek(0)  # Reset stream for OCR
                try:
                    ocr_text = ocr_pdf(file)
                    ocr_email = extract_email(ocr_text)
                    if ocr_email:
                        email = ocr_email
                        logger.info(f"OCR extracted email: {email} from file {file.filename}")
                    else:
                        logger.warning(f"OCR did not extract any email from file {file.filename}")
                except Exception as ocr_error:
                    logger.exception(f"OCR extraction failed for file {file.filename}: {ocr_error}")
            
            # Generate embeddings for resume text
            resume_embedding = generate_embeddings(resume_text)
            
            # Calculate AI score by comparing resume and job description embeddings
            ai_score = calculate_ai_score(resume_embedding, job_desc_embedding)
            
            # Create new candidate record in database
            candidate = Candidate(
                name=file.filename,
                resume_text=resume_text,
                job_description_id=job_description_id,
                email=email,
                score=ai_score
            )
            
            # Save candidate to database
            db.add(candidate)
            db.commit()
            db.refresh(candidate)

            # Generate S3 filename and update candidate record
            s3_filename = f"{candidate.id}+{file.filename}"
            candidate.resume_url = f"{s3_filename}"
            db.add(candidate)
            db.commit()
            db.refresh(candidate)
            
            # Upload file to S3 bucket
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

            # Store resume embeddings in Qdrant with metadata
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

# Endpoint to generate signed URL for resume download
@router.get("/signed-url")
def get_signed_Url(
    id: int,
    session = Depends(get_db),
):
    # Fetch candidate record
    candidate = session.query(Candidate).filter(Candidate.id == id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="candidate not found")
    
    url = candidate.resume_url
    if not url:
        raise HTTPException(status_code=400, detail="Invalid Information")
    signed_url = sign_url(url)
    if not signed_url:
        raise HTTPException(status_code=400, detail="Error generating Signed URL")
    
    # Determine file type for response
    ext = url.split('.')[-1].lower()
    if ext == "pdf":
        return {"url": signed_url, "type": "pdf"}
    elif ext in ["doc", "docx"]:
        return {"url": signed_url, "type": "doc/docx"}

# Helper function to generate signed URL for S3 object
def sign_url(file_name: str):
    try:
        # Determine mime type for the file
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
        # Generate presigned URL with 1-hour expiration
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": BUCKET_NAME, 
                "Key": file_name, 
                "ResponseContentDisposition": "inline", 
                "ResponseContentType": mime_type
            },
            ExpiresIn=3600  # 1-hour validity
        )
        return url
    except Exception as e:
        return {"error": str(e)}

# Endpoint for single resume upload during application process
@router.post("/application/upload_resume", response_model=CandidateOut)
def application_upload_resume(
    file: UploadFile = File(...),
    job_description_id= Form(...),
    db: Session = Depends(get_db)
):
    # Define allowed file types
    allowed_content_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
        
    # Fetch job description and generate embeddings
    job_description = db.query(JobDescription).filter(JobDescription.id == job_description_id).first()
    if not job_description:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    # Generate job description embeddings
    job_desc_embedding = generate_embeddings(job_description.description_text)
    
    if file.content_type not in allowed_content_types:
        logger.warning(f"Unsupported file type: {file.content_type} for file {file.filename}")
    
    try:
        # Parse resume content
        resume_text = parse_pdf(file) if file.content_type == "application/pdf" else parse_doc(file)
        resume_text = remove_nul_characters(resume_text)
        
        # Generate embeddings and calculate score
        resume_embedding = generate_embeddings(resume_text)
        ai_score = calculate_ai_score(resume_embedding, job_desc_embedding)
        
        # Extract email and create candidate record
        email = extract_email(resume_text)
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

        # Generate S3 filename and update candidate
        s3_filename = f"{candidate.id}+{file.filename}"
        candidate.resume_url = f"{s3_filename}"
        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        # Upload file to S3
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

        # Store embeddings in Qdrant
        metadata = {
            "filename": file.filename,
            "email": email,
            "score": ai_score
        }
        store_embeddings(resume_embedding, candidate.id, metadata)
        return candidate
            
    except SQLAlchemyError as e:
        db.rollback()
        logger.exception(f"Database error for file {file.filename}: {str(e)}")
    except Exception as e:
        db.rollback()
        logger.exception(f"Unexpected error for file {file.filename}: {str(e)}")
    
    if not candidate:
        raise HTTPException(status_code=400, detail="No valid resumes processed")
    
    return candidate

