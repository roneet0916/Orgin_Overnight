from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from pathlib import Path
from backend.services.statistics_service import StatisticsService
from backend.models.claim import StateModel, DistrictModel

router = APIRouter(prefix="/api", tags=["Maps & GeoJSON"])

def get_db():
    from backend.app import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
GEOJSON_FILE = BASE_DIR / "data" / "districts.geojson"
STATES_FILE = BASE_DIR / "data" / "states.json"

@router.get("/maps/districts")
def get_districts_geojson(db: Session = Depends(get_db)):
    """
    Returns GeoJSON feature collection enriched with real-time database district statistics.
    """
    stats = StatisticsService.get_district_statistics(db)
    stats_lookup = {s["district"]: s for s in stats}

    if GEOJSON_FILE.exists():
        with open(GEOJSON_FILE, "r", encoding="utf-8") as f:
            geojson = json.load(f)

        # Inject dynamic metrics into GeoJSON feature properties
        for feature in geojson.get("features", []):
            dist_name = feature.get("properties", {}).get("district")
            if dist_name in stats_lookup:
                feature["properties"].update(stats_lookup[dist_name])
            else:
                feature["properties"].update({
                    "total": 0, "approved": 0, "pending": 0, "rejected": 0, "delayed": 0, "anomalies": 0
                })

        return geojson
    else:
        # Fallback dynamic FeatureCollection if file not generated yet
        features = []
        for s in stats:
            features.append({
                "type": "Feature",
                "properties": s,
                "geometry": {
                    "type": "Point",
                    "coordinates": [s["longitude"], s["latitude"]]
                }
            })
        return {
            "type": "FeatureCollection",
            "disclaimer": "Demo system using simulated data. Not an official Government of India system.",
            "features": features
        }

@router.get("/states")
def get_states(db: Session = Depends(get_db)):
    states = db.query(StateModel).all()
    if not states and STATES_FILE.exists():
        with open(STATES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return [{"id": s.id, "name": s.name, "code": s.code} for s in states]

@router.get("/districts/{state_name}")
def get_districts_by_state(state_name: str, db: Session = Depends(get_db)):
    districts = db.query(DistrictModel).join(StateModel).filter(StateModel.name == state_name).all()
    return [{"id": d.id, "name": d.name, "latitude": d.latitude, "longitude": d.longitude} for d in districts]
