"""
JUDICIO - Smart Court Order Intelligence System
PDF Text Extraction Service using pdfplumber
"""

import io
import tempfile
import os
import logging

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

logger = logging.getLogger(__name__)


class PDFExtractorError(Exception):
    """Custom exception for PDF extraction errors"""
    pass


class ExtractedData:
    """Data class to hold extracted PDF information"""
    def __init__(self, text: str = "", total_pages: int = 0, page_count: int = 0, 
                 tables_found: bool = False, characters: int = 0):
        self.text = text
        self.total_pages = total_pages
        self.page_count = page_count
        self.tables_found = tables_found
        self.characters = characters


class PDFExtractor:
    """Service for extracting text from PDF court orders"""
    
    def __init__(self):
        self.max_pages_limit = 50
    
    def extract_text_from_file(self, file_content: bytes) -> ExtractedData:
        """
        Extract text content from PDF file bytes
        
        Args:
            file_content: PDF file as bytes
            
        Returns:
            ExtractedData object containing extracted information
        """
        if pdfplumber is None:
            raise PDFExtractorError("pdfplumber is not installed. Run: pip install pdfplumber")
        
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                total_pages = len(pdf.pages)
                logger.info(f"Processing PDF with {total_pages} pages")
                
                all_text = []
                tables_found = False
                
                pages_to_process = min(total_pages, self.max_pages_limit)
                
                for i in range(pages_to_process):
                    page = pdf.pages[i]
                    text = page.extract_text()
                    
                    if text:
                        all_text.append(text)
                    
                    # Check for tables
                    try:
                        tables = page.extract_tables()
                        if tables and not tables_found:
                            tables_found = True
                    except Exception:
                        pass
                    
                    if (i + 1) % 10 == 0:
                        logger.info(f"Processed {i + 1}/{pages_to_process} pages")
                
                full_text = "\n\n".join(all_text)
                characters = len(full_text)
                
                return ExtractedData(
                    text=full_text,
                    total_pages=total_pages,
                    page_count=len(all_text),
                    tables_found=tables_found,
                    characters=characters
                )
                
        except Exception as e:
            logger.error(f"Error extracting PDF text: {str(e)}")
            raise PDFExtractorError(f"Failed to extract text from PDF: {str(e)}")
    
    def extract_text_from_path(self, pdf_path: str) -> ExtractedData:
        """
        Extract text from a PDF file at the given path
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            ExtractedData object
        """
        try:
            with open(pdf_path, 'rb') as f:
                file_content = f.read()
            return self.extract_text_from_file(file_content)
        except Exception as e:
            logger.error(f"Error reading PDF file: {str(e)}")
            raise PDFExtractorError(f"Failed to read PDF file: {str(e)}")
    
    def extract_and_save(self, file_content: bytes, temp_dir: str = None) -> tuple:
        """
        Extract text and save to a temporary file
        
        Args:
            file_content: PDF bytes
            temp_dir: Optional temporary directory
            
        Returns:
            Tuple of (ExtractedData, temp_file_path)
        """
        extracted = self.extract_text_from_file(file_content)
        
        # Save extracted text to temp file
        if temp_dir is None:
            temp_dir = tempfile.gettempdir()
        
        text_file_path = os.path.join(temp_dir, "extracted_text.txt")
        
        with open(text_file_path, 'w', encoding='utf-8') as f:
            f.write(extracted.text)
        
        logger.info(f"Text saved to: {text_file_path}")
        
        return extracted, text_file_path
