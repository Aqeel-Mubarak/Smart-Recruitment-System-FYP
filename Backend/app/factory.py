from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.api.__init__ import api_router
from app.core.config import settings
from app.utils.faiss_utils import rebuild_faiss_index  # Updated import

def create_app():
    """
    Factory function to create and configure the FastAPI app.
    """
    description = f"{settings.PROJECT_NAME} API"
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_PATH}/openapi.json",
        docs_url="/docs/",
        description=description,
        redoc_url=None,
    )

    # Include API router
    app.include_router(api_router)

    # Setup CORS middleware
    setup_cors_middleware(app)

    # Initialize FAISS index
    rebuild_faiss_index()  # Updated to use rebuild_faiss_index

    return app


def setup_cors_middleware(app):
    """
    Configures CORS middleware for the app.
    """
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # Allow all origins during development
            allow_credentials=True,
            allow_methods=["*"],  # Allow all methods
            allow_headers=["*"],  # Allow all headers
        )
