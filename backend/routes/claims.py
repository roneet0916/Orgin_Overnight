from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.services.claim_service import ClaimService
from backend.services.anomaly_service import AnomalyService
from backend.models.claim import Base

router = APIRouter(prefix="/api", tags=["Claims"])

def get_db():
    from backend.app import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/claims")
def get_claims(
    search: Optional[str] = Query(None, description="Search term for ID, applicant, village, district, state"),
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    status: Optional[str] = Query(None, description="Filter by status (Approved, Pending, Rejected)"),
    risk: Optional[str] = Query(None, description="Filter by risk severity (HIGH, MEDIUM, LOW)"),
    anomaly_type: Optional[str] = Query(None, description="Filter by anomaly type"),
    sort_by: str = Query("id", description="Field to sort by"),
    order: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    return ClaimService.get_claims(
        db, search=search, state=state, district=district, status=status,
        risk=risk, anomaly_type=anomaly_type, sort_by=sort_by, order=order, page=page, limit=limit
    )

@router.get("/claims/{claim_id}")
def get_claim_details(claim_id: str, db: Session = Depends(get_db)):
    claim = ClaimService.get_claim_by_id(db, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found.")
    return claim

@router.post("/analyze/{claim_id}")
def analyze_claim(claim_id: str, db: Session = Depends(get_db)):
    result = AnomalyService.analyze_and_update_claim(db, claim_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
