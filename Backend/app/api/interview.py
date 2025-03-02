from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Request, Body
import base64
import io
from PIL import Image
import numpy as np
import cv2
from groq import Groq
import os
import logging
import json
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize the router
router = APIRouter()

# Define request models
class QuestionRequest(BaseModel):
    job_title: str

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")  # Use environment variables for security
groq_client = None
if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        logging.error(f"Failed to initialize Groq client: {e}")

# Configure logging
logging.basicConfig(level=logging.INFO)

# Create a directory for storing question files if it doesn't exist
QUESTIONS_DIR = "questions"
os.makedirs(QUESTIONS_DIR, exist_ok=True)

@router.websocket("/ws/video")
async def video_stream(websocket: WebSocket):
    await websocket.accept()
    logging.info("WebSocket connection established.")

    while True:
        try:
            data = await websocket.receive_text()
            logging.info("Received frame from frontend.")

            # Decode the base64 data received from the frontend
            try:
                if data.startswith("data:image"):
                    data = data.split(",")[1]  # Remove the prefix
                frame_data = base64.b64decode(data)
                logging.debug(f"Decoded base64 data, length: {len(frame_data)} bytes")
            except Exception as e:
                logging.error(f"Error decoding base64 data: {e}")
                await websocket.send_text(json.dumps({"gazeStatus": "Error decoding frame"}))
                continue

            if not frame_data:
                logging.warning("Empty frame data received.")
                await websocket.send_text(json.dumps({"gazeStatus": "Empty frame data"}))
                continue

            # Convert byte data into an image
            try:
                image = Image.open(io.BytesIO(frame_data))
                frame = np.array(image)
                logging.debug("Successfully converted bytes to image.")
            except Exception as e:
                logging.error(f"Error converting bytes to image: {e}")
                await websocket.send_text(json.dumps({"gazeStatus": "Error processing frame"}))
                continue

            # Process the frame for gaze detection
            gaze_status = process_frame_for_gaze(frame)

            # Send back gaze detection status to frontend
            logging.info(f"Sending gaze status: {gaze_status}")
            await websocket.send_text(json.dumps({"gazeStatus": gaze_status}))

        except WebSocketDisconnect:
            logging.info("Client disconnected")
            break
        except Exception as e:
            logging.error(f"Unexpected error in WebSocket: {e}")
            try:
                await websocket.send_text(json.dumps({"gazeStatus": "Server error"}))
            except:
                break

def process_frame_for_gaze(frame):
    """
    This function processes the video frame to detect if the user is looking at the camera.
    """
    try:
        # Check if the frame is in RGB format (from PIL) and convert to BGR for OpenCV
        if frame.shape[2] == 3:  # RGB
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    except Exception as e:
        logging.error(f"Error converting to grayscale: {e}")
        return "Error processing frame"

    try:
        # Check if haar cascade file exists
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        if not os.path.exists(cascade_path):
            logging.error(f"Cascade file not found: {cascade_path}")
            return "Face detection configuration error"
            
        face_cascade = cv2.CascadeClassifier(cascade_path)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

        logging.info(f"Faces detected: {len(faces)}")

        if len(faces) > 0:
            return "Looking at Camera"
        else:
            return "Looking Away"
    except Exception as e:
        logging.error(f"Error in face detection: {e}")
        return "Error detecting face"

@router.post("/api/generate-questions")
async def generate_questions(request: QuestionRequest):
    """
    This endpoint generates interview questions based on the provided job title
    and saves them in a text file.
    """
    job_title = request.job_title
    
    # Validate input
    if not job_title or not job_title.strip():
        raise HTTPException(status_code=400, detail="Job title is required")
    
    try:
        logging.info(f"Generating questions for job title: {job_title}")
        
        # Check if Groq client is available
        if not groq_client:
            # Use fallback questions if Groq is not available
            return generate_fallback_questions(job_title)
        
        # Use the Groq API to generate interview questions
        try:
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{
                    "role": "system",
                    "content": "You are an AI assistant specializing in generating interview questions for various job titles."
                }, {
                    "role": "user",
                    "content": f"Generate 5 interview questions for the job position of {job_title}."
                }],
                temperature=0.5,
                max_tokens=500
            )

            # Extract the questions from the response
            response_content = completion.choices[0].message.content.strip()
            
            # Clean up the response - remove numbering if present
            questions = []
            for line in response_content.split("\n"):
                line = line.strip()
                if line:
                    # Remove numbering patterns like "1. " or "1) "
                    if line[0].isdigit() and len(line) > 2 and (line[1:].startswith('. ') or line[1:].startswith(') ')):
                        line = line[line.find(' ')+1:].strip()
                    questions.append(line)
            
            # Filter empty lines and ensure we have questions
            questions = [q for q in questions if q]
            
            if not questions:
                return generate_fallback_questions(job_title)
                
            # Save questions to a text file
            # Sanitize job title for filename
            sanitized_title = "".join(c if c.isalnum() else "_" for c in job_title.lower())
            questions_file_path = os.path.join(QUESTIONS_DIR, f"questions_{sanitized_title}.txt")
            with open(questions_file_path, 'w') as file:
                for question in questions:
                    file.write(f"{question}\n")
            
            return {"questions": questions}
            
        except Exception as e:
            logging.error(f"Error calling Groq API: {str(e)}")
            return generate_fallback_questions(job_title)
            
    except Exception as e:
        logging.error(f"Error generating questions for {job_title}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

def generate_fallback_questions(job_title):
    """Generate generic questions when the API fails"""
    logging.info(f"Using fallback questions for {job_title}")
    
    fallback_questions = [
        f"Tell me about your background and experience relevant to the {job_title} role.",
        f"What specific skills do you possess that make you a good candidate for this {job_title} position?",
        "Describe a challenging situation you faced at work and how you resolved it.",
        f"Why are you interested in this {job_title} position?",
        "What are your career goals for the next 3-5 years?"
    ]
    
    # Save fallback questions to a file
    sanitized_title = "".join(c if c.isalnum() else "_" for c in job_title.lower())
    questions_file_path = os.path.join(QUESTIONS_DIR, f"questions_{sanitized_title}.txt")
    with open(questions_file_path, 'w') as file:
        for question in fallback_questions:
            file.write(f"{question}\n")
    
    return {"questions": fallback_questions}

@router.get("/api/get-questions/{job_title}")
async def get_questions(job_title: str):
    """
    This endpoint fetches the interview questions stored in a text file.
    """
    try:
        # Sanitize job title for filename
        sanitized_title = "".join(c if c.isalnum() else "_" for c in job_title.lower())
        questions_file_path = os.path.join(QUESTIONS_DIR, f"questions_{sanitized_title}.txt")
        
        if not os.path.exists(questions_file_path):
            # If questions don't exist, generate them
            logging.info(f"Questions not found for {job_title}, generating new ones")
            question_request = QuestionRequest(job_title=job_title)
            return await generate_questions(question_request)
        
        with open(questions_file_path, 'r') as file:
            questions = [line.strip() for line in file.readlines() if line.strip()]
        
        if not questions:
            # If file exists but is empty or contains only whitespace
            question_request = QuestionRequest(job_title=job_title)
            return await generate_questions(question_request)
            
        return {"questions": questions}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching questions for {job_title}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching questions: {str(e)}")