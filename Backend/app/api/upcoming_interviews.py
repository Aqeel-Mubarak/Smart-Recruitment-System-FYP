# Import required FastAPI components for routing and dependency injection
from fastapi import APIRouter, Depends, HTTPException
# Import SQLAlchemy components for database operations
from sqlalchemy.orm import Session
# Import datetime for handling date and time operations
from datetime import datetime
# Import database session management
from app.database import get_db
# Import database models
from app.models import Calendar, JobDescription, Candidate, User
# Import user authentication dependency
from app.api.users import get_current_user  # ✅ Import get_current_user
# Import type hints for better code documentation
from typing import List, Dict

# Create a router instance for handling interview-related endpoints
router = APIRouter()

@router.get("/upcoming_interviews")
def get_upcoming_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Get logged-in HR
):
    """
    Fetch upcoming interviews for the logged-in HR.
    Returns a list of scheduled interviews with job and candidate details.
    """
    # Get current timestamp for filtering past interviews
    current_datetime = datetime.now()
    
    # Query the database for all selected interviews related to the HR's job postings
    upcoming_interviews = (
        db.query(Calendar)
        .join(JobDescription)  # Join with JobDescription to filter by HR's jobs
        .filter(
            Calendar.isselected == 't',  # ✅ Fix: Use Boolean filter - only get confirmed interviews
            JobDescription.hr_id == current_user.id  # ✅ Only fetch HR's interviews
        )
        .all()
    )

    # Initialize list to store processed interview data
    interviews_data = []
    for interview in upcoming_interviews:
        try:
            # Parse the interview ID which follows format: "YYYY-MM-DD-HH:MM-JobID"
            date_str, time_str, job_id_str = interview.id.rsplit('-', 2)
            
            # Convert string date and time to datetime object for comparison
            interview_datetime = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")

            # Skip interviews that have already passed
            if interview_datetime <= current_datetime:
                continue

            # Convert job ID string to integer
            job_id = int(job_id_str)
            
            # Fetch related job and candidate information
            job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
            candidate = db.query(Candidate).filter(Candidate.email == interview.selectedby).first()

            # Create a dictionary with all relevant interview information
            interview_data = {
                "interview_id": interview.id,
                "job_title": job.title if job else "Unknown Job",
                "candidate_name": candidate.name if candidate else "Unknown Candidate",
                "email": interview.selectedby,
                "date": date_str,
                "time": time_str,
                "datetime": interview_datetime.isoformat(),
                "job_id": job_id
            }
            
            interviews_data.append(interview_data)

        except Exception as e:
            # Log any errors that occur while processing an interview
            print(f"Error processing interview id {interview.id}: {str(e)}")
            continue

    # Sort interviews by datetime for chronological order
    interviews_data.sort(key=lambda x: x["datetime"])

    return interviews_data


@router.get("/today_interviews_count")
def get_today_interviews_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Get logged-in HR
) -> Dict:
    """
    Get the count of today's interviews for the logged-in HR.
    Returns a dictionary containing the date and total number of interviews scheduled for today.
    """
    # Get current date for filtering today's interviews
    current_date = datetime.now().date()
    
    # Count interviews scheduled for today that belong to the HR's job postings
    today_count = (
        db.query(Calendar)
        .join(JobDescription)
        .filter(
            Calendar.isselected == True,  # ✅ Fix: Use Boolean filter - only count confirmed interviews
            JobDescription.hr_id == current_user.id,  # ✅ Only fetch HR's interviews
            Calendar.id.like(f"{current_date}-%")  # ✅ Efficient date filtering - match today's date pattern
        )
        .count()
    )

    # Return formatted response with interview count
    return {
        "date": current_date.strftime('%Y-%m-%d'),
        "total_interviews": today_count,
        "message": f"Total interviews scheduled for {current_date}"
    }
