# Import necessary modules for user management and database operations
from app.models import User
import cv2
import logging
import base64
import io
import os
import json
import uuid
from app.database import Base, get_db
import time
from datetime import datetime
from typing import List, Optional
# Import user authentication function
from app.api.users import get_current_user
# Import database models
from app.models import Candidate, JobDescription, User
# Import FastAPI and related modules
from fastapi import FastAPI, Request, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File, Form, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.database import Base, get_db
# Import SQLAlchemy modules for database operations
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, create_engine, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, Session

# Import AI/ML related modules
from PIL import Image
import numpy as np
from groq import Groq
import speech_recognition as sr

# Configure logging with basic settings
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI()

# Create API router for organizing endpoints
router = APIRouter()

# Configure CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client for AI-powered question generation
GROQ_API_KEY = "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"
groq_client = None
if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        logging.error(f"Failed to initialize Groq client: {e}")

# Generate timestamps and create directory for storing interview answers
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
ANSWERS_DIR = f"answers_{timestamp}"
os.makedirs(ANSWERS_DIR, exist_ok=True)

# Database Models
# Model for storing interview information
class DBInterview(Base):
    __tablename__ = "interviews"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_title = Column(String, nullable=False)
    experience = Column(String)
    created_at = Column(DateTime, default=func.now())
    
    # Define relationships with other tables
    questions = relationship("DBQuestion", back_populates="interview", cascade="all, delete-orphan")
    skills = relationship("DBSkill", back_populates="interview", cascade="all, delete-orphan")

