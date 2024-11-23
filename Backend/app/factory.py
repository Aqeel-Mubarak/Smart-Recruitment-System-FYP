from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.api.__init__ import api_router
from app.core.config import settings



def create_app():
    description = f"{settings.PROJECT_NAME} API"
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_PATH}/openapi.json",
        docs_url="/docs/",
        description=description,
        redoc_url=None,
    )

    app.include_router(api_router)
    setup_cors_middleware(app)
    return app


def setup_cors_middleware(app):
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:5173","http://localhost:5174"],  # Your frontend URL (adjust if necessary)
            allow_credentials=True,
            allow_methods=["*"],  # Allow all methods (POST, GET, etc.)
            allow_headers=["*"],  # Allow all headers
        )


