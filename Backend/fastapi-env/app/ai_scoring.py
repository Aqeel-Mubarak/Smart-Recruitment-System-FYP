# ai_scoring.py

from sentence_transformers import SentenceTransformer, util
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

# Load a pre-trained model from Sentence-BERT (SBERT) for semantic similarity
model = SentenceTransformer('all-MiniLM-L6-v2')

def calculate_ai_score(resume_text: str, job_description: str) -> int:
    """
    Calculate the AI score for a candidate based on the resume text and job description using semantic similarity and keyword matching.

    :param resume_text: Extracted text from the candidate's resume.
    :param job_description: Text of the job description.
    :return: AI score as an integer (0-100).
    """
    if not job_description or not resume_text:
        return 0

    # Step 1: Calculate Semantic Similarity
    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    job_desc_embedding = model.encode(job_description, convert_to_tensor=True)
    similarity_score = util.pytorch_cos_sim(resume_embedding, job_desc_embedding).item()

    # Clamp the similarity score between 0 and 1 to avoid anomalies
    similarity_score = max(0, min(similarity_score, 1))

    # Convert similarity score to a percentage (0 to 100)
    semantic_score = similarity_score * 100

    # Step 2: Keyword Matching using TF-IDF
    vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
    tfidf_matrix = vectorizer.fit_transform([job_description, resume_text])
    tfidf_similarity = (tfidf_matrix * tfidf_matrix.T).A[0, 1]

    # Clamp the TF-IDF similarity between 0 and 1
    tfidf_similarity = max(0, min(tfidf_similarity, 1))

    # Convert TF-IDF similarity to a percentage (0 to 100)
    keyword_score = tfidf_similarity * 100

    # Step 3: Combine Semantic and Keyword Scores with adjusted weights
    combined_score = (semantic_score * 0.5) + (keyword_score * 0.5)

    # Step 4: Add a penalty for very short resumes or low-quality texts
    if len(resume_text) < 100:  # Example threshold, adjust as needed
        combined_score -= 10

    # Ensure the final score is in the range of 0 to 100
    final_score = min(100, max(0, combined_score))

    return int(final_score)
