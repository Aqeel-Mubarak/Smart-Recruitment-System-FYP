# Import FastAPI's APIRouter for creating modular API endpoints
from fastapi import APIRouter

# Import all API route modules that contain endpoint definitions
from . import (
    candidates,
    jobs,
    resume,
    users,
    calendar,
    upcoming_interviews,
    home,
    report,
    video,
    create_interview,
    admin_dashboard,
)

# Create the main API router that will combine all sub-routers
api_router = APIRouter()

# Register all sub-routers with their respective tags for API documentation
# Each router is included with a specific tag for better organization in the API docs
api_router.include_router(calendar.router, tags=["calendar"])
api_router.include_router(candidates.router, tags=["candidates"])
api_router.include_router(jobs.router, tags=["jobs"])
api_router.include_router(resume.router, tags=["resume"])
api_router.include_router(users.router, tags=["users"])
api_router.include_router(upcoming_interviews.router, tags=["upcoming_interviews"])
api_router.include_router(home.router, tags=["home"])
api_router.include_router(report.router, tags=["report"])
api_router.include_router(video.router, tags=["video"])
api_router.include_router(create_interview.router, tags=["create_interview"])
api_router.include_router(admin_dashboard.router, tags=["admin_dashboard"])





