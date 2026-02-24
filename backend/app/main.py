"""
JUDICIO - Smart Court Order Intelligence System
Main FastAPI Application
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import tempfile
import logging

from app.routes.upload import router as upload_router
from app.models.schemas import HealthResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS origins
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*",  # For production, replace with actual domain
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    logger.info("JUDICIO API Starting up...")
    logger.info("Initializing services...")
    yield
    logger.info("JUDICIO API Shutting down...")

# Create FastAPI app
app = FastAPI(
    title="JUDICIO API",
    description="Smart Court Order Intelligence System - AI-powered legal document analysis",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router, prefix="/api", tags=["Upload"])

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint"""
    return HealthResponse(
        status="healthy",
        service="JUDICIO API",
        version="1.0.0"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="JUDICIO API",
        version="1.0.0"
    )

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred"}
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