# Model for storing interview questions
class DBQuestion(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    interview_id = Column(String, ForeignKey("interviews.id"))
    
    # Define relationship with interview
    interview = relationship("DBInterview", back_populates="questions")

# Model for storing required skills
class DBSkill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    interview_id = Column(String, ForeignKey("interviews.id"))
    
    # Define relationship with interview
    interview = relationship("DBInterview", back_populates="skills")

# Model for storing interview summaries
class DBInterviewSummary(Base):
    __tablename__ = "interview_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(String, ForeignKey("interviews.id"))
    email = Column(String, nullable=False)
    summary = Column(String)
    completed_at = Column(DateTime, default=func.now())
    hr_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Define relationships with other tables
    interview = relationship("DBInterview", backref="summaries")
    hr = relationship(User, backref="interview_summaries")

# Pydantic models for request validation
class QuestionRequest(BaseModel):
    job_title: str
    skills: Optional[List[str]] = []
    experience: Optional[str] = None

class AnswerAnalysisRequest(BaseModel):
    question: str
    answer: str
    job_title: str

class InterviewAnalysisRequest(BaseModel):
    questions: List[str]
    answers: List[str]
    job_title: str

class InterviewSummaryRequest(BaseModel):
    email: str
    interview_id: str
    questions: List[str]
    answers: List[str]
    job_title: str

# API Endpoints
@router.get("/api/interview/{interview_id}")
async def get_interview(interview_id: str, db: Session = Depends(get_db)):
    """
    Get all details of a specific interview by ID
    """
    try:
        db_interview = db.query(DBInterview).filter(DBInterview.id == interview_id).first()
        
        if not db_interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Get all questions and skills
        questions = [question.text for question in db_interview.questions]
        skills = [skill.name for skill in db_interview.skills]
        
        return {
            "id": db_interview.id,
            "job_title": db_interview.job_title,
            "experience": db_interview.experience,
            "skills": skills,
            "questions": questions,
            "created_at": db_interview.created_at
        }
    except Exception as e:
        logging.error(f"Error retrieving interview {interview_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving interview: {str(e)}")

@router.post("/api/generate-questions")
async def generate_questions(request: QuestionRequest, db: Session = Depends(get_db)):
    """
    Generate interview questions based on job title, skills, and experience
    """
    if not request.job_title:
        raise HTTPException(status_code=400, detail="Job title is required")
    
    try:
        logging.info(f"Generating questions for: {request.job_title}")
        
        # Generate unique interview ID
        interview_id = str(uuid.uuid4())
        
        # Create interview record
        db_interview = DBInterview(
            id=interview_id,
            job_title=request.job_title,
            experience=request.experience
        )
        
        # Add skills to the interview
        for skill in request.skills:
            if skill.strip():
                db_skill = DBSkill(name=skill.strip(), interview=db_interview)
                db.add(db_skill)
        
        # Check if Groq client is available
        if not groq_client:
            # Use fallback questions if Groq is not available
            return generate_fallback_questions(request.job_title, db_interview, db)
        
        # Use the Groq API to generate tailored interview questions
        try:
            # Create a prompt that incorporates the job title, skills, and experience
            skills_text = ", ".join(request.skills) if request.skills else "not specified"
            experience_text = request.experience if request.experience else "not specified"
            
            prompt = f"""
            Generate 5 interview questions for a {request.job_title} position.
            Skills required: {skills_text}
            Experience level: {experience_text}
            
            The questions should assess both technical knowledge and soft skills relevant to this role.
            Output ONLY the questions without any numbering, introduction, or commentary.
            """
            
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{
                    "role": "system",
                    "content": "You are an AI assistant specializing in generating job interview questions."
                }, {
                    "role": "user",
                    "content": prompt
                }],
                temperature=0.5,
                max_tokens=500
            )

            # Extract the questions from the response
            response_content = completion.choices[0].message.content.strip()
            
            # Parse and clean questions
            lines = response_content.split("\n")
            cleaned_questions = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Remove numbering if present (like "1. " or "1) ")
                if line[0].isdigit() and len(line) > 2 and (line[1:].startswith('. ') or line[1:].startswith(') ')):
                    line = line[line.find(' ')+1:].strip()
                
                # Skip very short lines or headers
                if len(line.split()) < 3:
                    continue
                
                # Skip lines that seem to be instructions or notes
                if any(phrase in line.lower() for phrase in ["here are", "following questions", "interview questions"]):
                    continue
                
                cleaned_questions.append(line)
            
            # Limit to 5 questions
            cleaned_questions = cleaned_questions[:5]
            
            # If we didn't get enough valid questions, use fallback
            if len(cleaned_questions) < 3:
                return generate_fallback_questions(request.job_title, db_interview, db)
            
            # Add questions to database
            for question_text in cleaned_questions:
                db_question = DBQuestion(text=question_text, interview=db_interview)
                db.add(db_question)
            
            db.add(db_interview)
            db.commit()
            
            return {
                "id": interview_id,
                "job_title": request.job_title,
                "questions": cleaned_questions,
                "success": True
            }
            
        except Exception as e:
            logging.error(f"Error calling Groq API: {str(e)}")
            return generate_fallback_questions(request.job_title, db_interview, db)
            
    except Exception as e:
        logging.error(f"Error generating questions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

def generate_fallback_questions(job_title, db_interview, db):
    """Generate generic questions when the API fails"""
    logging.info(f"Using fallback questions for {job_title}")
    
    fallback_questions = [
        f"Tell me about your background and experience relevant to the {job_title} role.",
        f"What specific skills do you possess that make you a good candidate for this {job_title} position?",
        "Describe a challenging situation you faced at work and how you resolved it.",
        f"Why are you interested in this {job_title} position?",
        "What are your career goals for the next 3-5 years?"
    ]
    
    # Add fallback questions to database
    for question_text in fallback_questions:
        db_question = DBQuestion(text=question_text, interview=db_interview)
        db.add(db_question)
    
    db.add(db_interview)
    db.commit()
    
    return {
        "id": db_interview.id,
        "job_title": job_title,
        "questions": fallback_questions,
        "success": True,
        "note": "Using fallback questions due to API limitations."
    }

@router.post("/api/analyze-answer")
async def analyze_answer(request: AnswerAnalysisRequest):
    """
    Analyze a single answer to provide feedback
    """
    question = request.question
    answer = request.answer
    job_title = request.job_title
    
    if not all([question, answer, job_title]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    try:
        if not groq_client:
            return {"feedback": "Answer analysis not available - Groq API not configured"}
        
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "system",
                "content": "You are an AI assistant specializing in interview coaching."
            }, {
                "role": "user",
                "content": f"For a {job_title} position, analyze this answer to the question: '{question}'\n\nAnswer: {answer}\n\nProvide brief, constructive feedback focused on both strengths and areas for improvement."
            }],
            temperature=0.4,
            max_tokens=300
        )
        
        feedback = completion.choices[0].message.content.strip()
        return {"feedback": feedback}
    except Exception as e:
        logging.error(f"Error analyzing answer: {str(e)}")
        return {"feedback": f"Unable to analyze answer: {str(e)}"}

