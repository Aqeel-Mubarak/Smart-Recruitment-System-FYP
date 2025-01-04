from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Candidate
from app.schemas import CandidateOut
from pydantic import BaseModel
from typing import List, Dict
import os
from dotenv import load_dotenv
from groq import Groq
from sentence_transformers import SentenceTransformer
from app.utils.qdrant_utils import get_embedding
import numpy as np

# Load environment variables
load_dotenv()

router = APIRouter()

class PromptRequest(BaseModel):
    prompt: str
    job_description_id: int


class AnalysisRequest(BaseModel):
    candidate_id: int
    resume_text: str
    prompt: str


class GroqAnalyzer:
    """Handler for Groq LLM-based resume analysis."""
    
    def __init__(self):
        """Initialize the Groq client."""
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in .env file")
        
        self.client = Groq(api_key=self.api_key)
        print("Groq client initialized successfully")
    
    def analyze_resume(self, resume_text: str, prompt: str) -> Dict:
        """
        Analyze a resume using the Groq LLM.
        
        Args:
            resume_text (str): The resume content to analyze
            prompt (str): The job requirements/prompt
            
        Returns:
            Dict: Analysis results including detailed analysis
        """
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are an expert resume analyzer. Analyze resumes against job requirements and provide concise responses with matching qualities and gaps."
                },
                {
                    "role": "user",
                    "content": f"""Analyze the following resume against the job requirements and provide a concise response:
                    
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

            return {
                "analysis": analysis_text,
            }

        except Exception as e:
            print(f"Groq analysis error: {e}")
            return {
                "analysis": f"Analysis failed: {str(e)}"
            }

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
    Filter and analyze candidates for a specific job using prompt score and sort by it.
    """
    try:
        # Fetch candidates for the specified job description ID
        candidates = db.query(Candidate).filter(Candidate.job_description_id == request.job_description_id).all()
        if not candidates:
            raise HTTPException(status_code=404, detail="No candidates found for the selected job description")

        analyzed_candidates = []

        # Generate embedding for the prompt
        prompt_embedding = embedding_model.encode(request.prompt)

        for candidate in candidates:
            try:
                # Retrieve candidate embedding
                candidate_embedding = get_embedding(candidate.id)

                if candidate_embedding is not None:
                    # Calculate prompt score
                    prompt_score = calculate_prompt_score(prompt_embedding, candidate_embedding)

                    analyzed_candidates.append({
                        "id": candidate.id,
                        "name": candidate.name,
                        "score": candidate.score,  # Existing job score
                        "prompt_score": prompt_score,  # Newly calculated prompt score
                        "resume_text": candidate.resume_text  # Include resume text for analysis
                    })

            except Exception as e:
                print(f"Error processing candidate {candidate.id}: {e}")
                continue

        # Sort by prompt score (descending)
        analyzed_candidates.sort(key=lambda x: x["prompt_score"], reverse=True)
        return analyzed_candidates

    except Exception as e:
        error_msg = f"Error processing request: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


@router.get("/candidates", response_model=List[CandidateOut])
def get_all_candidates(
    job_description_id: int = None,  # Add job_description_id as a query parameter
    db: Session = Depends(get_db)
):
    """
    Get all candidates filtered by job_description_id and sorted by job score.
    """
    try:
        if job_description_id is not None:
            # Filter by job description ID and sort by job score
            candidates = db.query(Candidate).filter(
                Candidate.job_description_id == job_description_id
            ).order_by(Candidate.score.desc()).all()
        else:
            # If no job_description_id is provided, return all candidates sorted by score
            candidates = db.query(Candidate).order_by(Candidate.score.desc()).all()

        return candidates
    except Exception as e:
        error_msg = f"Error fetching candidates: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


@router.post("/analyze_candidate")
async def analyze_candidate(request: AnalysisRequest):
    """
    Analyze a single candidate's resume using the LLM.
    """
    try:
        candidate_id = request.candidate_id
        resume_text = request.resume_text
        prompt = request.prompt

        if not resume_text or not prompt:
            raise HTTPException(status_code=400, detail="Resume text or prompt missing")

        # Use GroqAnalyzer for analysis
        analysis = groq_analyzer.analyze_resume(resume_text, prompt)
        return {"candidate_id": candidate_id, "analysis": analysis["analysis"]}
    except Exception as e:
        error_msg = f"Error analyzing candidate: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
