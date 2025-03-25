from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime
from app.database import get_db
from app.models import Calendar, JobDescription, Candidate, User
from app.api.users import get_current_user  # ✅ Import get_current_user
from typing import List, Dict, Optional

router = APIRouter()

@router.get("/top_candidates")
def get_top_candidates(
    job_title_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Get logged-in HR
):
    """
    Get all shortlisted candidates sorted by score for the logged-in HR.
    If job_title_id is provided, only return candidates for that job.
    """
    try:
        # Get all shortlisted candidates for the logged-in HR
        query = db.query(
            Candidate.id,
            Candidate.name,
            Candidate.email,
            Candidate.score,
            Candidate.status,
            JobDescription.title.label('job_title')
        ).join(
            JobDescription, Candidate.job_description_id == JobDescription.id
        ).filter(
            Candidate.status == "shortlisted",  # ✅ Only shortlisted candidates
            JobDescription.hr_id == current_user.id  # ✅ Only logged-in HR's candidates
        )

        if job_title_id is not None:
            query = query.filter(JobDescription.id == job_title_id)

        shortlisted_candidates = query.order_by(desc(Candidate.score)).all()

        # Process candidates and get their interview details
        candidates_data = []
        for candidate in shortlisted_candidates:
            # Find interview details for this candidate
            interview = db.query(Calendar).filter(
                Calendar.selectedby == candidate.email,
                Calendar.isselected == 't' # ✅ Fix: Use Boolean instead of 't'
            ).first()

            interview_summary = "No interview scheduled"
            if interview:
                date_str, time_str, _ = interview.id.rsplit('-', 2)
                interview_summary = f" {date_str} at {time_str}"

            candidates_data.append({
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "score": f"{candidate.score}%" if candidate.score else "N/A",
                "status": candidate.status or "pending",
                "job_title": candidate.job_title,
                "interview_summary": interview_summary
            })

        return candidates_data

    except Exception as e:
        error_msg = f"Error fetching shortlisted candidates: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@router.get("/job_titles")
def get_job_titles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Get logged-in HR
):
    """
    Fetch all unique job titles for the logged-in HR.
    """
    job_data = (
        db.query(JobDescription.id, JobDescription.title)
        .filter(JobDescription.hr_id == current_user.id)  # ✅ Only HR's jobs
        .distinct()
        .all()
    )

    return [{"id": item[0], "title": item[1]} for item in job_data]
