"""
JUDICIO - Validators
File and environment validation utilities
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def validate_environment():
    """Validate that required environment variables are set"""
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        print("WARNING: GEMINI_API_KEY not set. AI features will not work.")
    return True

def validate_pdf_file(file_content: bytes) -> bool:
    """
    Validate that the file content is a valid PDF
    
    Args:
        file_content: PDF file as bytes
        
    Returns:
        True if valid
        
    Raises:
        ValueError: If PDF is invalid
    """
    # Check PDF magic bytes
    if len(file_content) < 5:
        raise ValueError("File too small to be a valid PDF")
    
    # Check PDF header
    pdf_header = file_content[:5]
    if pdf_header != b'%PDF-':
        raise ValueError("Invalid PDF file. File does not start with PDF header.")
    
    return True

def validate_file_size(file_content: bytes, max_size_mb: int = 10) -> bool:
    """
    Validate file size
    
    Args:
        file_content: File as bytes
        max_size_mb: Maximum size in MB
        
    Returns:
        True if valid
        
    Raises:
        ValueError: If file is too large
    """
    max_bytes = max_size_mb * 1024 * 1024
    if len(file_content) > max_bytes:
        raise ValueError(f"File too large. Maximum size is {max_size_mb}MB.")
    return True
