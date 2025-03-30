# utils/qdrant_utils.py
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams
from qdrant_client.http.models import Distance
import numpy as np
from app.ai_scoring import model  # Relative import for the model

QDRANT_URL = "https://4ac18d44-2f06-418f-9f7a-835a33322a7d.us-east4-0.gcp.cloud.qdrant.io"
API_KEY = "HkR-9_8ZiKRu5PZmu0TyfauP5v81b5UnBXQ4e-8n7flLmRTbHEoHwA"

qdrant_client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)
collection_name = "resume"

def create_qdrant_collection():
    """Create Qdrant collection if it doesn't exist."""
    try:
        qdrant_client.get_collection(collection_name)
    except Exception:
        # Get vector size from the Nomic model
        sample_embedding = model.encode("test", convert_to_tensor=True)
        vector_size = sample_embedding.shape[0]
        
        qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=vector_size,
                distance=Distance.COSINE
            )
        )

def store_embeddings(embedding: np.ndarray, candidate_id: int, metadata: dict = None):
    """Store embeddings in Qdrant with associated metadata."""
    if metadata is None:
        metadata = {}
    
    metadata["candidate_id"] = candidate_id
    
    qdrant_client.upsert(
        collection_name=collection_name,
        points=[{
            "id": candidate_id,
            "vector": embedding.tolist(),
            "payload": metadata
        }]
    )

def get_embedding(candidate_id: int) -> np.ndarray:
    """Retrieve embeddings for a specific candidate."""
    result = qdrant_client.retrieve(
        collection_name=collection_name,
        ids=[candidate_id],
        with_vectors=True
    )
    if result:
        return np.array(result[0].vector)
    return None

# Initialize collection on import
create_qdrant_collection()