from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Candidate, JobDescription ,User
from app.schemas import CandidateOut
from typing import List
from app.api.users import get_current_user  # ✅ Import get_current_user

router = APIRouter()

@router.get("/waiting_candidates", response_model=List[CandidateOut])
def get_waiting_candidates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Get logged-in HR
):
    """
    Get all candidates with 'waiting' status for the logged-in HR user.
    """
    try:
        waiting_candidates = (
            db.query(Candidate)
            .join(JobDescription)
            .filter(
                JobDescription.hr_id == current_user.id,  # ✅ Use logged-in user's ID
                Candidate.status == "waiting"
            )
            .all()
        )

        if not waiting_candidates:
            return []

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
