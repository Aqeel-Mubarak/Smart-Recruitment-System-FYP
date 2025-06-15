# Import required libraries for file handling and text processing
from fastapi import UploadFile
from docx import Document
from io import BytesIO
import pdfplumber
import textract
import re
from typing import Optional

# Import libraries for OCR (Optical Character Recognition) functionality
import pytesseract
from pdf2image import convert_from_bytes

def extract_email(text: str) -> Optional[str]:
    """
    Extract email address from the given text using regular expressions.
    If an extracted email has a gmail domain that isn't exactly 'gmail.com',
    it is normalized to use 'gmail.com'.
    Returns None if no email is found.
    """
    # Clean the text by replacing multiple whitespaces with a single space
    cleaned_text = re.sub(r'\s+', ' ', text)
    # Regular expression pattern to match email addresses
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    matches = re.findall(email_pattern, cleaned_text)
    
    if matches:
        email = matches[0]
        # Split email into local part and domain
        local, sep, domain = email.partition('@')
        # Normalize Gmail domains to 'gmail.com'
        if sep and domain.lower().startswith("gmail") and domain.lower() != "gmail.com":
            email = f"{local}@gmail.com"
        return email
    return None

def parse_pdf(file: UploadFile) -> str:
    """
    Parse the text content from a PDF file using pdfplumber.
    This function handles both text-based and scanned PDFs.
    """
    try:
        # Read the file content into memory
        file_content = file.file.read()
        pdf_text = ""
        # Open PDF using pdfplumber and extract text from each page
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
    This is a router function that determines the file type and calls the appropriate parser.
    """
    # Check file type and route to appropriate parser
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
        # Read the file content into memory
        file_content = file.file.read()
        # Create a Document object from the file content
        document = Document(BytesIO(file_content))
        full_text = []
        
        # Extract text from all paragraphs in the document
        for para in document.paragraphs:
            full_text.append(para.text)
        
        # Extract text from all tables in the document
        for table in document.tables:
            for row in table.rows:
                for cell in row.cells:
                    full_text.append(cell.text)
        
        # Join all extracted text with newlines
        return "\n".join(full_text)
    except Exception as e:
        raise ValueError(f"Error parsing DOCX file: {str(e)}")

def parse_doc_file(file: UploadFile) -> str:
    """
    Parse the text content from a DOC file using textract.
    This function handles older .doc format files.
    """
    try:
        # Use textract to extract text from the DOC file
        text = textract.process(file.file)
        # Decode the extracted text from bytes to string
        return text.decode("utf-8")
    except Exception as e:
        raise ValueError(f"Error parsing DOC file: {str(e)}")

def ocr_pdf(file: UploadFile) -> str:
    """
    Perform OCR on a PDF file to extract text from scanned pages.
    This function is used when the PDF contains scanned images that need OCR processing.
    """
    try:
        # Read the file content into memory
        file_content = file.file.read()
        # Convert PDF pages to images
        images = convert_from_bytes(file_content)
        ocr_text = ""
        # Process each page with OCR
        for image in images:
            ocr_text += pytesseract.image_to_string(image) + "\n"
        return ocr_text
    except Exception as e:
        raise ValueError(f"Error during OCR extraction: {str(e)}")
