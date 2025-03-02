from fastapi import APIRouter
from . import (
    candidates,
    jobs,
    resume,
    users,
    calendar,
    upcoming_interviews,
    video,  # Include the video module here
    interview
)

api_router = APIRouter()

api_router.include_router(calendar.router, tags=["calendar"])
api_router.include_router(candidates.router, tags=["candidates"])
api_router.include_router(jobs.router, tags=["jobs"])
api_router.include_router(resume.router, tags=["resume"])
api_router.include_router(users.router, tags=["users"])
api_router.include_router(upcoming_interviews.router, tags=["upcoming_interviews"])
api_router.include_router(video.router, tags=["video"])  # Add video-related API routes
api_router.include_router(interview.router, tags=["interview"])  # Add video-related API routes

