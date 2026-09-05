from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from backend.models.claim import ClaimModel, AnomalyModel
from backend.ai.anomaly_detector import AnomalyDetector

class AnomalyService:
    @staticmethod
    def get_anomalies(
        db: Session,
        severity: Optional[str] = None,
        anomaly_type: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        query = db.query(AnomalyModel).join(ClaimModel, AnomalyModel.claim_id == ClaimModel.claim_id)

        if severity and severity != "All":
            query = query.filter(AnomalyModel.severity == severity.upper())

        if anomaly_type and anomaly_type != "All":
            query = query.filter(AnomalyModel.anomaly_type == anomaly_type)

        if state and state != "All":
            query = query.filter(ClaimModel.state == state)

        if district and district != "All":
            query = query.filter(ClaimModel.district == district)

        anomalies = query.order_by(AnomalyModel.risk_score.desc()).limit(limit).all()

        results = []
        for a in anomalies:
            claim = a.claim_rel
            results.append({
                "id": a.id,
                "claim_id": a.claim_id,
                "applicant_name": claim.applicant_name if claim else "N/A",
                "state": claim.state if claim else "N/A",
                "district": claim.district if claim else "N/A",
                "village": claim.village if claim else "N/A",
                "anomaly_type": a.anomaly_type,
                "severity": a.severity,
                "risk_score": a.risk_score,
                "reason": a.reason,
                "claimed_area": claim.claimed_area if claim else 0.0,
                "recorded_area": claim.recorded_area if claim else 0.0,
                "days_pending": claim.days_pending if claim else 0,
                "status": claim.status if claim else "N/A",
                "detected_at": a.detected_at.isoformat() if a.detected_at else None
            })

        return results

    @staticmethod
    def analyze_and_update_claim(db: Session, claim_id: str) -> Dict[str, Any]:
        """
        Run AI Anomaly Detector on a specific claim, persist detected anomalies to SQLite, and return results.
        """
        claim = db.query(ClaimModel).filter(ClaimModel.claim_id == claim_id).first()
        if not claim:
            return {"error": f"Claim {claim_id} not found."}

        # Calculate district avg days pending
        district_claims = db.query(ClaimModel).filter(
            ClaimModel.district == claim.district,
            ClaimModel.status == "Pending"
        ).all()
        avg_days = 60.0
        if district_claims:
            avg_days = sum(c.days_pending for c in district_claims) / len(district_claims)

        detector = AnomalyDetector()
        claim_dict = {
            "claim_id": claim.claim_id,
            "applicant_name": claim.applicant_name,
            "state": claim.state,
            "district": claim.district,
            "village": claim.village,
            "claimed_area": claim.claimed_area,
            "recorded_area": claim.recorded_area,
            "submission_date": claim.submission_date,
            "status": claim.status,
            "days_pending": claim.days_pending
        }

        detected = detector.analyze_claim(claim_dict, district_avg_days=avg_days)

        # Clear existing anomalies for this claim
        db.query(AnomalyModel).filter(AnomalyModel.claim_id == claim_id).delete()

        # Insert newly detected anomalies
        created_anomalies = []
        for d in detected:
            anom = AnomalyModel(
                claim_id=claim_id,
                anomaly_type=d["anomaly_type"],
                severity=d["severity"],
                risk_score=d["risk_score"],
                reason=d["reason"]
            )
            db.add(anom)
            created_anomalies.append(d)

        db.commit()

        from backend.services.claim_service import ClaimService
        updated_claim = ClaimService.get_claim_by_id(db, claim_id)

        return {
            "claim_id": claim_id,
            "anomalies_detected": len(created_anomalies),
            "anomalies": created_anomalies,
            "updated_claim": updated_claim
        }
