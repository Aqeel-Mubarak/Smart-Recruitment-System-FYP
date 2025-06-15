# utils/qdrant_utils.py
# This module provides utility functions for interacting with Qdrant vector database
# Qdrant is used to store and retrieve vector embeddings of resumes for semantic search

# Import required libraries
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams
from qdrant_client.http.models import Distance
import numpy as np
from app.ai_scoring import model  # Relative import for the model

# Qdrant cloud instance configuration
# These credentials are used to connect to the Qdrant cloud service
QDRANT_URL = "https://4ac18d44-2f06-418f-9f7a-835a33322a7d.us-east4-0.gcp.cloud.qdrant.io"
API_KEY = "HkR-9_8ZiKRu5PZmu0TyfauP5v81b5UnBXQ4e-8n7flLmRTbHEoHwA"

# Initialize Qdrant client with cloud credentials
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)
# Define the collection name for storing resume embeddings
collection_name = "resume"

def create_qdrant_collection():
    """
    Create Qdrant collection if it doesn't exist.
    This function initializes a new collection in Qdrant with the appropriate vector configuration.
    The vector size is determined by the embedding model's output dimension.
    """
    try:
        qdrant_client.get_collection(collection_name)
    except Exception:
        # Get vector size from the Nomic model by encoding a test string
        sample_embedding = model.encode("test", convert_to_tensor=True)
        vector_size = sample_embedding.shape[0]
        
        # Create new collection with cosine similarity as distance metric
        qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=vector_size,
                distance=Distance.COSINE
            )
        )

def store_embeddings(embedding: np.ndarray, candidate_id: int, metadata: dict = None):
    """
    Store embeddings in Qdrant with associated metadata.
    
    Args:
        embedding (np.ndarray): Vector embedding of the resume
        candidate_id (int): Unique identifier for the candidate
        metadata (dict, optional): Additional metadata to store with the embedding
    """
    if metadata is None:
        metadata = {}
    
    # Add candidate_id to metadata for easier retrieval
    metadata["candidate_id"] = candidate_id
    
    # Upsert operation: creates new point if doesn't exist, updates if it does
    qdrant_client.upsert(
        collection_name=collection_name,
        points=[{
            "id": candidate_id,
            "vector": embedding.tolist(),
            "payload": metadata
        }]
    )

def get_embedding(candidate_id: int) -> np.ndarray:
    """
    Retrieve embeddings for a specific candidate.
    
    Args:
        candidate_id (int): Unique identifier of the candidate
        
    Returns:
        np.ndarray: Vector embedding of the candidate's resume if found, None otherwise
    """
    result = qdrant_client.retrieve(
        collection_name=collection_name,
        ids=[candidate_id],
        with_vectors=True
    )
    if result:
        return np.array(result[0].vector)
    return None

# Initialize collection when module is imported
# This ensures the collection exists before any operations are performed
create_qdrant_collection()