@router.post("/api/analyze-interview")
async def analyze_interview(request: InterviewAnalysisRequest):
    """
    Analyze the entire interview session and provide overall feedback
    """
    questions = request.questions
    answers = request.answers
    job_title = request.job_title
    
    if not all([questions, job_title]) or len(questions) == 0:
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    if len(questions) != len(answers):
        raise HTTPException(status_code=400, detail="Questions and answers count mismatch")
    
    try:
        if not groq_client:
            return {"analysis": "Interview analysis not available - Groq API not configured"}
        
        # Format the questions and answers for the LLM
        qa_pairs = []
        for i, (question, answer) in enumerate(zip(questions, answers)):
            if not answer or answer == "Not answered":
                qa_pairs.append(f"Q{i+1}: {question}\nA: [No answer provided]")
            else:
                qa_pairs.append(f"Q{i+1}: {question}\nA: {answer}")
        
        interview_text = "\n\n".join(qa_pairs)
        
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "system",
                "content": "You are an AI assistant specializing in interview coaching and evaluation."
            }, {
                "role": "user",
                "content": f"""
                Please analyze this interview for a {job_title} position and provide detailed feedback.
                Consider:
                - Overall impression
                - Communication skills
                - Content quality
                - Specific strengths
                - Areas for improvement
                - Recommendations for future interviews
                
                Interview transcript:
                {interview_text}
                """
            }],
            temperature=0.4,
            max_tokens=800
        )
        
        analysis = completion.choices[0].message.content.strip()
        return {"analysis": analysis}
    except Exception as e:
        logging.error(f"Error analyzing interview: {str(e)}")
        return {"analysis": f"Error analyzing interview: {str(e)}"}

