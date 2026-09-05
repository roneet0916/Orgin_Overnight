import uvicorn
import os
import sys
from pathlib import Path

# Add project root to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

if __name__ == "__main__":
    print("Starting FRA AI Decision Support System FastAPI Backend...")
    print("API Base URL: http://127.0.0.1:8000/api")
    print("Health Check: http://127.0.0.1:8000/health")
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)
