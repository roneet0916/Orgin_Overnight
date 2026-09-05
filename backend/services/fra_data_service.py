import json
from pathlib import Path
from typing import Any, Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def _load_json(filename: str) -> Dict[str, Any]:
    path = DATA_DIR / filename
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _normalize_name(name: str) -> str:
    if not name:
        return ""
    normalized = name.strip().lower()
    aliases = {
        "east nimar": "khandwa",
        "west nimar": "khargone",
        "nimar": "khandwa",
    }
    return aliases.get(normalized, normalized)


def get_districts() -> Dict[str, Any]:
    return _load_json("districts.json")


def get_district_by_name(district_name: str) -> Optional[Dict[str, Any]]:
    data = get_districts()
    target = _normalize_name(district_name)
    for district in data.get("districts", []):
        if _normalize_name(district.get("district_name", "")) == target:
            return district
    return None


def get_anomalies() -> Dict[str, Any]:
    data = get_districts()
    flagged = [d for d in data.get("districts", []) if d.get("anomaly")]
    return {"count": len(flagged), "anomalies": flagged}


def get_summary() -> Dict[str, Any]:
    data = get_districts()
    districts = data.get("districts", [])
    if not districts:
        return {"state_count": 0, "summary": []}

    states: Dict[str, List[Dict[str, Any]]] = {}
    for d in districts:
        states.setdefault(d["state"], []).append(d)

    summary = []
    for state, state_districts in states.items():
        filed = sum(d["claims_filed"] for d in state_districts)
        approved = sum(d["claims_approved"] for d in state_districts)
        pending = sum(d["claims_pending"] for d in state_districts)
        rejected = sum(d["claims_rejected"] for d in state_districts)
        land_area = sum(d["land_area_ha"] for d in state_districts)
        anomaly_count = sum(1 for d in state_districts if d.get("anomaly"))
        high_risk = sum(d["high_risk_claims"] for d in state_districts)
        avg_pending = (
            sum(d["pending_days_avg"] for d in state_districts) / len(state_districts)
            if state_districts
            else 0.0
        )
        approval_rate = (approved / filed * 100) if filed > 0 else 0.0

        summary.append(
            {
                "state": state,
                "district_count": len(state_districts),
                "total_claims_filed": filed,
                "total_claims_approved": approved,
                "total_claims_pending": pending,
                "total_claims_rejected": rejected,
                "total_land_area_ha": round(land_area, 1),
                "anomaly_count": anomaly_count,
                "high_risk_claim_count": high_risk,
                "avg_pending_days": round(avg_pending, 1),
                "approval_rate_pct": round(approval_rate, 1),
            }
        )

    return {"state_count": len(summary), "summary": summary}


def generate_ai_summary(district_name: str) -> Dict[str, Any]:
    district = get_district_by_name(district_name)
    if not district:
        return {
            "district": district_name,
            "state": "Unknown",
            "anomaly": False,
            "anomaly_reason": None,
            "ai_summary": f"District '{district_name}' was not found in the monitoring dataset.",
        }

    name = district["district_name"]
    state = district["state"]
    filed = district["claims_filed"]
    approved = district["claims_approved"]
    pending = district["claims_pending"]
    rejected = district["claims_rejected"]
    approval_rate = (approved / filed * 100) if filed > 0 else 0.0
    anomaly = district.get("anomaly", False)
    reason = district.get("anomaly_reason")

    if anomaly:
        summary = (
            f"{name}, {state} requires attention. "
            f"Approval rate is {approval_rate:.1f}% ({approved}/{filed} claims). "
            f"Anomaly detected: {reason or 'Flagged by monitoring rules'}. "
            f"Average pending days: {district['pending_days_avg']:.0f}. "
            f"High-risk claims: {district['high_risk_claims']}. "
            f"Recommended action: prioritize field verification and boundary reconciliation."
        )
    else:
        if approval_rate >= 60:
            status = "healthy approval progress"
        elif approval_rate >= 20:
            status = "moderate approval progress with backlog"
        else:
            status = "low approval rate requiring review"

        summary = (
            f"{name}, {state} shows {status} under current monitoring rules. "
            f"Approval rate: {approval_rate:.1f}% ({approved}/{filed}). "
            f"Pending: {pending}, Rejected: {rejected}. "
            f"Average evidence score: {district['avg_evidence_score']:.1f}%. "
            f"No immediate intervention needed unless field conditions change."
        )

    return {
        "district": name,
        "state": state,
        "anomaly": anomaly,
        "anomaly_reason": reason,
        "ai_summary": summary,
    }


def get_land_patches() -> Dict[str, Any]:
    return _load_json("land_patches.json")