@router.post("/api/transcribe-audio")
async def transcribe_audio(
    file: UploadFile = File(...),
    job_title: str = Form(...),
    question_id: int = Form(...)
):
    """
    Transcribe audio recording of an answer
    """
    if not file:
        raise HTTPException(status_code=400, detail="No audio file provided")
    
    if not job_title:
        raise HTTPException(status_code=400, detail="Job title is required")
    
    if question_id is None:
        raise HTTPException(status_code=400, detail="Question ID is required")
    
    # Create unique filenames for audio processing
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    sanitized_title = "".join(c if c.isalnum() else "_" for c in job_title.lower())
    temp_audio_path = f"temp_audio_{timestamp}.webm"
    converted_audio_path = f"converted_audio_{timestamp}.wav"
    
    try:
        # Read the audio file
        audio_data = await file.read()
        logging.info(f"Received audio file size: {len(audio_data)} bytes")
        
        # Save the uploaded file temporarily
        with open(temp_audio_path, "wb") as temp_file:
            temp_file.write(audio_data)
        
        # Convert the audio to WAV format for better compatibility with speech_recognition
        try:
            import subprocess
            # Use ffmpeg with improved parameters to preserve audio quality
            subprocess.run([
                'ffmpeg', '-i', temp_audio_path, 
                '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le',
                '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',  # Normalize audio levels
                converted_audio_path
            ], check=True, stderr=subprocess.PIPE)
            logging.info(f"Successfully converted audio to WAV format: {converted_audio_path}")
        except Exception as e:
            logging.error(f"Error converting audio format: {e}")
            # If conversion fails, we'll try to use the original file
        
        # Save the permanent audio file
        audio_filename = f"audio_{sanitized_title}_q{question_id}_{timestamp}.wav"
        audio_path = os.path.join(ANSWERS_DIR, audio_filename)
        
        # Copy the file to permanent storage
        source_path = converted_audio_path if os.path.exists(converted_audio_path) else temp_audio_path
        with open(source_path, "rb") as source_file:
            with open(audio_path, "wb") as audio_file:
                audio_file.write(source_file.read())
        
        # Initialize transcription with default value
        transcription = "Audio recorded, but transcription failed"
        
        # Try Google Speech Recognition with improved parameters
        try:
            recognizer = sr.Recognizer()
            
            # Adjust recognition parameters for better results with speech
            recognizer.energy_threshold = 150  # Lower threshold to catch soft speech
            recognizer.dynamic_energy_threshold = True
            recognizer.pause_threshold = 1.5  # Longer pause threshold to avoid cutting off speech
            recognizer.phrase_threshold = 0.1  # More sensitive phrase detection
            recognizer.non_speaking_duration = 0.5  # More time for pauses between phrases
            
            audio_file_path = converted_audio_path if os.path.exists(converted_audio_path) else temp_audio_path
            
            with sr.AudioFile(audio_file_path) as source:
                # Adjust the source for ambient noise before recording
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                # Record the entire audio file
                audio = recognizer.record(source)
                logging.info("Audio file loaded successfully")
                
                # Try Google Speech Recognition with language specified
                try:
                    transcription = recognizer.recognize_google(audio, language="en-US", show_all=False)
                    logging.info(f"Google transcription successful: {transcription}")
                except sr.UnknownValueError:
                    logging.warning("Google Speech Recognition could not understand audio")
                    
                    # If the audio file is large, try breaking it into chunks
                    if len(audio_data) > 500000:  # If file is larger than ~500KB
                        logging.info("Trying chunked transcription for large audio file")
                        with sr.AudioFile(audio_file_path) as chunked_source:
                            # Process audio in chunks to handle longer recordings
                            chunked_audio = recognizer.record(chunked_source, duration=20)  
                            chunked_transcription = recognizer.recognize_google(chunked_audio)
                            transcription = chunked_transcription
                            logging.info(f"Chunked transcription successful: {transcription}")
                    else:
                        # Fall back to Sphinx (offline recognition) if Google fails
                        try:
                            transcription = recognizer.recognize_sphinx(audio)
                            logging.info(f"Sphinx transcription: {transcription}")
                        except Exception as sphinx_error:
                            logging.error(f"Sphinx recognition also failed: {sphinx_error}")
                except sr.RequestError as e:
                    logging.error(f"Google Speech Recognition service error: {e}")
        except Exception as e:
            logging.error(f"Error in speech recognition: {e}")
        
        # Try Whisper API as a last resort if transcription is still too short
        if len(transcription.split()) < 5 and os.getenv("OPENAI_API_KEY"):
            try:
                import openai
                client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
                
                with open(audio_path, "rb") as audio_file:
                    whisper_response = client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file
                    )
                    if whisper_response.text:
                        transcription = whisper_response.text
                        logging.info(f"Whisper transcription successful: {transcription}")
            except Exception as whisper_error:
                logging.error(f"Whisper transcription failed: {whisper_error}")
        
        # Save the transcription to a file
        answer_file_path = os.path.join(ANSWERS_DIR, f"answer_{sanitized_title}_q{question_id}.txt")
        with open(answer_file_path, 'w') as file:
            file.write(transcription)
        
        # Clean up temporary files
        for path in [temp_audio_path, converted_audio_path]:
            if os.path.exists(path):
                os.remove(path)
        
        return {"transcription": transcription, "success": True}
    
    except Exception as e:
        logging.error(f"Error processing audio: {e}")
        # Clean up temporary files
        for path in [temp_audio_path, converted_audio_path]:
            if 'path' in locals() and os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

