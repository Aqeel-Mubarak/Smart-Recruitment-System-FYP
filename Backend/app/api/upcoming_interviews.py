from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime
from app.database import get_db
from app.models import Calendar, JobDescription, Candidate
from typing import List ,Dict

router = APIRouter()

@router.get("/upcoming_interviews")
def get_upcoming_interviews(db: Session = Depends(get_db)):
    current_datetime = datetime.now()
    current_date_str = current_datetime.strftime('%Y-%m-%d')
    
    # Get all booked interviews
    upcoming_interviews = db.query(Calendar).filter(
        Calendar.isselected == 't'
    ).all()
    
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
            
            # Get job details
            job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
            
            # Get candidate details
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
def get_today_interviews_count(db: Session = Depends(get_db)) -> Dict:
    # Get current date in YYYY-MM-DD format
    current_date = datetime.now().date()
    current_date_str = current_date.strftime('%Y-%m-%d')
    
    # Get all booked interviews
    booked_interviews = db.query(Calendar).filter(
        Calendar.isselected == 't'
    ).all()
    
    # Counter for today's interviews
    today_count = 0
    
    # Process each interview
    for interview in booked_interviews:
        try:
            # The id format is "YYYY-MM-DD-HH:MM-JobID"
            # Extract just the date part (everything before the first two dashes)
            parts = interview.id.split('-')
            if len(parts) >= 3:
                interview_date = f"{parts[0]}-{parts[1]}-{parts[2]}"
                
                # Compare with today's date
                if interview_date == current_date_str:
                    today_count += 1
                    
        except Exception as e:
            print(f"Error processing interview id {interview.id}: {str(e)}")
            continue
    
    return {
        "date": current_date_str,
        "total_interviews": today_count,
        "message": f"Total interviews scheduled for {current_date_str}"
    }