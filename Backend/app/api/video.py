# Standard library imports for file operations, process management, and unique ID generation
import os
import subprocess
import uuid
# FastAPI imports for creating API endpoints and handling file uploads
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
# Groq client for AI-powered transcript analysis
from groq import Groq
import logging

# Initialize the FastAPI router for handling video-related endpoints
router = APIRouter()

# Define directories for storing uploaded videos and their transcripts
UPLOAD_DIR = "uploads"
TRANSCRIPT_DIR = "transcripts"

# Ensure required directories exist for storing files
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(TRANSCRIPT_DIR, exist_ok=True)

# Dictionary to store video processing status (Note: In production, use a database instead)
video_status = {}

# Initialize Groq client for AI analysis (Note: API key should be stored in environment variables)
GROQ_API_KEY = "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" # Use environment variables for security
groq_client = Groq(api_key=GROQ_API_KEY)

# Pydantic model for video status response
class VideoStatus(BaseModel):
    status: str
    summary: Optional[str] = None

# Endpoint to handle video uploads and initiate processing
@router.post("/api/video/upload-video")
async def upload_video(video: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    # Generate unique ID for the video
    video_id = str(uuid.uuid4())
    # Extract file extension from original filename
    file_extension = video.filename.split(".")[-1]
    # Create path for storing the video
    video_path = os.path.join(UPLOAD_DIR, f"{video_id}.{file_extension}")
    
    # Save the uploaded video to disk
    with open(video_path, "wb") as buffer:
        buffer.write(await video.read())
    
    # Initialize video status in memory
    video_status[video_id] = {"status": "processing", "summary": "", "path": video_path}
    
    # Add video processing task to background tasks
    background_tasks.add_task(process_video, video_id, video_path)
    
    # Return success response with video ID
    return JSONResponse(
        status_code=200,
        content={
            "message": "Video uploaded successfully. Processing started.",
            "video_id": video_id,
            "status": "processing"
        }
    )

# Endpoint to check video processing status
@router.get("/api/video/video/{video_id}")
async def get_video_status(video_id: str):
    # Check if video exists in status tracking
    if video_id not in video_status:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Return current status and summary
    return VideoStatus(
        status=video_status[video_id]["status"],
        summary=video_status[video_id]["summary"]
    )

# Configure logging for debugging purposes
logging.basicConfig(level=logging.INFO)

# Background task function to process uploaded videos
async def process_video(video_id: str, video_path: str):
    try:
        # Define paths for intermediate files
        audio_path = os.path.join(UPLOAD_DIR, f"{video_id}.wav")
        transcript_path = os.path.join(TRANSCRIPT_DIR, f"{video_id}.txt")
        
        # Extract audio from video using ffmpeg
        # Parameters: -vn (no video), -acodec pcm_s16le (audio codec), -ar 16000 (sample rate), -ac 1 (mono)
        extract_audio_cmd = [
            "ffmpeg", "-i", video_path, "-vn", "-acodec", "pcm_s16le", 
            "-ar", "16000", "-ac", "1", audio_path
        ]
        logging.info(f"Running command: {' '.join(extract_audio_cmd)}")
        subprocess.run(extract_audio_cmd, check=True)
        
        # Transcribe audio using Whisper model
        # Parameters: base model, output directory, text format
        transcribe_cmd = [
            "whisper", audio_path, "--model", "base", "--output_dir", TRANSCRIPT_DIR,
            "--output_format", "txt"
        ]
        logging.info(f"Running command: {' '.join(transcribe_cmd)}")
        subprocess.run(transcribe_cmd, check=True)
        
        # Read the generated transcript
        with open(transcript_path, "r") as f:
            transcript_text = f.read()
        
        # Generate AI-powered summary of the interview
        summary = await generate_summary_with_groq(transcript_text)
        
        # Update video status with completion and summary
        video_status[video_id]["status"] = "completed"
        video_status[video_id]["summary"] = summary
        logging.info(f"Video processing completed successfully for {video_id}")
        
    except Exception as e:
        # Handle any errors during processing
        video_status[video_id]["status"] = "failed"
        video_status[video_id]["summary"] = f"Failed to process video: {str(e)}"
        logging.error(f"Error processing video {video_id}: {str(e)}")
    
    finally:
        # Clean up temporary files after processing
        if os.path.exists(audio_path):
            os.remove(audio_path)
        if os.path.exists(transcript_path):
            os.remove(transcript_path)

# Function to generate AI-powered summary of interview transcript
async def generate_summary_with_groq(transcript: str):
    try:
        logging.info("Generating summary for the transcript.")
        
        # Use Groq's LLM to analyze the interview transcript
        # The prompt is designed to evaluate interviewer performance and suitability
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "system",
                "content": "You are an AI assistant specializing in analyzing interview transcripts and providing assessments of candidates' suitability for jobs."
            }, {
                "role": "user",
                "content": f"Please provide a brief  evaluation of the interviewer's performance, abilities, knowledge, and suitability for the job. Consider whether the interviewer demonstrated the necessary skills, knowledge, and professionalism for the position in question. Transcript: {transcript}"
            }],
            temperature=0.5,  # Control randomness in response
            max_tokens=500    # Limit response length
        )
        
        # Extract and return the generated summary
        summary = completion.choices[0].message.content
        logging.info(f"Generated summary: {summary}")
        return summary
    except Exception as e:
        # Handle any errors in summary generation
        logging.error(f"Error generating summary: {str(e)}")
        return f"Failed to generate summary: {str(e)}"


