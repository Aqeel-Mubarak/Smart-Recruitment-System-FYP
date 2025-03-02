import cv2
import logging
from fastapi import Request, HTTPException, APIRouter, WebSocket, WebSocketDisconnect, Body, UploadFile, File, Form
import base64
import io
from PIL import Image
import numpy as np
from groq import Groq
import os
import json
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import speech_recognition as sr

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

# Create directories for storing files if they don't exist
QUESTIONS_DIR = "questions"
ANSWERS_DIR = "answers"
os.makedirs(QUESTIONS_DIR, exist_ok=True)
os.makedirs(ANSWERS_DIR, exist_ok=True)

# Initialize question cache dictionary
question_cache = {}

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
            
            # Update cache
            question_cache[sanitized_title] = questions
            
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
    
    # Update cache
    question_cache[sanitized_title] = fallback_questions
    
    return {"questions": fallback_questions}

@router.get("/api/get-questions/{job_title}")
async def get_questions(job_title: str):
    """
    This endpoint fetches the interview questions stored in a text file.
    """
    try:
        # Sanitize job title for filename
        sanitized_title = "".join(c if c.isalnum() else "_" for c in job_title.lower())
        
        # Check cache first
        if sanitized_title in question_cache:
            logging.info(f"Returning cached questions for {job_title}")
            return {"questions": question_cache[sanitized_title]}
        
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
        
        # Update cache
        question_cache[sanitized_title] = questions
            
        return {"questions": questions}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching questions for {job_title}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching questions: {str(e)}")

@router.post("/api/analyze-answer")
async def analyze_answer(request: Request):
    data = await request.json()
    question = data.get("question")
    answer = data.get("answer")
    job_title = data.get("job_title")
    
    if not all([question, answer, job_title]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    try:
        if not groq_client:
            return {"feedback": "Answer analysis not available"}
        
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "system",
                "content": "You are an AI assistant specializing in interview coaching."
            }, {
                "role": "user",
                "content": f"For a {job_title} position, analyze this answer to the question: '{question}'\n\nAnswer: {answer}\n\nProvide brief, constructive feedback."
            }],
            temperature=0.5,
            max_tokens=300
        )
        
        feedback = completion.choices[0].message.content.strip()
        return {"feedback": feedback}
    except Exception as e:
        logging.error(f"Error analyzing answer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing answer: {str(e)}")


@router.post("/api/analyze-interview")
async def analyze_interview(request: Request):
    """
    This endpoint analyzes the entire interview session and provides overall feedback.
    """
    data = await request.json()
    questions = data.get("questions", [])
    answers = data.get("answers", [])
    job_title = data.get("job_title")
    
    if not all([questions, job_title]) or len(questions) == 0:
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    if len(questions) != len(answers):
        raise HTTPException(status_code=400, detail="Questions and answers count mismatch")
    
    try:
        if not groq_client:
            return {"analysis": "Interview analysis not available"}
        
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
                "content": f"Please analyze this interview for a {job_title} position and provide overall feedback. Consider the quality of answers, areas of strength, and suggestions for improvement. Keep your analysis professional but friendly.\n\n{interview_text}"
            }],
            temperature=0.5,
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
    This endpoint receives audio from the frontend, transcribes it to text,
    and saves both the audio and transcription.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No audio file provided")
    
    if not job_title:
        raise HTTPException(status_code=400, detail="Job title is required")
    
    if question_id is None:
        raise HTTPException(status_code=400, detail="Question ID is required")
    
    # Create unique filenames
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    sanitized_title = "".join(c if c.isalnum() else "_" for c in job_title.lower())
    temp_audio_path = f"temp_audio_{timestamp}.webm"
    converted_audio_path = f"temp_audio_{timestamp}.wav"
    
    try:
        # Read the audio file
        audio_data = await file.read()
        
        # Save the uploaded file
        with open(temp_audio_path, "wb") as temp_file:
            temp_file.write(audio_data)
        
        # Convert the audio to WAV format for better compatibility with speech_recognition
        try:
            import subprocess
            # Use ffmpeg to convert the audio to WAV format
            subprocess.run([
                'ffmpeg', '-i', temp_audio_path, 
                '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', 
                converted_audio_path
            ], check=True)
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
        
        # Transcribe the audio - try multiple approaches
        transcription = "Audio recorded, but transcription failed"
        
        # Try Google Speech Recognition first
        try:
            recognizer = sr.Recognizer()
            
            # Adjust recognition parameters for better results
            recognizer.energy_threshold = 300
            recognizer.dynamic_energy_threshold = True
            recognizer.pause_threshold = 0.8
            
            audio_file_path = converted_audio_path if os.path.exists(converted_audio_path) else temp_audio_path
            
            with sr.AudioFile(audio_file_path) as source:
                audio = recognizer.record(source)
                logging.info("Audio file loaded successfully")
                
                # Try Google Speech Recognition
                try:
                    transcription = recognizer.recognize_google(audio)
                    logging.info(f"Google transcription successful: {transcription}")
                except sr.UnknownValueError:
                    logging.warning("Google Speech Recognition could not understand audio")
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