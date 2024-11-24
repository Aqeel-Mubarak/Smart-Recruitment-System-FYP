from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Candidate
from app.schemas import CandidateOut
from app.utils.faiss_utils import index, faiss_index_to_candidate_id, embedding_model, rebuild_faiss_index
from pydantic import BaseModel
from typing import List

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
    Filter candidates based on a prompt.
    """
    if index.ntotal == 0:
        rebuild_faiss_index()

    # Generate prompt embedding
    prompt_embedding = embedding_model.encode([request.prompt], convert_to_numpy=True)

    # Search FAISS index
    distances, indices = index.search(prompt_embedding, k=10)
    if len(indices[0]) == 0:
        return []

    # Map FAISS indices to candidate IDs
    valid_indices = [
        (idx, dist) for idx, dist in zip(indices[0], distances[0]) if idx in faiss_index_to_candidate_id
    ]
    if not valid_indices:
        raise HTTPException(status_code=404, detail="No matching candidates found.")

    # Sort by relevance
    valid_indices.sort(key=lambda x: x[1])
    sorted_candidate_ids = [faiss_index_to_candidate_id[idx] for idx, _ in valid_indices]

    # Retrieve candidates from the database
    matching_candidates = db.query(Candidate).filter(Candidate.id.in_(sorted_candidate_ids)).all()
    sorted_candidates = sorted(
        matching_candidates, key=lambda candidate: sorted_candidate_ids.index(candidate.id)
    )

    return sorted_candidates
