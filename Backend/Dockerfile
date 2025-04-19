FROM python:3.11-alpine

WORKDIR /app

# Install system dependencies with specific versions
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    ffmpeg \
    tesseract-ocr \
    poppler-utils \
    libmagic \
    tesseract-ocr-data-eng \
    libffi-dev \
    openssl-dev \
    poppler \
    ghostscript




# Copy requirements file
COPY requirements.txt .

# Configure pip for better reliability
RUN pip install --no-cache-dir --upgrade pip && \
    pip config set global.timeout 600 && \
    # Remove PyWin32 (Windows-only package) from requirements
    grep -v "pywin32" requirements.txt > requirements_filtered.txt

# Install packages in small batches with retries for better reliability
RUN pip install --no-cache-dir --retries 5 psycopg2-binary && \
    # Split requirements into smaller chunks to avoid timeout issues
    pip install --no-cache-dir --retries 5 -r requirements_filtered.txt || \
    # If that fails, try installing the most essential packages first
    (pip install --no-cache-dir --retries 5 fastapi uvicorn sqlalchemy && \
     pip install --no-cache-dir --retries 5 -r requirements_filtered.txt)

# Create directories for storage
RUN mkdir -p uploads transcripts

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]