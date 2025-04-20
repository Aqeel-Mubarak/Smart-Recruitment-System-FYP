from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Candidate, JobDescription  # Import JobDescription model
from app.schemas import CandidateOut
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
from groq import Groq
from sentence_transformers import SentenceTransformer
from app.utils.qdrant_utils import get_embedding
import numpy as np

# Load environment variables
load_dotenv()

router = APIRouter()

# Request to filter candidates by prompt
class PromptRequest(BaseModel):
    prompt: str
    job_description_id: int

# Updated AnalysisRequest now includes job_description_id for job analysis
class AnalysisRequest(BaseModel):
    candidate_id: int
    resume_text: str
    prompt: str
    analysis_type: str   # Expected values: "prompt" or "job"
    job_description_id: Optional[int] = None  # Used only if analysis_type == "job"

class GroqAnalyzer:
    """Handler for Groq LLM-based resume analysis."""
    
    def __init__(self):
        """Initialize the Groq client."""
        self.api_key = "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"
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in .env file")
        self.client = Groq(api_key=self.api_key)
        print("Groq client initialized successfully")
    
    def analyze_resume(self, resume_text: str, prompt: str) -> Dict:
        """
        Analyze a resume using the Groq LLM.
        
        Args:
            resume_text (str): The resume content to analyze.
            prompt (str): The job requirements/prompt.
        
        Returns:
            Dict: Analysis results including a succinct analysis in exactly two lines,
                  with each heading on its own separate line in bold.
        """
        try:
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are an expert resume analyzer. Your task is to analyze the resume provided "
                        "against the job requirements. Your output must have exactly four lines, each starting with "
                        "a bold heading using Markdown. Follow these rules exactly:\n\n"
                        "1. **Qualities:** List the candidate's abilities and qualities and matching skills relevant to the job requirements. "
                        "If no qualities are found, simply state 'No qualities.'\n\n"
                        "2. **Lacking:** List what the candidate is lacking relative to the job requirements.See carefully if there is any requirement missing in the candidates resume "
                        "If nothing is lacking, simply state 'Nothing is lacking.'\n\n"
                        "Keep each line very succinct (approximately 15–20 words) and do not combine headings on the same line."
                    )
                },
                {
                    "role": "user",
                    "content": f"""Analyze the following resume against the job requirements and output your analysis in exactly two succinct lines.

Job Requirements:
{prompt}

Resume Content:
{resume_text}"""
                }
            ]
            response = self.client.chat.completions.create(
                messages=messages,
                model="llama-3.3-70b-versatile",
                temperature=0.7,
            )
            analysis_text = response.choices[0].message.content.strip()
            return {"analysis": analysis_text}
        except Exception as e:
            print(f"Groq analysis error: {e}")
            return {"analysis": f"Analysis failed: {str(e)}"}

# Initialize the analyzer
try:
    groq_analyzer = GroqAnalyzer()
except Exception as e:
    print(f"Error initializing Groq analyzer: {e}")
    raise

# Initialize Nomic embedding model
embedding_model = SentenceTransformer("nomic-ai/nomic-embed-text-v1", trust_remote_code=True)

def calculate_prompt_score(prompt_embedding: np.ndarray, candidate_embedding: np.ndarray) -> float:
    """Calculate the prompt score by comparing prompt embedding with candidate embedding."""
    try:
        score = np.dot(prompt_embedding, candidate_embedding) / (
            np.linalg.norm(prompt_embedding) * np.linalg.norm(candidate_embedding)
        )
        return score * 100  # Scale to percentage
    except Exception as e:
        print(f"Error calculating prompt score: {e}")
        return 0.0

