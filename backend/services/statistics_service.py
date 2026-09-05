from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, case
from typing import Dict, Any, List
from backend.models.claim import ClaimModel, AnomalyModel, DistrictModel, StateModel

class StatisticsService:
    @staticmethod
    def get_dashboard_stats(db: Session) -> Dict[str, Any]:
        total_claims = db.query(func.count(ClaimModel.id)).scalar() or 0
        approved_claims = db.query(func.count(ClaimModel.id)).filter(ClaimModel.status == "Approved").scalar() or 0
        pending_claims = db.query(func.count(ClaimModel.id)).filter(ClaimModel.status == "Pending").scalar() or 0
        rejected_claims = db.query(func.count(ClaimModel.id)).filter(ClaimModel.status == "Rejected").scalar() or 0
        
        # Delayed claims (pending & days_pending >= 180)
        delayed_claims = db.query(func.count(ClaimModel.id)).filter(
            ClaimModel.status == "Pending",
            ClaimModel.days_pending >= 180
        ).scalar() or 0

        # Unique claims with anomalies
        anomalous_claims_count = db.query(func.count(distinct(AnomalyModel.claim_id))).scalar() or 0
        total_anomalies_count = db.query(func.count(AnomalyModel.id)).scalar() or 0

        # Recent alerts (top 5 high risk anomalies)
        recent_anomalies = db.query(AnomalyModel).join(ClaimModel).order_by(
            AnomalyModel.risk_score.desc()
        ).limit(6).all()

        recent_alerts = []
        for a in recent_anomalies:
            claim = a.claim_rel
            recent_alerts.append({
                "id": a.id,
                "claim_id": a.claim_id,
                "district": claim.district if claim else "N/A",
                "state": claim.state if claim else "N/A",
                "anomaly_type": a.anomaly_type,
                "severity": a.severity,
                "risk_score": a.risk_score,
                "reason": a.reason
            })

        return {
            "total_claims": total_claims,
            "approved": approved_claims,
            "pending": pending_claims,
            "rejected": rejected_claims,
            "delayed": delayed_claims,
            "anomalies": total_anomalies_count,
            "anomalous_claims": anomalous_claims_count,
            "recent_alerts": recent_alerts,
            "disclaimer": "Demo system using simulated data. Not an official Government of India system."
        }

    @staticmethod
    def get_state_statistics(db: Session) -> List[Dict[str, Any]]:
        state_rows = db.query(
            ClaimModel.state,
            func.count(ClaimModel.id).label("total"),
            func.sum(case((ClaimModel.status == "Approved", 1), else_=0)).label("approved"),
            func.sum(case((ClaimModel.status == "Pending", 1), else_=0)).label("pending"),
            func.sum(case((ClaimModel.status == "Rejected", 1), else_=0)).label("rejected"),
            func.sum(case((ClaimModel.days_pending >= 180, 1), else_=0)).label("delayed")
        ).group_by(ClaimModel.state).all()

        results = []
        for row in state_rows:
            # Count anomalies for this state
            anom_count = db.query(func.count(AnomalyModel.id)).join(
                ClaimModel, AnomalyModel.claim_id == ClaimModel.claim_id
            ).filter(ClaimModel.state == row.state).scalar() or 0

            results.append({
                "state": row.state,
                "total": row.total,
                "approved": row.approved or 0,
                "pending": row.pending or 0,
                "rejected": row.rejected or 0,
                "delayed": row.delayed or 0,
                "anomalies": anom_count
            })

        return results

    @staticmethod
    def get_district_statistics(db: Session, state_name: str = None) -> List[Dict[str, Any]]:
        query = db.query(
            ClaimModel.district,
            ClaimModel.state,
            func.count(ClaimModel.id).label("total"),
            func.sum(case((ClaimModel.status == "Approved", 1), else_=0)).label("approved"),
            func.sum(case((ClaimModel.status == "Pending", 1), else_=0)).label("pending"),
            func.sum(case((ClaimModel.status == "Rejected", 1), else_=0)).label("rejected"),
            func.sum(case((ClaimModel.days_pending >= 180, 1), else_=0)).label("delayed")
        )

        if state_name and state_name != "All":
            query = query.filter(ClaimModel.state == state_name)

        district_rows = query.group_by(ClaimModel.district, ClaimModel.state).all()

        results = []
        for row in district_rows:
            # Get lat/lng from districts table or claim default
            dist_meta = db.query(DistrictModel).filter(DistrictModel.name == row.district).first()
            lat = dist_meta.latitude if dist_meta else 22.0
            lng = dist_meta.longitude if dist_meta else 78.0

            anom_count = db.query(func.count(AnomalyModel.id)).join(
                ClaimModel, AnomalyModel.claim_id == ClaimModel.claim_id
            ).filter(ClaimModel.district == row.district).scalar() or 0

            results.append({
                "district": row.district,
                "state": row.state,
                "latitude": lat,
                "longitude": lng,
                "total": row.total,
                "approved": row.approved or 0,
                "pending": row.pending or 0,
                "rejected": row.rejected or 0,
                "delayed": row.delayed or 0,
                "anomalies": anom_count
            })

        return results
