# ai_scoring.py
# This module implements AI-based scoring functionality for resume-job description matching
# using semantic similarity and embeddings

# Import required libraries for text processing and similarity calculations
from sentence_transformers import SentenceTransformer  # For generating text embeddings
import torch  # For tensor operations
import torch.nn.functional as F  # For neural network functions like cosine similarity
from sklearn.feature_extraction.text import TfidfVectorizer  # For TF-IDF vectorization
from sklearn.metrics.pairwise import cosine_similarity  # For calculating cosine similarity
import numpy as np  # For numerical operations
import warnings  # For handling warnings

# Suppress warnings to keep the output clean
warnings.filterwarnings("ignore")

# Initialize the Nomic AI text embedding model
# This model will be used to convert text into numerical embeddings
# Using a single model instance for better performance and resource management
model = SentenceTransformer('nomic-ai/nomic-embed-text-v1', trust_remote_code=True)

def generate_embeddings(text: str) -> np.ndarray:
    """
    Generate embeddings for given text using the Nomic model.
    
    This function takes a text input and converts it into a numerical representation
    (embedding) that captures the semantic meaning of the text.
    
    :param text: Input text to generate embeddings for
    :return: Numpy array of embeddings representing the text's semantic meaning
    """
    # Convert text to embedding using the model and return as numpy array
    embedding = model.encode(text, convert_to_tensor=True)
    return embedding.cpu().numpy()

def calculate_ai_score(resume_embedding: np.ndarray, job_description_embedding: np.ndarray) -> int:
    """
    Calculate AI score using pre-computed embeddings.
    
    This function computes a similarity score between a resume and job description
    by comparing their embeddings. The score is normalized to a 0-100 scale.
    
    :param resume_embedding: Pre-computed resume embeddings as numpy array
    :param job_description_embedding: Pre-computed job description embeddings as numpy array
    :return: AI score as integer between 0 and 100, representing match quality
    """
    # Convert numpy arrays to torch tensors for similarity calculation
    resume_tensor = torch.from_numpy(resume_embedding).unsqueeze(0)
    job_desc_tensor = torch.from_numpy(job_description_embedding).unsqueeze(0)
    
    # Calculate semantic similarity using cosine similarity
    # This measures how similar the resume is to the job description
    similarity_score = F.cosine_similarity(resume_tensor, job_desc_tensor).item()
    
    # Ensure score is between 0 and 1
    similarity_score = max(0, min(similarity_score, 1))
    
    # Convert similarity score to percentage (0-100)
    semantic_score = similarity_score * 100
    
    # Return integer score
    return int(semantic_score)