from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Candidate,JobDescription
from app.schemas import CandidateOut
from app.utils.qdrant_utils import qdrant_client, collection_name  # Import Qdrant client functions
from pydantic import BaseModel
from typing import List,Optional
import numpy as np
from sentence_transformers import SentenceTransformer, util

embedding_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')


router = APIRouter()


class PromptRequest(BaseModel):
    prompt: str


@router.get("/candidates", response_model=List[CandidateOut])
def get_all_candidates(db: Session = Depends(get_db)):
    """
    Fetch all candidates from the database.
    """
    return db.query(Candidate).all()


@router.post("/filter_candidates", response_model=List[CandidateOut])
def filter_candidates(request: PromptRequest, db: Session = Depends(get_db)):
    """
    Filter candidates based on a prompt using Qdrant.
    """
    # Generate the embedding for the prompt
    prompt_embedding = embedding_model.encode([request.prompt], convert_to_numpy=True).flatten()

    # Search the Qdrant collection for the top 10 closest matches
    search_results = qdrant_client.search(
        collection_name=collection_name,
        query_vector=prompt_embedding.tolist(),
        limit=10,  # Top 10 results
        with_payload=True  # Include candidate metadata in the results
    )

    if not search_results:
        raise HTTPException(status_code=404, detail="No matching candidates found.")

    # Extract candidate IDs and scores from Qdrant results
    valid_indices = [
        (point.id, point.score) for point in search_results
    ]

    # Sort the results by score
    valid_indices.sort(key=lambda x: x[1], reverse=True)
    sorted_candidate_ids = [idx for idx, _ in valid_indices]

    # Retrieve matching candidates from the database
    matching_candidates = db.query(Candidate).filter(Candidate.id.in_(sorted_candidate_ids)).all()

    # Sort candidates by the order of the Qdrant results
    sorted_candidates = sorted(
        matching_candidates, key=lambda candidate: sorted_candidate_ids.index(candidate.id)
    )

    return sorted_candidates


@router.get("/candidates_of_job", response_model=List[CandidateOut])
def get_specific_candidates(title : Optional[str] = None,db: Session = Depends(get_db)):
    """
    Fetch all candidates from the database.
    """
    print(title)
    job=db.query(JobDescription).filter(JobDescription.title==title).first()
    print(job.id)
    return db.query(Candidate).filter(Candidate.job_description_id==job.id).all()