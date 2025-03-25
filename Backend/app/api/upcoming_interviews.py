from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Calendar, JobDescription, Candidate, User
from app.api.users import get_current_user  # ✅ Import get_current_user
from typing import List, Dict

router = APIRouter()

@router.get("/upcoming_interviews")
def get_upcoming_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Get logged-in HR
):
    """
    Fetch upcoming interviews for the logged-in HR.
    """
    current_datetime = datetime.now()
    
    # Get booked interviews related to the HR
    upcoming_interviews = (
        db.query(Calendar)
        .join(JobDescription)
        .filter(
            Calendar.isselected == 't',  # ✅ Fix: Use Boolean filter
            JobDescription.hr_id == current_user.id  # ✅ Only fetch HR's interviews
        )
        .all()
    )

    interviews_data = []
    for interview in upcoming_interviews:
        try:
            # The id format is "YYYY-MM-DD-HH:MM-JobID"
            date_str, time_str, job_id_str = interview.id.rsplit('-', 2)
            
            # Convert to datetime for comparison
            interview_datetime = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")

            # Skip past interviews
            if interview_datetime <= current_datetime:
                continue

            job_id = int(job_id_str)
            
            # Get job and candidate details
            job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
            candidate = db.query(Candidate).filter(Candidate.email == interview.selectedby).first()

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
            print(f"Error processing interview id {interview.id}: {str(e)}")
            continue

    # Sort by datetime
    interviews_data.sort(key=lambda x: x["datetime"])

    return interviews_data


@router.get("/today_interviews_count")
def get_today_interviews_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Get logged-in HR
) -> Dict:
    """
    Get the count of today's interviews for the logged-in HR.
    """
    current_date = datetime.now().date()
    
    # Count only today's interviews related to the HR
    today_count = (
        db.query(Calendar)
        .join(JobDescription)
        .filter(
            Calendar.isselected == True,  # ✅ Fix: Use Boolean filter
            JobDescription.hr_id == current_user.id,  # ✅ Only fetch HR's interviews
            Calendar.id.like(f"{current_date}-%")  # ✅ Efficient date filtering
        )
        .count()
    )

    return {
        "date": current_date.strftime('%Y-%m-%d'),
        "total_interviews": today_count,
        "message": f"Total interviews scheduled for {current_date}"
    }
