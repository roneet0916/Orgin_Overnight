from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc
from typing import Dict, Any, List, Optional
from backend.models.claim import ClaimModel, AnomalyModel

class ClaimService:
    @staticmethod
    def get_claims(
        db: Session,
        search: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        status: Optional[str] = None,
        risk: Optional[str] = None,
        anomaly_type: Optional[str] = None,
        sort_by: str = "id",
        order: str = "desc",
        page: int = 1,
        limit: int = 50
    ) -> Dict[str, Any]:
        query = db.query(ClaimModel)

        # Filters
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    ClaimModel.claim_id.ilike(search_pattern),
                    ClaimModel.applicant_name.ilike(search_pattern),
                    ClaimModel.state.ilike(search_pattern),
                    ClaimModel.district.ilike(search_pattern),
                    ClaimModel.village.ilike(search_pattern)
                )
            )

        if state and state != "All":
            query = query.filter(ClaimModel.state == state)

        if district and district != "All":
            query = query.filter(ClaimModel.district == district)

        if status and status != "All":
            query = query.filter(ClaimModel.status == status)

        # Join anomalies if risk or anomaly_type filter applied
        if (risk and risk != "All") or (anomaly_type and anomaly_type != "All"):
            query = query.join(AnomalyModel, ClaimModel.claim_id == AnomalyModel.claim_id)
            if risk and risk != "All":
                query = query.filter(AnomalyModel.severity == risk.upper())
            if anomaly_type and anomaly_type != "All":
                query = query.filter(AnomalyModel.anomaly_type == anomaly_type)

        query = query.distinct()

        total = query.count()

        # Sorting
        sort_column = getattr(ClaimModel, sort_by, ClaimModel.id)
        if order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Pagination
        offset = (page - 1) * limit
        claims = query.offset(offset).limit(limit).all()

        # Transform result to dicts with attached anomaly summaries
        result_claims = []
        for c in claims:
            anomalies = db.query(AnomalyModel).filter(AnomalyModel.claim_id == c.claim_id).all()
            anomaly_list = [
                {
                    "anomaly_type": a.anomaly_type,
                    "severity": a.severity,
                    "risk_score": a.risk_score,
                    "reason": a.reason
                }
                for a in anomalies
            ]
            
            # Max risk score
            max_risk = max([a.risk_score for a in anomalies], default=0)
            highest_sev = "LOW"
            if max_risk >= 71:
                highest_sev = "HIGH"
            elif max_risk >= 31:
                highest_sev = "MEDIUM"

            result_claims.append({
                "id": c.id,
                "claim_id": c.claim_id,
                "applicant_name": c.applicant_name,
                "state": c.state,
                "district": c.district,
                "village": c.village,
                "claim_type": c.claim_type,
                "claimed_area": c.claimed_area,
                "recorded_area": c.recorded_area,
                "submission_date": c.submission_date,
                "status": c.status,
                "days_pending": c.days_pending,
                "latitude": c.latitude,
                "longitude": c.longitude,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "anomalies": anomaly_list,
                "risk_score": max_risk,
                "risk_level": highest_sev,
                "has_anomaly": len(anomaly_list) > 0
            })

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if limit > 0 else 1,
            "claims": result_claims
        }

    @staticmethod
    def get_claim_by_id(db: Session, claim_id: str) -> Optional[Dict[str, Any]]:
        c = db.query(ClaimModel).filter(
            or_(ClaimModel.claim_id == claim_id, ClaimModel.id == claim_id if claim_id.isdigit() else False)
        ).first()

        if not c:
            return None

        anomalies = db.query(AnomalyModel).filter(AnomalyModel.claim_id == c.claim_id).all()
        anomaly_list = [
            {
                "id": a.id,
                "anomaly_type": a.anomaly_type,
                "severity": a.severity,
                "risk_score": a.risk_score,
                "reason": a.reason,
                "detected_at": a.detected_at.isoformat() if a.detected_at else None
            }
            for a in anomalies
        ]

        from backend.ai.ai_summary import generate_ai_explanation
        claim_dict = {
            "id": c.id,
            "claim_id": c.claim_id,
            "applicant_name": c.applicant_name,
            "state": c.state,
            "district": c.district,
            "village": c.village,
            "claim_type": c.claim_type,
            "claimed_area": c.claimed_area,
            "recorded_area": c.recorded_area,
            "submission_date": c.submission_date,
            "status": c.status,
            "days_pending": c.days_pending,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }

        explanation = generate_ai_explanation(claim_dict, anomaly_list)
        max_risk = max([a.risk_score for a in anomalies], default=0)
        highest_sev = "LOW"
        if max_risk >= 71:
            highest_sev = "HIGH"
        elif max_risk >= 31:
            highest_sev = "MEDIUM"

        return {
            **claim_dict,
            "anomalies": anomaly_list,
            "risk_score": max_risk,
            "risk_level": highest_sev,
            "ai_explanation": explanation,
            "has_anomaly": len(anomaly_list) > 0
        }
