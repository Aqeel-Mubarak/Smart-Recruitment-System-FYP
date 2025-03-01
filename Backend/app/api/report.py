from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime
from app.database import get_db
from app.models import Calendar, JobDescription, Candidate
from typing import List ,Dict , Optional
from sqlalchemy import desc
from app.models import Candidate, Calendar, JobDescription


router = APIRouter()



@router.get("/top_candidates")
async def get_top_candidates(job_title_id: int = None, db: Session = Depends(get_db)):
    """
    Get all shortlisted candidates sorted by score, including their interview details if available.
    If job_title_id is provided, only return candidates with matching job_title_id.
    """
    try:
        # Get all shortlisted candidates with the highest scores, without limiting the number
        query = db.query(
            Candidate.id,
            Candidate.name,
            Candidate.email,
            Candidate.score,
            Candidate.status,
            JobDescription.title.label('job_title')
        ).join(
            JobDescription,
            Candidate.job_description_id == JobDescription.id
        ).filter(
            Candidate.status == "shortlisted"  # Only shortlist candidates
        )

        if job_title_id is not None:
            query = query.filter(
                JobDescription.id == job_title_id
            )

        shortlisted_candidates = query.order_by(
            desc(Candidate.score)  # Order by score, highest first
        ).all()  # Removed the limit to fetch all shortlisted candidates

        # Process candidates and get their interview details
        candidates_data = []
        for candidate in shortlisted_candidates:
            # Find interview details for this candidate
            interview = db.query(Calendar).filter(
                Calendar.selectedby == candidate.email,
                Calendar.isselected == 't'  # Check if interview is selected
            ).first()

            interview_summary = "No interview scheduled"
            if interview:
                # Parse interview datetime from id (format: YYYY-MM-DD-HH:MM-JobID)
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
def get_job_titles(db: Session = Depends(get_db)):
    """
    Endpoint to fetch all unique job titles with their IDs.
    """
    job_data = db.query(JobDescription.id, JobDescription.title).distinct().all()
    return [{"id": item[0], "title": item[1]} for item in job_data]