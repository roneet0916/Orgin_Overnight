from typing import List, Dict, Any, Optional
from backend.config import DELAYED_CLAIM_THRESHOLD_DAYS, LAND_MISMATCH_THRESHOLD_PERCENT

class AnomalyDetector:
    """
    Rule-based and statistical AI Anomaly Engine for Forest Rights Act (FRA) claims.
    Evaluates claims against 5 key anomaly categories:
    1. Delayed Claim
    2. Land Record Mismatch
    3. Missing Information
    4. Duplicate Claim
    5. Unusual Processing Time
    """

    def __init__(self, delayed_threshold_days: int = DELAYED_CLAIM_THRESHOLD_DAYS,
                 land_mismatch_percent: float = LAND_MISMATCH_THRESHOLD_PERCENT):
        self.delayed_threshold_days = delayed_threshold_days
        self.land_mismatch_percent = land_mismatch_percent

    def analyze_claim(self, claim: Dict[str, Any], district_avg_days: Optional[float] = None, all_claim_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Analyze a single claim dictionary and return list of detected anomalies with risk scores and severity.
        """
        detected_anomalies = []

        # 1. ANOMALY: MISSING INFORMATION
        missing_fields = []
        for field in ["applicant_name", "village", "district", "state", "submission_date"]:
            val = claim.get(field)
            if val is None or str(val).strip() == "" or str(val).strip().lower() == "null":
                missing_fields.append(field)
        
        claimed_area = claim.get("claimed_area")
        recorded_area = claim.get("recorded_area")
        if claimed_area is None or claimed_area <= 0:
            missing_fields.append("claimed_area")
        if recorded_area is None or recorded_area <= 0:
            missing_fields.append("recorded_area")

        if missing_fields:
            detected_anomalies.append({
                "anomaly_type": "Missing Information",
                "severity": "HIGH" if len(missing_fields) > 1 else "MEDIUM",
                "risk_score": 85 if len(missing_fields) > 1 else 50,
                "reason": f"Missing critical claim field(s): {', '.join(missing_fields)}"
            })

        # 2. ANOMALY: LAND RECORD MISMATCH
        if claimed_area and recorded_area and claimed_area > 0 and recorded_area > 0:
            diff = abs(claimed_area - recorded_area)
            percentage_diff = (diff / recorded_area) * 100.0
            
            if percentage_diff >= self.land_mismatch_percent:
                if percentage_diff >= 50.0:
                    severity = "HIGH"
                    risk_score = min(95, 75 + int(percentage_diff / 5))
                elif percentage_diff >= 35.0:
                    severity = "MEDIUM"
                    risk_score = 65
                else:
                    severity = "LOW"
                    risk_score = 45

                detected_anomalies.append({
                    "anomaly_type": "Land Record Mismatch",
                    "severity": severity,
                    "risk_score": risk_score,
                    "reason": f"Claimed area ({claimed_area:.2f} ha) differs by {percentage_diff:.1f}% from recorded area ({recorded_area:.2f} ha)."
                })

        # 3. ANOMALY: DELAYED CLAIM
        days_pending = claim.get("days_pending", 0)
        status = claim.get("status", "")
        
        if status == "Pending" and days_pending >= self.delayed_threshold_days:
            avg_ref = district_avg_days if district_avg_days and district_avg_days > 0 else 60
            ratio = days_pending / avg_ref
            
            if days_pending >= 300 or ratio >= 3.5:
                severity = "HIGH"
                risk_score = min(98, 75 + int(days_pending / 15))
            elif days_pending >= 200 or ratio >= 2.0:
                severity = "MEDIUM"
                risk_score = 60
            else:
                severity = "LOW"
                risk_score = 40

            detected_anomalies.append({
                "anomaly_type": "Delayed Claim",
                "severity": severity,
                "risk_score": risk_score,
                "reason": f"Claim pending for {days_pending} days, exceeding standard threshold ({self.delayed_threshold_days} days) and district average ({int(avg_ref)} days)."
            })

        # 4. ANOMALY: DUPLICATE CLAIM
        claim_id = claim.get("claim_id")
        if all_claim_ids and claim_id and all_claim_ids.count(claim_id) > 1:
            detected_anomalies.append({
                "anomaly_type": "Duplicate Claim",
                "severity": "HIGH",
                "risk_score": 90,
                "reason": f"Multiple claims registered with duplicate ID {claim_id}."
            })

        # 5. ANOMALY: UNUSUAL PROCESSING TIME
        if district_avg_days and district_avg_days > 0 and days_pending > 0:
            if days_pending > (district_avg_days * 2.5) and status == "Pending":
                # Ensure we don't duplicate simple delayed claim if severity is distinct
                if not any(a["anomaly_type"] == "Delayed Claim" and a["severity"] == "HIGH" for a in detected_anomalies):
                    detected_anomalies.append({
                        "anomaly_type": "Unusual Processing Time",
                        "severity": "MEDIUM",
                        "risk_score": 55,
                        "reason": f"Processing time ({days_pending} days) is over 2.5x the district average ({int(district_avg_days)} days)."
                    })

        return detected_anomalies
