from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.services.anomaly_service import AnomalyService

router = APIRouter(prefix="/api", tags=["Anomalies"])

def get_db():
    from backend.app import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/claim-anomalies")
def get_claim_anomalies(
    severity: Optional[str] = Query(None, description="HIGH, MEDIUM, or LOW"),
    anomaly_type: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    return AnomalyService.get_anomalies(
        db, severity=severity, anomaly_type=anomaly_type, state=state, district=district, limit=limit
    )

@router.get("/anomalies/{claim_id}")
def get_claim_anomalies(claim_id: str, db: Session = Depends(get_db)):
    anomalies = AnomalyService.get_anomalies(db, limit=100)
    filtered = [a for a in anomalies if a["claim_id"] == claim_id]
    return filtered
