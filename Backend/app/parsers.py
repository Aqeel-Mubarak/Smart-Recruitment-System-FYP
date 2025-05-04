from fastapi import UploadFile
from docx import Document
from io import BytesIO
import pdfplumber
import textract
import re
from typing import Optional

import pytesseract
from pdf2image import convert_from_bytes
def extract_email(text: str) -> Optional[str]:
    """
    Extract email address from the given text using regular expressions.
    If an extracted email has a gmail domain that isn't exactly 'gmail.com',
    it is normalized to use 'gmail.com'.
    Returns None if no email is found.
    """
    cleaned_text = re.sub(r'\s+', ' ', text)  # Replace multiple whitespaces with a single space
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    matches = re.findall(email_pattern, cleaned_text)
    
    if matches:
        email = matches[0]
        local, sep, domain = email.partition('@')
        if sep and domain.lower().startswith("gmail") and domain.lower() != "gmail.com":
            # Normalize the domain to 'gmail.com'
            email = f"{local}@gmail.com"
        return email
    return None
def parse_pdf(file: UploadFile) -> str:
    """
    Parse the text content from a PDF file using pdfplumber.
    """
    try:
        file_content = file.file.read()
        pdf_text = ""
        with pdfplumber.open(BytesIO(file_content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    pdf_text += page_text + "\n"
        return pdf_text
    except Exception as e:
        raise ValueError(f"Error parsing PDF file: {str(e)}")

def parse_doc(file: UploadFile) -> str:
    """
    Parse the text content from a DOC or DOCX file.
    Determines the file type and calls the appropriate parsing function.
    """
    if file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return parse_docx(file)
    elif file.content_type == "application/msword":
        return parse_doc_file(file)
    else:
        raise ValueError("Unsupported file format for parsing.")

def parse_docx(file: UploadFile) -> str:
    """
    Parse the text content from a DOCX file using python-docx.
    This version extracts text from both paragraphs and tables.
    """
    try:
        file_content = file.file.read()  # Read the file content into memory
        document = Document(BytesIO(file_content))
        full_text = []
        
        # Extract text from paragraphs
        for para in document.paragraphs:
            full_text.append(para.text)
        
        # Extract text from tables
        for table in document.tables:
            for row in table.rows:
                for cell in row.cells:
                    full_text.append(cell.text)
        
        return "\n".join(full_text)
    except Exception as e:
        raise ValueError(f"Error parsing DOCX file: {str(e)}")

def parse_doc_file(file: UploadFile) -> str:
    """
    Parse the text content from a DOC file using textract.
    """
    try:
        text = textract.process(file.file)
        return text.decode("utf-8")
    except Exception as e:
        raise ValueError(f"Error parsing DOC file: {str(e)}")

def ocr_pdf(file: UploadFile) -> str:
    """
    Perform OCR on a PDF file to extract text from scanned pages.
    """
    try:
        file_content = file.file.read()
        images = convert_from_bytes(file_content)
        ocr_text = ""
        for image in images:
            ocr_text += pytesseract.image_to_string(image) + "\n"
        return ocr_text
    except Exception as e:
        raise ValueError(f"Error during OCR extraction: {str(e)}")
