from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Candidate

from app.schemas import CandidateOut

router = APIRouter()

# Route to fetch all candidates with extracted text
@router.get("/candidates", response_model=list[CandidateOut])
def get_all_candidates(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).all()
    return candidates