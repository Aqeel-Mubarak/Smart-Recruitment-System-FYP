from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
from collections import defaultdict
from .. import models, database

router = APIRouter()

# METRICS API
@router.get("/dashboard/metrics")
def get_dashboard_metrics(db: Session = Depends(database.get_db)):
    total_applications = db.query(models.Candidate).count()

    today_str = date.today().isoformat()
    interviews_today = db.query(models.Calendar).filter(
        models.Calendar.isselected == True,
        models.Calendar.starttime.contains(today_str)
    ).count()

    waiting_candidates = db.query(models.Candidate).filter(
        models.Candidate.status == "waiting"
    ).count()

    total_users = db.query(models.User).count()
    total_jobs = db.query(models.JobDescription).count()

    return {
        "total_applications": total_applications,
        "interviews_today": interviews_today,
        "waiting_candidates": waiting_candidates,
        "total_users": total_users,
        "total_jobs": total_jobs
    }

# JOB GRAPH API
@router.get("/dashboard/job-graph")
def job_graph(db: Session = Depends(database.get_db)):
    today = date.today()
    start_of_month = today.replace(day=1)

    jobs = db.query(models.JobDescription).all()

    job_counts_by_date = defaultdict(int)

    for job in jobs:
        try:
            job_date = datetime.strptime(job.deadline, "%Y-%m-%d").date()
            if start_of_month <= job_date <= today:
                job_counts_by_date[job_date] += 1
        except Exception:
            continue  # Skip improperly formatted or null dates

    results = []
    current = start_of_month
    while current <= today:
        results.append({
            "date": current.strftime("%Y-%m-%d"),
            "jobs": job_counts_by_date[current]
        })
        current += timedelta(days=1)

    return results


# HR USERS API
@router.get("/dashboard/hr-users")
def get_hr_users(db: Session = Depends(database.get_db)):
    hr_users = db.query(models.User).filter(models.User.is_superuser == False).all()

    result = []
    for user in hr_users:
        jobs = db.query(models.JobDescription).filter(models.JobDescription.hr_id == user.id).all()
        job_data = []
        for job in jobs:
            candidate_count = db.query(models.Candidate).filter(models.Candidate.job_description_id == job.id).count()
            job_data.append({
                "id": job.id,
                "title": job.title,
                "status": job.status,
                "candidate_count": candidate_count,
                "deadline": job.deadline
            })

        result.append({
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "phone": user.cell_phone,
            "city": user.city,
            "country": user.country,
            "gender": user.gender,
            "company": user.company_name,
            "job_postings": job_data
        })

    return result
