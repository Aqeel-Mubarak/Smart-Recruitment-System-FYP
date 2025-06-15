# Import the application factory function from the app package
from app.factory import create_app
# Import uvicorn ASGI server for running the FastAPI application
import uvicorn


# Create the FastAPI application instance using the factory function
app = create_app()

# Entry point of the application when run directly
if __name__ == "__main__":
    # Run the FastAPI application using uvicorn server
    # - host="0.0.0.0" allows external connections
    # - reload=True enables auto-reload during development
    # - port=8000 sets the server port
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        reload=True,
        port=8000,
    )