import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app import app as _app

client = TestClient(_app)

def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_claims"] == 1000
    assert data["approved"] > 0
    assert data["pending"] > 0
    assert data["rejected"] > 0
    assert data["anomalies"] > 0

def test_dashboard_states():
    response = client.get("/api/dashboard/states")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5  # 5 states in mock data

def test_dashboard_districts():
    response = client.get("/api/dashboard/districts?state=Madhya Pradesh")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(d["district"] == "Dhar" for d in data)

def test_maps_districts_geojson():
    response = client.get("/api/maps/districts")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) > 0
