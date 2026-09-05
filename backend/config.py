import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Database configuration
DATABASE_DIR = BASE_DIR / "database"
DATABASE_DIR.mkdir(exist_ok=True)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_DIR / 'fra.db'}")

# CORS configuration
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5500",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "*"
]

# AI Anomaly Engine Thresholds
DELAYED_CLAIM_THRESHOLD_DAYS = int(os.getenv("DELAYED_CLAIM_THRESHOLD_DAYS", "180"))
LAND_MISMATCH_THRESHOLD_PERCENT = float(os.getenv("LAND_MISMATCH_THRESHOLD_PERCENT", "20.0"))

# Optional LLM Config
LLM_API_KEY = os.getenv("LLM_API_KEY", None)
LLM_PROVIDER = os.getenv("LLM_PROVIDER", None)

DISCLAIMER_TEXT = "Demo system using simulated data. Not an official Government of India system."
