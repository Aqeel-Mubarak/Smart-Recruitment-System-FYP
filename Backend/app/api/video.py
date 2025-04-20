import os
import subprocess
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from groq import Groq
import logging

# Initialize the router
router = APIRouter()

# Directories for storing videos and transcripts
UPLOAD_DIR = "uploads"
TRANSCRIPT_DIR = "transcripts"

# Create directories if they don't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(TRANSCRIPT_DIR, exist_ok=True)

# In-memory storage for video processing status (in production, use a database)
video_status = {}

# Groq client initialization
GROQ_API_KEY = "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" # Use environment variables for security
groq_client = Groq(api_key=GROQ_API_KEY)

class VideoStatus(BaseModel):
    status: str
    summary: Optional[str] = None

@router.post("/api/video/upload-video")
async def upload_video(video: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    video_id = str(uuid.uuid4())
    file_extension = video.filename.split(".")[-1]
    video_path = os.path.join(UPLOAD_DIR, f"{video_id}.{file_extension}")
    
    # Save the uploaded video
    with open(video_path, "wb") as buffer:
        buffer.write(await video.read())
    
    video_status[video_id] = {"status": "processing", "summary": "", "path": video_path}
    
    background_tasks.add_task(process_video, video_id, video_path)
    
    return JSONResponse(
        status_code=200,
        content={
            "message": "Video uploaded successfully. Processing started.",
            "video_id": video_id,
            "status": "processing"
        }
    )

@router.get("/api/video/video/{video_id}")
async def get_video_status(video_id: str):
    if video_id not in video_status:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return VideoStatus(
        status=video_status[video_id]["status"],
        summary=video_status[video_id]["summary"]
    )

# Logging for debugging
logging.basicConfig(level=logging.INFO)

async def process_video(video_id: str, video_path: str):
    try:
        # Initialize variables
        audio_path = os.path.join(UPLOAD_DIR, f"{video_id}.wav")
        transcript_path = os.path.join(TRANSCRIPT_DIR, f"{video_id}.txt")
        
        # Extract audio
        extract_audio_cmd = [
            "ffmpeg", "-i", video_path, "-vn", "-acodec", "pcm_s16le", 
            "-ar", "16000", "-ac", "1", audio_path
        ]
        logging.info(f"Running command: {' '.join(extract_audio_cmd)}")
        subprocess.run(extract_audio_cmd, check=True)
        
        # Transcribe audio
        transcribe_cmd = [
            "whisper", audio_path, "--model", "base", "--output_dir", TRANSCRIPT_DIR,
            "--output_format", "txt"
        ]
        logging.info(f"Running command: {' '.join(transcribe_cmd)}")
        subprocess.run(transcribe_cmd, check=True)
        
        # Read the transcript file
        with open(transcript_path, "r") as f:
            transcript_text = f.read()
        
        # Generate a summary from the transcript
        summary = await generate_summary_with_groq(transcript_text)
        
        video_status[video_id]["status"] = "completed"
        video_status[video_id]["summary"] = summary
        logging.info(f"Video processing completed successfully for {video_id}")
        
    except Exception as e:
        video_status[video_id]["status"] = "failed"
        video_status[video_id]["summary"] = f"Failed to process video: {str(e)}"
        logging.error(f"Error processing video {video_id}: {str(e)}")
    
    finally:
        # Clean up temporary files
        if os.path.exists(audio_path):
            os.remove(audio_path)
        if os.path.exists(transcript_path):
            os.remove(transcript_path)

async def generate_summary_with_groq(transcript: str):
    try:
        logging.info("Generating summary for the transcript.")
        
        # Modify the prompt to explicitly ask for an evaluation of the interviewer's performance
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "system",
                "content": "You are an AI assistant specializing in analyzing interview transcripts and providing assessments of candidates' suitability for jobs."
            }, {
                "role": "user",
                "content": f"Please provide a brief  evaluation of the interviewer's performance, abilities, knowledge, and suitability for the job. Consider whether the interviewer demonstrated the necessary skills, knowledge, and professionalism for the position in question. Transcript: {transcript}"
            }],
            temperature=0.5,
            max_tokens=500
        )
        
        summary = completion.choices[0].message.content
        logging.info(f"Generated summary: {summary}")
        return summary
    except Exception as e:
        logging.error(f"Error generating summary: {str(e)}")
        return f"Failed to generate summary: {str(e)}"


