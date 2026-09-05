import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_api_districts():
    response = client.get("/api/districts")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 8
    assert len(data["districts"]) == 8
    names = [d["district_name"] for d in data["districts"]]
    assert "Bhopal" in names
    assert "Sehore" in names


def test_approval_rate_color_logic():
    response = client.get("/api/districts")
    districts = {d["district_name"]: d for d in response.json()["districts"]}

    bhopal = districts["Bhopal"]
    assert bhopal["claims_approved"] / bhopal["claims_filed"] * 100 == 50.0
    assert bhopal["anomaly"] is False

    burhanpur = districts["Burhanpur"]
    assert burhanpur["anomaly"] is True

    dewas = districts["Dewas"]
    assert dewas["claims_approved"] / dewas["claims_filed"] * 100 == 100.0
    assert dewas["anomaly"] is False

    raisen = districts["Raisen"]
    assert raisen["anomaly"] is True


def test_anomalies_endpoint():
    response = client.get("/api/anomalies")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 2
    names = [a["district_name"] for a in data["anomalies"]]
    assert "Burhanpur" in names
    assert "Raisen" in names


def test_summary_endpoint():
    response = client.get("/api/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["state_count"] >= 1
    assert len(data["summary"]) >= 1
    assert "total_claims_filed" in data["summary"][0]


def test_ai_summary():
    response = client.get("/api/ai-summary/Bhopal")
    assert response.status_code == 200
    data = response.json()
    assert data["district"] == "Bhopal"
    assert "ai_summary" in data
    assert len(data["ai_summary"]) > 0


def test_ai_summary_not_found():
    response = client.get("/api/ai-summary/UnknownDistrict")
    assert response.status_code == 404


def test_ai_summary_alias():
    response = client.get("/api/ai-summary/East%20Nimar")
    assert response.status_code == 200
    assert response.json()["district"] == "Khandwa"


def test_land_patches():
    response = client.get("/api/land-patches")
    assert response.status_code == 200
    data = response.json()
    assert "land_patches" in data
    assert len(data["land_patches"]) >= 1
    patch = data["land_patches"][0]
    assert "claim_id" in patch
    assert "coordinates" in patch


def test_null_anomaly_reason():
    response = client.get("/api/districts")
    bhopal = next(d for d in response.json()["districts"] if d["district_name"] == "Bhopal")
    assert bhopal["anomaly_reason"] is None
