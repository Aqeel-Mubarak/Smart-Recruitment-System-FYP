from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams
from qdrant_client.http.models import Distance
import numpy as np

# Initialize Qdrant client for Cloud or Local instance
QDRANT_URL = "https://4ac18d44-2f06-418f-9f7a-835a33322a7d.us-east4-0.gcp.cloud.qdrant.io"  # Replace with your Qdrant Cloud URL
API_KEY = "HkR-9_8ZiKRu5PZmu0TyfauP5v81b5UnBXQ4e-8n7flLmRTbHEoHwA"  # Replace with your Qdrant Cloud API key

qdrant_client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)  # Updated variable name

# You can specify a collection to use. If it doesn't exist, you'll create it.
collection_name = "resumes_embeddings"

def create_qdrant_collection():
    """Create Qdrant collection if it doesn't already exist."""
    try:
        qdrant_client.get_collection(collection_name)  # Updated to use qdrant_client
    except Exception:
        # Create the collection with a vector size of 384 (for 'paraphrase-MiniLM-L6-v2' model)
        qdrant_client.create_collection(  # Updated to use qdrant_client
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=384,  # The vector size for 'paraphrase-MiniLM-L6-v2'
                distance=Distance.COSINE  # Using cosine distance metric
            )
        )

def upload_embeddings_to_qdrant(embedding: np.ndarray, candidate_id: int):
    """Upload embeddings to Qdrant."""
    qdrant_client.upsert(  # Updated to use qdrant_client
        collection_name=collection_name,
        points=[{
            "id": candidate_id,  # Use the candidate ID as the point ID
            "vector": embedding.tolist(),  # Convert numpy array to list
            "payload": {"candidate_id": candidate_id}  # Optional metadata
        }]
    )

def insert_embedding_into_qdrant(candidate_id: int, embedding: np.ndarray):
    """Insert the embedding into Qdrant."""
    qdrant_client.upsert(  # Updated to use qdrant_client
        collection_name=collection_name,
        points=[{
            "id": candidate_id,  # Use the candidate ID as the point ID
            "vector": embedding.tolist(),  # Convert numpy array to list
            "payload": {"candidate_id": candidate_id}  # Optional metadata
        }]
    )

# Call this method to ensure the collection is created when the application starts
create_qdrant_collection()
