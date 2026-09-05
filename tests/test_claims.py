import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "simulated data" in data["disclaimer"].lower()

def test_get_claims():
    response = client.get("/api/claims?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "claims" in data
    assert len(data["claims"]) <= 10
    assert data["total"] >= 1000

def test_get_specific_claim_fra_1001():
    response = client.get("/api/claims/FRA-1001")
    assert response.status_code == 200
    data = response.json()
    assert data["claim_id"] == "FRA-1001"
    assert data["applicant_name"] == "Ramesh Kumar"
    assert data["district"] == "Dhar"
    assert data["status"] == "Approved"

def test_get_specific_claim_fra_1025():
    response = client.get("/api/claims/FRA-1025")
    assert response.status_code == 200
    data = response.json()
    assert data["claim_id"] == "FRA-1025"
    assert data["applicant_name"] == "Example Applicant"
    assert data["district"] == "Dhar"
    assert data["has_anomaly"] is True
    assert data["risk_level"] in ["HIGH", "MEDIUM"]

def test_search_claim():
    response = client.get("/api/claims?search=Ramesh")
    assert response.status_code == 200
    data = response.json()
    assert any("Ramesh" in c["applicant_name"] for c in data["claims"])

def test_invalid_claim_id():
    response = client.get("/api/claims/FRA-9999999")
    assert response.status_code == 404
