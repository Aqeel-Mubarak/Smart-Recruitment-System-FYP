from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Candidate
from app.schemas import CandidateOut
from sqlalchemy import and_
from pydantic import BaseModel
from typing import List, Dict
import os
from dotenv import load_dotenv
import re
from groq import Groq
from app.api.users import get_current_user

# Load environment variables
load_dotenv()

router = APIRouter()

class PromptRequest(BaseModel):
    prompt: str
    job_description_id: int

class GroqAnalyzer:
    """Handler for Groq LLM-based resume analysis."""
    
    def __init__(self):
        """Initialize the Groq client."""
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in .env file")
        
        self.client = Groq(api_key=self.api_key)
        print("Groq client initialized successfully")  # Debug confirmation
    
    def analyze_resume(self, resume_text: str, prompt: str) -> Dict:
        """
        Analyze a resume using the Groq LLM.
        
        Args:
            resume_text (str): The resume content to analyze
            prompt (str): The job requirements/prompt
            
        Returns:
            Dict: Analysis results including score and detailed analysis
        """
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are an expert resume analyzer. Analyze resumes against job requirements and provide concise responses with matching qualities, gaps, and a numerical score."
                },
                {
                    "role": "user",
                    "content": f"""Analyze the following resume against the job requirements and provide a concise 
                    response in exactly this format:
                    **Fit**: [Brief description of match]
                    **Match Score**: [0-100]
                    **Analysis**: 
                    - Matching qualities and strengths
                    - Gaps or deficiencies (if any)

                    Job Requirements:
                    {prompt}

                    Resume Content:
                    {resume_text}"""
                }
            ]

            print("Sending request to Groq...")  # Debug log
            response = self.client.chat.completions.create(
                messages=messages,
                model="llama-3.3-70b-versatile",
                temperature=0.7,
            )
            print("Received response from Groq")  # Debug log

            analysis_text = response.choices[0].message.content.strip()
            
            # Extract score from the response
            try:
                score_match = re.search(r"Match Score.*?(\d{1,3})", analysis_text, re.IGNORECASE)
                match_score = int(score_match.group(1)) if score_match else 75
                
                # Clean up the analysis text
                analysis_summary = re.sub(
                    r"(?i)(\*\*Fit\*\*:.*?)(\*\*Match Score\*\*:.*?)(\*\*Analysis\*\*:)", 
                    "", 
                    analysis_text
                ).strip()
                
            except Exception as e:
                print(f"Error extracting match score: {e}")
                match_score = 75
                analysis_summary = analysis_text

            return {
                "score": match_score,
                "analysis": analysis_summary,
            }

        except Exception as e:
            print(f"Groq analysis error: {e}")
            return {
                "score": 50,
                "analysis": f"Analysis failed: {str(e)}"
            }

# Initialize the analyzer
try:
    groq_analyzer = GroqAnalyzer()
except Exception as e:
    print(f"Error initializing Groq analyzer: {e}")
    raise

@router.get("/candidates", response_model=List[CandidateOut])
def get_all_candidates(job_description_id:int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    candidates = (
        db.query(Candidate)
        .join(Candidate.job_description)
        .filter(and_(Candidate.job_description.has(hr_id=current_user.id),
                    Candidate.job_description_id==job_description_id))
        .all()
    )
    return candidates


# @router.get("/candidates", response_model=List[CandidateOut])
# def get_all_candidates(job_description_id:int,db: Session = Depends(get_db)):
#     """
#     Fetch all candidates from the database.
#     """
#     return db.query(Candidate).filter(Candidate.job_description_id==job_description_id).all()



@router.post("/filter_candidates")
async def filter_candidates(request: PromptRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Filter and analyze candidates using Groq LLM.
    
    Args:
        request (PromptRequest): The job requirements/prompt
        db (Session): Database session
        
    Returns:
        List[Dict]: Sorted list of analyzed candidates
    """
    print(request)
    try:
        print("Starting candidate filtering process...")  # Debug log
        job_description_id = request.job_description_id
        candidates = (
        db.query(Candidate)
        .join(Candidate.job_description)
        .filter(Candidate.job_description.has(hr_id=current_user.id),
                Candidate.job_description_id==job_description_id)
        .all()
        )
        analyzed_candidates = []

        for candidate in candidates:
            try:
                print(f"Analyzing candidate {candidate.id}...")  # Debug log
                analysis = groq_analyzer.analyze_resume(
                    candidate.resume_text, 
                    request.prompt
                )

                analyzed_candidates.append({
                    "id": candidate.id,
                    "name": candidate.name,
                    "score": analysis["score"],
                    "analysis": analysis["analysis"]
                })
                print(f"Successfully analyzed candidate {candidate.id}")  # Debug log

            except Exception as e:
                print(f"Error processing candidate {candidate.id}: {e}")
                continue

        # Sort by score (descending) and return top 10
        analyzed_candidates.sort(key=lambda x: x["score"], reverse=True)
        print(f"Returning {len(analyzed_candidates[:10])} candidates")  # Debug log
        return analyzed_candidates[:10]

    except Exception as e:
        error_msg = f"Error processing request: {str(e)}"
        print(error_msg)  # Debug log
        raise HTTPException(status_code=500, detail=error_msg)


#