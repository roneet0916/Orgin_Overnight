from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional
import csv
import io
from backend.services.statistics_service import StatisticsService
from backend.services.claim_service import ClaimService
from backend.services.anomaly_service import AnomalyService

router = APIRouter(prefix="/api", tags=["Dashboard & Reports"])

def get_db():
    from backend.app import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    return StatisticsService.get_dashboard_stats(db)

@router.get("/dashboard/states")
def get_state_stats(db: Session = Depends(get_db)):
    return StatisticsService.get_state_statistics(db)

@router.get("/dashboard/districts")
def get_district_stats(state: Optional[str] = Query(None), db: Session = Depends(get_db)):
    return StatisticsService.get_district_statistics(db, state_name=state)

@router.get("/reports/claims")
def export_claims_csv(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    claims_data = ClaimService.get_claims(db, state=state, district=district, status=status, limit=5000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Claim ID", "Applicant Name", "State", "District", "Village",
        "Claim Type", "Claimed Area (ha)", "Recorded Area (ha)", "Submission Date",
        "Status", "Days Pending", "Risk Score", "Risk Level", "Anomalies Count"
    ])

    for c in claims_data["claims"]:
        writer.writerow([
            c["claim_id"], c["applicant_name"], c["state"], c["district"], c["village"],
            c["claim_type"], c["claimed_area"], c["recorded_area"], c["submission_date"],
            c["status"], c["days_pending"], c["risk_score"], c["risk_level"], len(c["anomalies"])
        ])

    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=fra_claims_report.csv"
    return response

@router.get("/reports/anomalies")
def export_anomalies_csv(
    severity: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    anomalies_data = AnomalyService.get_anomalies(db, severity=severity, state=state, limit=5000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Anomaly ID", "Claim ID", "Applicant Name", "State", "District",
        "Village", "Anomaly Type", "Severity", "Risk Score", "Reason", "Status", "Days Pending"
    ])

    for a in anomalies_data:
        writer.writerow([
            a["id"], a["claim_id"], a["applicant_name"], a["state"], a["district"],
            a["village"], a["anomaly_type"], a["severity"], a["risk_score"],
            a["reason"], a["status"], a["days_pending"]
        ])

    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=fra_anomalies_report.csv"
    return response