@router.websocket("/ws/video")
async def video_stream(websocket: WebSocket):
    """
    WebSocket endpoint for gaze detection from video stream
    """
    await websocket.accept()
    logging.info("WebSocket connection established.")

    # Check if running in VM by trying to detect common VM environments
    is_vm = check_if_running_in_vm()
    if is_vm:
        logging.info("Running in VM environment - providing limited webcam functionality")
        await websocket.send_text(json.dumps({"gazeStatus": "Limited Mode (VM)", "isVm": True}))
    
    while True:
        try:
            data = await websocket.receive_text()
            
            # First check if it's a special command - for VM detection
            if data == "check_environment":
                await websocket.send_text(json.dumps({
                    "gazeStatus": "Limited Mode (VM)" if is_vm else "Ready",
                    "isVm": is_vm
                }))
                continue
            
            logging.info("Received frame from frontend.")

            # For VM environments, provide a consistent response
            if is_vm:
                await websocket.send_text(json.dumps({
                    "gazeStatus": "Limited Mode (VM)",
                    "isVm": True
                }))
                continue

            # Normal processing for non-VM environments
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
    Process video frame to detect if the user is looking at the camera
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

        # Add eye detection for more accurate gaze tracking
        eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        
        for (x, y, w, h) in faces:
            roi_gray = gray[y:y+h, x:x+w]
            eyes = eye_cascade.detectMultiScale(roi_gray)
            
            if len(eyes) >= 1:
                return "Looking at Camera"
            else:
                return "Eyes Not Detected"
        
        return "Looking Away"
    except Exception as e:
        logging.error(f"Error in face detection: {e}")
        return "Error detecting face"

def check_if_running_in_vm():
    """
    Check if the code is running inside a VM environment
    Returns True if VM is detected, False otherwise
    """
    try:
        # Method 1: Check for common VM-specific files
        vm_files = [
            "/sys/class/dmi/id/product_name",  # For Linux
            "/proc/cpuinfo",                   # Check for VM indicators in CPU info
        ]
        
        vm_indicators = [
            "VMware", "VirtualBox", "QEMU", "Virtual Machine",
            "KVM", "Xen", "innotek GmbH", "Parallels"
        ]
        
        for file_path in vm_files:
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r') as f:
                        content = f.read().lower()
                        if any(indicator.lower() in content for indicator in vm_indicators):
                            logging.info(f"VM detected via {file_path}")
                            return True
                except:
                    pass
        
        # Method 2: Check Docker container
        if os.path.exists('/.dockerenv'):
            logging.info("Docker container detected")
            return True
            
        # Method 3: Check if running inside WSL (Windows Subsystem for Linux)
        if os.path.exists('/proc/version'):
            try:
                with open('/proc/version', 'r') as f:
                    if 'microsoft' in f.read().lower():
                        logging.info("WSL detected")
                        return True
            except:
                pass
                
        # Method 4: Try to access webcam directly as a test
        try:
            test_cap = cv2.VideoCapture(0)
            if not test_cap.isOpened():
                logging.info("Cannot access webcam - assuming VM environment")
                return True
            test_cap.release()
        except Exception as e:
            logging.info(f"Webcam test failed, likely VM: {e}")
            return True
            
        return False
    except Exception as e:
        logging.error(f"Error checking VM status: {e}")
        # If we can't determine, assume it's not a VM to attempt full functionality
        return False

