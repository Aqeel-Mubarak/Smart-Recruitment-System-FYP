from fastapi import UploadFile
from docx import Document
from io import BytesIO
from PyPDF2 import PdfReader
import textract
import re


from typing import Optional


def extract_email(text: str) -> Optional[str]:
    """
    Extract email address from the given text using regular expressions.
    Returns None if no email is found.
    """
    cleaned_text = re.sub(r'\s+', ' ', text)  # Replace any whitespace characters with a single space

    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}'

    # Find all matches (in case there are multiple emails)
    matches = re.findall(email_pattern, cleaned_text)

    # Return the first match if available
    return matches[0] if matches else None


def parse_pdf(file: UploadFile):
    """
    Parse the text content from a PDF file using PyPDF2.
    """
    try:
        file_content = file.file.read()
        reader = PdfReader(BytesIO(file_content))
        pdf_text = ""

        # Extract text from each page in the PDF
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:  # Ensure text is not None
                pdf_text += page_text + "\n"

        return pdf_text
    except Exception as e:
        raise ValueError(f"Error parsing PDF file: {str(e)}")

def parse_doc(file: UploadFile):
    """
    Parse the text content from a DOC or DOCX file.
    Determines the file type and calls the appropriate parsing function.
    """
    if file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        # Parse .docx files
        return parse_docx(file)
    elif file.content_type == "application/msword":
        # Parse .doc files
        return parse_doc_file(file)
    else:
        raise ValueError("Unsupported file format for parsing.")

def parse_docx(file: UploadFile):
    """
    Parse the text content from a DOCX file using python-docx.
    """
    try:
        # Read the DOCX file content using BytesIO
        file_content = file.file.read()  # Read the file content into memory
        document = Document(BytesIO(file_content))  # Create a Document object using BytesIO
        doc_text = ""
        
        # Extract text from each paragraph in the DOCX file
        for paragraph in document.paragraphs:
            doc_text += paragraph.text + "\n"
        
        return doc_text
    except Exception as e:
        raise ValueError(f"Error parsing DOCX file: {str(e)}")

def parse_doc_file(file: UploadFile):
    """
    Parse the text content from a DOC file using textract.
    """
    try:
        # Use textract to extract text from DOC files
        text = textract.process(file.file)
        return text.decode("utf-8")
    except Exception as e:
        raise ValueError(f"Error parsing DOC file: {str(e)}")
