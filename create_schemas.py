# This script creates the schemas.py file

content = '''"""
JUDICIO - Pydantic Models
Request and response schemas for the API
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class MetadataSchema(BaseModel):
    """Schema for extracted legal metadata"""
    case_number: Optional[str] = None
    parties: Optional[List[str]] = None
    judgment_outcome: Optional[str] = None
    important_dates: Optional[List[str]] = None
    legal_directions: Optional[List[str]] = None
    risk_tags: Optional[List[str]] = None

class SummarySchema(BaseModel):
    """Schema for multilingual summaries"""
    english: Optional[str] = None
    hindi: Optional[str] = None
    marathi: Optional[str] = None

class ExplanationSchema(BaseModel):
    """Schema for citizen-friendly explanations"""
    english: Optional[str] = None
    hindi: Optional[str] = None
    marathi: Optional[str] = None

class LegalAnalysisResponse(BaseModel):
    """Response model for legal document analysis"""
    success: bool = Field(..., description="Whether the analysis was successful")
    language_detected: str = Field(default="english", description="Detected document language")
    metadata: MetadataSchema = Field(default_factory=MetadataSchema, description="Extracted legal metadata")
    summary: SummarySchema = Field(default_factory=SummarySchema, description="Professional summary in multiple languages")
    explanation: ExplanationSchema = Field(default_factory=ExplanationSchema, description="Citizen-friendly explanation in multiple languages")
    raw_text_length: int = Field(default=0, description="Length of extracted text")
    message: str = Field(default="", description="Status message")

class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = Field(default=False, description="Always false for errors")
    error: str = Field(..., description="Error type")
    detail: Optional[str] = Field(None, description="Detailed error message")

class UploadResponse(BaseModel):
    """Response for file upload"""
    success: bool
    message: str
    filename: Optional[str] = None
    file_size: Optional[int] = None

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
'''

with open('backend/app/models/schemas.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('schemas.py created successfully')
