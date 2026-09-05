from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.config import DATABASE_URL, CORS_ORIGINS, DISCLAIMER_TEXT
from backend.models.claim import Base
from backend.routes import claims, dashboard, anomalies, maps, fra_api

# Initialize SQLite database engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Auto-create DB tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FRA AI Decision Support System API",
    description="Backend REST API for Forest Rights Act (FRA) Monitoring and AI Anomaly Detection.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FRA Monitoring API (WebGIS dashboard) — register first for route priority
app.include_router(fra_api.router)
app.include_router(claims.router)
app.include_router(dashboard.router)
app.include_router(anomalies.router)
app.include_router(maps.router)

@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "healthy",
        "service": "FRA AI Decision Support System API",
        "disclaimer": DISCLAIMER_TEXT
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "FRA Monitoring API is running",
        "health": "/health",
        "docs": "/docs",
        "endpoints": {
            "districts": "/api/districts",
            "anomalies": "/api/anomalies",
            "summary": "/api/summary",
            "ai_summary": "/api/ai-summary/{district}",
            "land_patches": "/api/land-patches",
        },
        "disclaimer": DISCLAIMER_TEXT,
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "FRA AI Decision Support System API",
        "disclaimer": DISCLAIMER_TEXT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
