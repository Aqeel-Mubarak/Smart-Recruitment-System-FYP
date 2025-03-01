from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Candidate # Import JobDescription model
from app.schemas import CandidateOut
from typing import List
from dotenv import load_dotenv



# Load environment variables
load_dotenv()

router = APIRouter()
@router.get("/waiting_candidates", response_model=List[CandidateOut])
async def get_waiting_candidates(db: Session = Depends(get_db)):
    """
    Get all candidates who are in the 'waiting' status.
    """
    try:
        waiting_candidates = db.query(Candidate).filter(Candidate.status == "waiting").all()
        if not waiting_candidates:
            raise HTTPException(status_code=404, detail="No candidates found with 'waiting' status.")
        return waiting_candidates
    except Exception as e:
        error_msg = f"Error fetching waiting candidates: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@router.get("/candidate_status_counts")
async def get_candidate_status_counts(db: Session = Depends(get_db)):
    """
    Get the count of candidates grouped by their status.
    """
    try:
        status_counts = db.query(Candidate.status, func.count(Candidate.id)).group_by(Candidate.status).all()
        status_counts_dict = {status: count for status, count in status_counts}
        return status_counts_dict
    except Exception as e:
        error_msg = f"Error fetching candidate status counts: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
