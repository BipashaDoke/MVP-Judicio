"""
JUDICIO - Smart Court Order Intelligence System
Pydantic Models/Schemas
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str


class Party(BaseModel):
    """Party information"""
    petitioner: Optional[str] = None
    respondent: Optional[str] = None


class ImportantDate(BaseModel):
    """Important date with description"""
    date: str
    description: str


class LegalMetadata(BaseModel):
    """Legal metadata extracted from court order"""
    case_number: Optional[str] = Field(None, description="Unique case identifier")
    parties: Optional[Party] = Field(default_factory=Party, description="Petitioner and respondent")
    judgment_outcome: Optional[str] = Field(None, description="Outcome of the judgment")
    important_dates: List[ImportantDate] = Field(default_factory=list, description="Key dates in the case")
    legal_directions: List[str] = Field(default_factory=list, description="Directions given by the court")
    risk_tags: List[str] = Field(default_factory=list, description="Risk assessment tags")


class Summary(BaseModel):
    """Summary in different languages"""
    english: Optional[str] = None
    hindi: Optional[str] = None
    marathi: Optional[str] = None


class AnalysisResponse(BaseModel):
    """Main analysis response from the API"""
    success: bool = True
    message: str = "Analysis completed successfully"
    detected_language: str
    metadata: LegalMetadata
    professional_summary: Summary
    citizen_explanation: Summary
    raw_response: Optional[Dict[str, Any]] = None
    processing_time: Optional[float] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ErrorResponse(BaseModel):
    """Error response"""
    success: bool = False
    error: str
    detail: Optional[str] = None


class UploadResponse(BaseModel):
    """File upload response"""
    success: bool
    message: str
    filename: Optional[str] = None
    file_size: Optional[int] = None
