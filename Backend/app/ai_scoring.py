from sentence_transformers import SentenceTransformer, util
import numpy as np
import warnings

warnings.filterwarnings("ignore")  # Suppress warnings

# Load a pre-trained model for paraphrase detection (optimized for semantic similarity)
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

def split_text_into_chunks(text, chunk_size=512):
    """
    Split a long text into chunks of a specified maximum length.
    :param text: The text to be split.
    :param chunk_size: Maximum length of each chunk.
    :return: List of text chunks.
    """
    sentences = text.split('. ')  # Split by sentence for chunking
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) + 1 <= chunk_size:  # Add sentence if it fits
            current_chunk += sentence + ". "
        else:
            chunks.append(current_chunk.strip())  # Add the current chunk
            current_chunk = sentence + ". "  # Start a new chunk
    
    if current_chunk:  # Add any remaining text as the last chunk
        chunks.append(current_chunk.strip())
    
    return chunks

def calculate_ai_score(resume_text: str, job_description: str) -> int:
    """
    Calculate the AI score for a candidate based on the resume text and job description using semantic similarity and keyword matching.

    :param resume_text: Extracted text from the candidate's resume.
    :param job_description: Text of the job description.
    :return: AI score as an integer (0-100).
    """
    if not job_description or not resume_text:
        return 0

    # Step 1: Split the resume and job description into chunks
    resume_chunks = split_text_into_chunks(resume_text)
    job_desc_chunks = split_text_into_chunks(job_description)

    # Step 2: Generate embeddings for each chunk
    resume_embeddings = [model.encode(chunk, convert_to_tensor=True) for chunk in resume_chunks]
    job_desc_embeddings = [model.encode(chunk, convert_to_tensor=True) for chunk in job_desc_chunks]

    # Ensure there are embeddings generated for both resume and job description
    if not resume_embeddings or not job_desc_embeddings:
        return 0

    # Step 3: Flatten and concatenate the embeddings of all resume chunks and job description chunks
    concatenated_resume_embedding = np.concatenate([embedding.cpu().detach().numpy().flatten() for embedding in resume_embeddings], axis=0)
    concatenated_job_desc_embedding = np.concatenate([embedding.cpu().detach().numpy().flatten() for embedding in job_desc_embeddings], axis=0)

    # Step 4: Ensure both concatenated embeddings have the same size
    max_length = max(len(concatenated_resume_embedding), len(concatenated_job_desc_embedding))
    
    # Padding with zeros if necessary
    concatenated_resume_embedding = np.pad(concatenated_resume_embedding, (0, max_length - len(concatenated_resume_embedding)), 'constant')
    concatenated_job_desc_embedding = np.pad(concatenated_job_desc_embedding, (0, max_length - len(concatenated_job_desc_embedding)), 'constant')

    # Step 5: Create a mask for the padded values (1 for actual, 0 for padded)
    mask_resume = np.where(concatenated_resume_embedding != 0, 1, 0)
    mask_job_desc = np.where(concatenated_job_desc_embedding != 0, 1, 0)

        # Step 1: Apply the mask to the embeddings to ignore padded values
    masked_resume_embedding = concatenated_resume_embedding * mask_resume
    masked_job_desc_embedding = concatenated_job_desc_embedding * mask_job_desc

    # Step 2: Calculate cosine similarity on the masked embeddings
    similarity_score = util.pytorch_cos_sim(masked_resume_embedding, masked_job_desc_embedding).item()

    # Clamp the similarity score between 0 and 1 to avoid anomalies
    similarity_score = max(0, min(similarity_score, 1))

    # Convert similarity score to a percentage (0 to 100)
    semantic_score = similarity_score * 100

    # Step 7: Keyword Matching using TF-IDF
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity

    vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
    tfidf_matrix = vectorizer.fit_transform([job_description, resume_text])

    # Cosine similarity is more efficient with sklearn's function
    tfidf_similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

    # Clamp the similarity score between 0 and 1
    tfidf_similarity = max(0, min(tfidf_similarity, 1))

    # Convert to a percentage (0 to 100)
    keyword_score = tfidf_similarity * 100

    # Step 8: Combine Semantic and Keyword Scores with adjusted weights
    combined_score = (semantic_score * 0.5) + (keyword_score * 0.5)  # Adjusted weights for balance

    # Step 9: Add a penalty for very short resumes or low-quality texts
    if len(resume_text) < 100:  # Example threshold, adjust as needed
        combined_score -= 10

    # Ensure the final score is in the range of 0 to 100
    final_score = min(100, max(0, combined_score))

    return int(final_score)
