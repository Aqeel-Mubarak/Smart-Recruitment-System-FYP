# ai_scoring.py
from sentence_transformers import SentenceTransformer
import torch
import torch.nn.functional as F
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import warnings

warnings.filterwarnings("ignore")

# Use single model instance for all embedding operations
model = SentenceTransformer('nomic-ai/nomic-embed-text-v1', trust_remote_code=True)

def generate_embeddings(text: str) -> np.ndarray:
    """
    Generate embeddings for given text using the Nomic model.
    
    :param text: Input text to generate embeddings for
    :return: Numpy array of embeddings
    """
    embedding = model.encode(text, convert_to_tensor=True)
    return embedding.cpu().numpy()

def calculate_ai_score(resume_embedding: np.ndarray, job_description_embedding: np.ndarray) -> int:
    """
    Calculate AI score using pre-computed embeddings.
    
    :param resume_embedding: Pre-computed resume embeddings
    :param job_description_embedding: Pre-computed job description embeddings
    :return: AI score as integer (0-100)
    """
    # Convert numpy arrays to torch tensors
    resume_tensor = torch.from_numpy(resume_embedding).unsqueeze(0)
    job_desc_tensor = torch.from_numpy(job_description_embedding).unsqueeze(0)
    
    # Calculate semantic similarity
    similarity_score = F.cosine_similarity(resume_tensor, job_desc_tensor).item()
    similarity_score = max(0, min(similarity_score, 1))
    semantic_score = similarity_score * 100
    
    return int(semantic_score)