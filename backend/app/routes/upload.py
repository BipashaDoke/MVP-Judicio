"""
JUDICIO - Upload Routes
Handles PDF file uploads and processing
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from app.services.pdf_extractor import PDFExtractor
from app.services.gemini_service import gemini_service
from app.models.schemas import AnalysisResponse
from app.utils.validators import validate_pdf_file
import tempfile
import os
import time

router = APIRouter()

# Initialize extractor singleton for efficiency
_pdf_extractor = None

def get_pdf_extractor():
    """Get or create PDF extractor instance"""
    global _pdf_extractor
    if _pdf_extractor is None:
        _pdf_extractor = PDFExtractor()
    return _pdf_extractor


@router.post("/upload")
async def upload_and_analyze(file: UploadFile = File(...)):
    """
    Upload a PDF court order for AI analysis
    
    - **file**: PDF file containing court order
    
    Returns structured JSON with:
    - Language detected
    - Legal metadata (case number, parties, etc.)
    - Professional summary (multilingual)
    - Citizen-friendly explanation (multilingual)
    """
    start_time = time.time()
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file extension
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only PDF files are accepted."
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Validate file size (max 10MB)
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 10MB."
            )
        
        # Validate PDF
        validate_pdf_file(file_content)
        
        # Extract text from PDF using instance method
        extractor = get_pdf_extractor()
        extracted_data = extractor.extract_text_from_file(file_content)
        extracted_text = extracted_data.text
        
        if not extracted_text or len(extracted_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from PDF. The file might be scanned or image-based."
            )
        
        # Analyze with Gemini AI
        analysis_result = gemini_service.analyze_legal_document(extracted_text)
        
        # Validate response
        if not gemini_service.validate_response(analysis_result):
            raise HTTPException(
                status_code=500,
                detail="AI response validation failed. Please try again."
            )
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Build response - flatten the structure for frontend compatibility
        response_data = {
            "success": True,
            "message": "Document analyzed successfully",
            "language_detected": analysis_result.get("language_detected", "english"),
            "case_number": analysis_result.get("metadata", {}).get("case_number"),
            "parties": analysis_result.get("metadata", {}).get("parties", {}),
            "judgment_outcome": analysis_result.get("metadata", {}).get("judgment_outcome"),
            "important_dates": analysis_result.get("metadata", {}).get("important_dates", []),
            "legal_directions": analysis_result.get("metadata", {}).get("legal_directions", []),
            "risk_tags": analysis_result.get("metadata", {}).get("risk_tags", []),
            "professional_summary": analysis_result.get("summary", {}),
            "citizen_explanation": analysis_result.get("explanation", {}),
            "raw_text_length": len(extracted_text),
            "processing_time": round(processing_time, 2)
        }
        
        return response_data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred while processing the file: {str(e)}"
        )


@router.post("/extract-text")
async def extract_text_only(file: UploadFile = File(...)):
    """
    Extract text from PDF without AI analysis
    Useful for testing PDF extraction
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only PDF files are accepted."
        )
    
    try:
        file_content = await file.read()
        
        # Validate file size
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 10MB."
            )
        
        extractor = get_pdf_extractor()
        extracted_data = extractor.extract_text_from_file(file_content)
        
        return {
            "success": True,
            "filename": file.filename,
            "text_length": len(extracted_data.text),
            "page_count": extracted_data.page_count,
            "text": extracted_data.text[:5000] + "..." if len(extracted_data.text) > 5000 else extracted_data.text
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error extracting text: {str(e)}"
        )