@router.post("/filter_candidates")
async def filter_candidates(request: PromptRequest, db: Session = Depends(get_db)):
    """
    Filter and analyze candidates for a specific job using prompt score and assign rankings.
    """
    try:
        candidates = db.query(Candidate).filter(Candidate.job_description_id == request.job_description_id).all()
        if not candidates:
            raise HTTPException(status_code=404, detail="No candidates found for the selected job description")
        analyzed_candidates = []
        # Generate embedding for the prompt
        prompt_embedding = embedding_model.encode(request.prompt)
        for candidate in candidates:
            try:
                candidate_embedding = get_embedding(candidate.id)
                if candidate_embedding is not None:
                    prompt_score = calculate_prompt_score(prompt_embedding, candidate_embedding)
                    analyzed_candidates.append({
                        "id": candidate.id,
                        "name": candidate.name,
                        "score": candidate.score,
                        "prompt_score": prompt_score,
                        "resume_text": candidate.resume_text
                    })
            except Exception as e:
                print(f"Error processing candidate {candidate.id}: {e}")
                continue
        analyzed_candidates.sort(key=lambda x: x["prompt_score"], reverse=True)
        ranked_candidates = []
        for index, candidate in enumerate(analyzed_candidates, start=1):
            ranked_candidates.append({
                **candidate,
                "rank": index,
                "prompt_score": round(candidate["prompt_score"], 2)
            })
        return ranked_candidates
    except Exception as e:
        error_msg = f"Error processing request: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@router.get("/candidates", response_model=List[CandidateOut])
def get_all_candidates(job_description_id: int = None, db: Session = Depends(get_db)):
    """
    Get all candidates filtered by job_description_id and sorted by job score.
    """
    try:
        if job_description_id is not None:
            candidates = db.query(Candidate).filter(
                Candidate.job_description_id == job_description_id
            ).order_by(Candidate.score.desc()).all()
        else:
            candidates = db.query(Candidate).order_by(Candidate.score.desc()).all()
        return candidates
    except Exception as e:
        error_msg = f"Error fetching candidates: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@router.post("/analyze_candidate")
async def analyze_candidate(request: AnalysisRequest, db: Session = Depends(get_db)):
    """
    Analyze a single candidate's resume using the LLM.
    The analysis_type parameter determines whether the analysis is prompt-based or job-based.
    For job-based analysis, the 'job_description_id' field is used to fetch the full job description.
    """
    try:
        candidate_id = request.candidate_id
        resume_text = request.resume_text
        analysis_type = request.analysis_type.lower()
        if analysis_type == "job":
            if not request.job_description_id:
                raise HTTPException(status_code=400, detail="Job description id is required for job analysis")
            # Fetch the full job description from the database
            job = db.query(JobDescription).filter(JobDescription.id == request.job_description_id).first()
            if not job:
                raise HTTPException(status_code=404, detail="Job description not found")
            constructed_prompt = f"Analyze the resume with respect to the job: {job.description_text}"
        else:
            if not request.prompt:
                raise HTTPException(status_code=400, detail="Prompt is required for prompt analysis")
            constructed_prompt = request.prompt
        analysis = groq_analyzer.analyze_resume(resume_text, constructed_prompt)
        return {"candidate_id": candidate_id, "analysis": analysis["analysis"]}
    except Exception as e:
        error_msg = f"Error analyzing candidate: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
class ShortlistRequest(BaseModel):
    candidate_ids: List[int]
    job_description_id: int

# Add this new endpoint in candidates.py
@router.post("/update_candidates_status")
async def shortlist_candidates(request: ShortlistRequest, db: Session = Depends(get_db)):
    """
    Update the status of selected candidates to 'shortlisted' for a specific job.
    
    Args:
        request: ShortlistRequest containing candidate_ids and job_description_id
        db: Database session
    
    Returns:
        Dict with success message and number of candidates updated
    """
    try:
        # Update status for all specified candidates
        updated_count = db.query(Candidate).filter(
            Candidate.id.in_(request.candidate_ids),
            Candidate.job_description_id == request.job_description_id
        ).update(
            {"status": "shortlisted"},
            synchronize_session=False
        )
        
        db.commit()
        
        return {
            "message": "Successfully updated candidates status to shortlisted",
            "updated_count": updated_count
        }
    except Exception as e:
        db.rollback()
        error_msg = f"Error updating candidate status: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
class CandidateStatusCount(BaseModel):
    waiting: int
    shortlisted: int
    total: int


