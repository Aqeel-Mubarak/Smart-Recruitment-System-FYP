from fastapi import APIRouter

from . import (
    candidates,
    jobs,
    resume,
    users
)

api_router = APIRouter()

api_router.include_router(candidates.router, tags=["candidates"])
api_router.include_router(jobs.router, tags=["jobs"])
api_router.include_router(resume.router, tags=["resume"])
api_router.include_router(users.router, tags=["users"])

