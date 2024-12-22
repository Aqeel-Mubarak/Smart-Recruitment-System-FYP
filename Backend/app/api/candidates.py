from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Candidate
from app.schemas import CandidateOut
from app.utils.qdrant_utils import qdrant_client, collection_name
from pydantic import BaseModel
from typing import List, Dict
import google.generativeai as genai
import re  

# Initialize models
GOOGLE_API_KEY = "AIzaSyD2OIJxCbpn2N_DwXy7lzl8i6ZS4BPfxrw"
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

router = APIRouter()

class PromptRequest(BaseModel):
    prompt: str


def analyze_with_gemini(resume_text: str, prompt: str) -> Dict:
    try:
        analysis_prompt = f"""
        You are an expert resume analyzer. Analyze the following resume against the job requirements and provide a concise response maximum of 3 lines in the following format:
        - Matching qualities and strengths.
        
        - Gaps or deficiencies (if any).
        
        - A match score (0-100) representing how well the candidate meets the requirements.

        Below are examples of analysis:
        [Example 1 (Excellent Fit, No Deficiencies)

The candidate has more than 8 years of experience in software development, including expertise in Python, Java, and cloud computing. - The candidate has managed large-scale distributed systems. No deficiency found in the resume according to the job requirements. The candidate is an outstanding fit for the role.

Example 2 (Good Fit, With Minor Deficiencies)
The candidate has strong experience in machine learning and data analysis, with proficiency in Python and R. - The candidate lacks hands-on experience with deep learning frameworks like TensorFlow or PyTorch. The candidate appears to be a good fit but may require upskilling in specific frameworks.

Example 3 (Average Fit, Some Qualities, Some Deficiencies)
The candidate has solid knowledge of frontend technologies, including HTML, CSS, and JavaScript. - The candidate lacks experience with modern frameworks like React or Angular, which are critical for this role. The candidate meets some requirements but may not be the best fit for this position.

Example 4 (Not a Fit, Significant Deficiencies)
The candidate has experience with basic scripting and database management. - The candidate lacks experience in data engineering, ETL pipelines, and advanced SQL, which are crucial for this role. The candidate does not meet the requirements and is not a suitable fit.

Example 5 (Good Fit, Balanced Strengths and Minor Weaknesses)
The candidate has extensive experience in backend development, including Java, Spring Boot, and microservices architecture. - The candidate lacks exposure to containerization tools like Docker and Kubernetes. Despite this, the candidate is a strong fit for the role and could upskill in these areas quickly.

Example 6 (Excellent Fit, Meets All Requirements Perfectly)
The candidate has 10 years of experience in cybersecurity, including penetration testing, incident response, and SIEM tools. - The candidate has certifications such as CISSP and CISM. No deficiencies were identified. The candidate is an ideal match for the role.

Example 7 (Good Fit, Unique Strengths, But Some Gaps)
The candidate has expertise in natural language processing and machine learning, with experience in fine-tuning transformer models. - The candidate lacks exposure to deployment frameworks like Docker or cloud services like AWS. However, the candidate is a good fit based on their strong core skills.

Example 8 (Poor Fit, Lacks Key Requirements)
The candidate has a bachelor's degree in information technology and basic knowledge of Python. - The candidate lacks advanced skills in programming, machine learning, and data analysis, which are essential for this role. The candidate does not meet the job requirements and is not a fit.

Example 9 (Exceptional Fit, Exceeds Expectations)
The candidate has over 15 years of experience in system architecture, team leadership, and software development. - The candidate is proficient in all required tools and technologies, including cloud platforms, CI/CD pipelines, and microservices. No deficiencies were found. The candidate exceeds the expectations and is an exceptional match.

Example 10 (Fair Fit, Moderate Strengths, Key Weaknesses)
The candidate has experience with database management and scripting languages like Python and SQL. - The candidate lacks experience in handling real-time data pipelines and distributed systems. The candidate has potential but would require significant upskilling for this role.

Example 11 (Strong Fit, Minor Gaps)
The candidate has excellent knowledge of marketing analytics and campaign management tools like Google Analytics and Tableau. - The candidate has limited experience with predictive modeling. Despite this, the candidate is a great fit for the job.

Example 12 (Not Suitable, Does Not Meet Core Requirements)
The candidate has experience in graphic design and UI/UX but lacks programming knowledge and system design skills. - The candidate does not meet the core requirements of the role. The candidate is not a suitable fit for this position.

Example 13 (Good Fit, With Growth Potential)
The candidate has a strong understanding of backend development with proficiency in Java and Node.js. - The candidate has limited experience with microservices and containerization tools but has demonstrated a willingness to learn. The candidate is a solid fit with growth potential.

Example 14 (Average Fit, Meets Some, Lacks Others)
The candidate has experience with RESTful APIs and cloud platforms like AWS. - The candidate lacks proficiency in Python and advanced data structures, which are critical for the role. The candidate is a fair fit but may not fully meet the requirements.

Example 15 (Ideal Fit, Highly Qualified)
The candidate has significant expertise in DevOps, including Kubernetes, Jenkins, and CI/CD pipelines. - The candidate has additional skills in scripting and automation tools. No deficiencies were noted, and the candidate is a highly qualified fit for the role.]
]

        Job Requirements:
        {prompt}

        Resume Content:
        {resume_text}
        """

        response = model.generate_content(analysis_prompt)

        # Extract analysis details
        analysis_text = response.text.strip()
        match_score = 75  # Default score

        try:
            # Extract score from the response text
            score_match = re.search(r"(\d{1,3})/100", analysis_text)
            if score_match:
                match_score = int(score_match.group(1))
            else:
                # Alternative pattern for standalone numeric score
                score_match = re.search(r"Match Score[:\-]?\s*(\d{1,3})", analysis_text, re.IGNORECASE)
                if score_match:
                    match_score = int(score_match.group(1))

            # Remove headings and score references from the analysis text
            analysis_summary = re.sub(
                r"(?i)(\*\*Fit\*\*:.*?)(\*\*Match Score\*\*:.*?)(\*\*Analysis\*\*:.*?)", 
                "", 
                analysis_text, 
                flags=re.DOTALL
            ).strip()

        except Exception as e:
            print(f"Error extracting match score from response: {e}")
            analysis_summary = analysis_text

        return {
            "score": match_score,
            "analysis": analysis_summary,
        }

    except Exception as e:
        print(f"Gemini analysis error: {e}")
        return {
            "score": 50,  # Default low score for failed analysis
            "analysis": "Analysis failed"
        }
    

    

@router.get("/candidates", response_model=List[CandidateOut])
def get_all_candidates(db: Session = Depends(get_db)):
    return db.query(Candidate).all()

@router.post("/filter_candidates")
async def filter_candidates(request: PromptRequest, db: Session = Depends(get_db)):
    try:
        # Get all candidates from the database
        candidates = db.query(Candidate).all()

        # Process each candidate
        analyzed_candidates = []

        for candidate in candidates:
            try:
                # Get Gemini analysis
                analysis = analyze_with_gemini(candidate.resume_text, request.prompt)

                # Use LLM score and analysis for filtering
                analyzed_candidates.append({
                    "id": candidate.id,
                    "name": candidate.name,
                    "score": analysis["score"],  # LLM-generated score
                    "analysis": analysis["analysis"]
                })

            except Exception as e:
                print(f"Error processing candidate {candidate.id}: {e}")
                continue

        # Sort by LLM-generated score
        analyzed_candidates.sort(key=lambda x: x["score"], reverse=True)

        # Return top 10 candidates
        return analyzed_candidates[:10]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")