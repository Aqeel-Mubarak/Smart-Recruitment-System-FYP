from fastapi import FastAPI, Depends, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from .models import Candidate, JobDescription
from .parsers import parse_pdf, parse_doc
from .ai_scoring import calculate_ai_score
from .parsers import parse_pdf, parse_doc, extract_email

from .schemas import CandidateCreate, CandidateOut, JobDescriptionCreate, JobDescriptionOut

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS Middleware to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:5174"],  # Your frontend URL (adjust if necessary)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (POST, GET, etc.)
    allow_headers=["*"],  # Allow all headers
)



# Endpoint to add a job description
@app.post("/add_job_description", response_model=JobDescriptionOut)
def add_job_description(job: JobDescriptionCreate, db: Session = Depends(get_db)):
    new_job = JobDescription(**job.dict())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@app.post("/upload_resume", response_model=CandidateOut)
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

# Route to fetch all candidates with extracted text
@app.get("/candidates", response_model=list[CandidateOut])
def get_all_candidates(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).all()
    return candidates
