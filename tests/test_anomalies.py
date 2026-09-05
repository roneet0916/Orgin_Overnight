import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app import app as _app
from backend.ai.anomaly_detector import AnomalyDetector

client = TestClient(_app)

def test_anomaly_detector_land_mismatch():
    detector = AnomalyDetector(land_mismatch_percent=20.0)
    claim = {
        "claim_id": "TEST-MISMATCH",
        "applicant_name": "Test User",
        "claimed_area": 12.4,
        "recorded_area": 7.8,
        "days_pending": 10,
        "status": "Pending"
    }
    anomalies = detector.analyze_claim(claim)
    assert len(anomalies) >= 1
    assert any(a["anomaly_type"] == "Land Record Mismatch" for a in anomalies)

def test_anomaly_detector_delayed_claim():
    detector = AnomalyDetector(delayed_threshold_days=180)
    claim = {
        "claim_id": "TEST-DELAYED",
        "applicant_name": "Test User",
        "claimed_area": 5.0,
        "recorded_area": 5.0,
        "days_pending": 245,
        "status": "Pending"
    }
    anomalies = detector.analyze_claim(claim, district_avg_days=60.0)
    assert len(anomalies) >= 1
    assert any(a["anomaly_type"] == "Delayed Claim" for a in anomalies)

def test_get_anomalies_api():
    response = client.get("/api/claim-anomalies?limit=20")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_analyze_claim_endpoint():
    response = client.post("/api/analyze/FRA-1025")
    assert response.status_code == 200
    data = response.json()
    assert data["claim_id"] == "FRA-1025"
    assert data["anomalies_detected"] >= 1
