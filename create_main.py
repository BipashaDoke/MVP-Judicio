# This script creates the main.py file

content = '''"""
JUDICIO - Main Application
FastAPI backend for Smart Court Order Intelligence System
"""

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from app.routes.upload import router as upload_router

# Create FastAPI app
app = FastAPI(
    title="JUDICIO - Smart Court Order Intelligence System",
    description="AI-powered legal document analysis platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*",  # Allow all for production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router, prefix="/api", tags=["Analysis"])

# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "message": "JUDICIO API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "JUDICIO Backend",
        "version": "1.0.0"
    }

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc)
        }
    )

# Run with uvicorn
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
'''

with open('backend/app/main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('main.py created successfully')
