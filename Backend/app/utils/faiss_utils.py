from threading import Lock
from sentence_transformers import SentenceTransformer
import faiss
from app.database import SessionLocal
from app.models import Candidate

# Initialize FAISS components
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
dimension = 384  # Embedding vector size
index = faiss.IndexFlatL2(dimension)
faiss_index_to_candidate_id = {}
faiss_lock = Lock()


def rebuild_faiss_index():
    """
    Rebuild the FAISS index from the database.
    """
    global index, faiss_index_to_candidate_id
    with SessionLocal() as db:
        candidates = db.query(Candidate).all()
        if not candidates:
            print("No candidates found in the database.")
            return

        # Clear existing index and mapping
        index.reset()
        faiss_index_to_candidate_id.clear()

        texts = [candidate.resume_text for candidate in candidates]
        embeddings = embedding_model.encode(texts, convert_to_numpy=True)
        with faiss_lock:
            index.add(embeddings)
            for idx, candidate in enumerate(candidates):
                faiss_index_to_candidate_id[idx] = candidate.id

        print(f"FAISS index rebuilt with {len(candidates)} candidates.")