@router.post("/api/save-interview-summary")
async def save_interview_summary(
    request: InterviewSummaryRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Get logged-in HR
):
    """
    Save the interview summary with user's email
    """
    # Validate request
    if not all([request.email, request.interview_id, request.questions, request.answers, request.job_title]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    if len(request.questions) != len(request.answers):
        raise HTTPException(status_code=400, detail="Questions and answers count mismatch")
    
    try:
        # First check if the interview exists
        db_interview = db.query(DBInterview).filter(DBInterview.id == request.interview_id).first()
        if not db_interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Generate the analysis using existing function
        interview_analysis_request = InterviewAnalysisRequest(
            questions=request.questions,
            answers=request.answers,
            job_title=request.job_title
        )
        analysis_result = await analyze_interview(interview_analysis_request)
        
        # Save the summary to database with hr_id
        db_summary = DBInterviewSummary(
            interview_id=request.interview_id,
            email=request.email,
            summary=analysis_result.get("analysis", "No analysis generated"),
            hr_id=current_user.id  # Set the HR ID
        )
        
        db.add(db_summary)
        db.commit()
        
        return {"status": "success", "message": "Interview summary saved successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error saving interview summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving interview summary: {str(e)}")

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
import logging
from app.api.users import get_current_user  # ✅ Import get_current_user
from app.models import Candidate, JobDescription, User

# Response models for interview summaries
class InterviewSummaryResponse(BaseModel):
    id: int
    email: str
    summary: str
    completed_at: datetime
    job_title: str

@router.get("/api/interview-summaries", response_model=List[InterviewSummaryResponse])
async def get_all_interview_summaries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all interview summaries with related job titles for the current user"""
    try:
        # Query with proper HR filtering
        results = db.query(
            DBInterviewSummary.id,
            DBInterviewSummary.email,
            DBInterviewSummary.summary,
            DBInterviewSummary.completed_at,
            DBInterview.job_title
        ).join(
            DBInterview, 
            DBInterviewSummary.interview_id == DBInterview.id
        ).filter(
            DBInterviewSummary.hr_id == current_user.id  # Filter by current user's ID
        ).all()
        
        # Log debug information
        logging.info(f"Found {len(results)} interview summaries")
        logging.info(f"Current user ID: {current_user.id}")
        
        # If no results found, check if there are any summaries at all (for debugging)
        if not results:
            all_summaries_count = db.query(DBInterviewSummary).count()
            logging.info(f"Total interview summaries in database: {all_summaries_count}")
            
            # Check if there are summaries with this HR's ID
            hr_summaries = db.query(DBInterviewSummary).filter(
                DBInterviewSummary.hr_id == current_user.id
            ).count()
            logging.info(f"Summaries with HR ID {current_user.id}: {hr_summaries}")
        
        # Format results as dictionaries
        summaries = [
            {
                "id": id,
                "email": email,
                "summary": summary,
                "completed_at": completed_at,
                "job_title": job_title
            }
            for id, email, summary, completed_at, job_title in results
        ]
        
        return summaries
    except Exception as e:
        logging.error(f"Error retrieving interview summaries: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving interview summaries")

@router.get("/api/interview-summary/{summary_id}", response_model=InterviewSummaryResponse)
async def get_interview_summary(summary_id: int, db: Session = Depends(get_db)):
    """Get a specific interview summary by ID"""
    try:
        # Query the specific summary with job title
        result = db.query(
            DBInterviewSummary.id,
            DBInterviewSummary.email,
            DBInterviewSummary.summary,
            DBInterviewSummary.completed_at,
            DBInterview.job_title
        ).join(
            DBInterview, 
            DBInterviewSummary.interview_id == DBInterview.id
        ).filter(
            DBInterviewSummary.id == summary_id
        ).first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Interview summary not found")
        
        # Format result as dictionary
        id, email, summary, completed_at, job_title = result
        return {
            "id": id,
            "email": email,
            "summary": summary,
            "completed_at": completed_at,
            "job_title": job_title
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error retrieving interview summary {summary_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving interview summary")

# Main app entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)