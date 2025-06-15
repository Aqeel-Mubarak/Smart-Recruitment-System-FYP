# Import required FastAPI components for routing and dependency injection
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime
from app.database import get_db
from app.models import Calendar, JobDescription, Candidate, User
from app.api.users import get_current_user  # ✅ Import get_current_user
from typing import List, Dict, Optional

# Create a router instance for report-related endpoints
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
        # Build the base query to fetch candidate information
        # Joins with JobDescription to get job title information
        # Filters for shortlisted candidates and current HR's jobs
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

        # Apply additional filter if specific job title is requested
        if job_title_id is not None:
            query = query.filter(JobDescription.id == job_title_id)

        # Execute query and order results by candidate score in descending order
        shortlisted_candidates = query.order_by(desc(Candidate.score)).all()

        # Process each candidate and enrich with interview information
        candidates_data = []
        for candidate in shortlisted_candidates:
            # Query the Calendar table to find scheduled interviews for this candidate
            interview = db.query(Calendar).filter(
                Calendar.selectedby == candidate.email,
                Calendar.isselected == 't' # ✅ Fix: Use Boolean instead of 't'
            ).first()

            # Format interview information or set default message
            interview_summary = "No interview scheduled"
            if interview:
                # Parse interview ID to extract date and time
                date_str, time_str, _ = interview.id.rsplit('-', 2)
                interview_summary = f" {date_str} at {time_str}"

            # Create a dictionary with all candidate information
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
        # Handle any errors during the process
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
    # Query to get distinct job titles for the current HR
    # Returns only job ID and title pairs
    job_data = (
        db.query(JobDescription.id, JobDescription.title)
        .filter(JobDescription.hr_id == current_user.id)  # ✅ Only HR's jobs
        .distinct()
        .all()
    )

    # Transform the query results into a list of dictionaries
    return [{"id": item[0], "title": item[1]} for item in job_data]
