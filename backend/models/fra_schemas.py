from pydantic import BaseModel, Field
from typing import List, Optional


class DistrictRecord(BaseModel):
    district_name: str
    state: str
    claims_filed: int
    claims_approved: int
    claims_pending: int
    claims_rejected: int
    pending_days_avg: float
    land_area_ha: float
    high_risk_claims: int
    avg_evidence_score: float
    avg_boundary_confidence: float
    avg_overlap_percent: float
    patches_count: int
    anomaly: bool
    anomaly_reason: Optional[str] = None


class DistrictsResponse(BaseModel):
    count: int
    districts: List[DistrictRecord]


class AnomaliesResponse(BaseModel):
    count: int
    anomalies: List[DistrictRecord]


class StateSummary(BaseModel):
    state: str
    district_count: int
    total_claims_filed: int
    total_claims_approved: int
    total_claims_pending: int
    total_claims_rejected: int
    total_land_area_ha: float
    anomaly_count: int
    high_risk_claim_count: int
    avg_pending_days: float
    approval_rate_pct: float


class SummaryResponse(BaseModel):
    state_count: int
    summary: List[StateSummary]


class AISummaryResponse(BaseModel):
    district: str
    state: str
    anomaly: bool
    anomaly_reason: Optional[str] = None
    ai_summary: str


class LandPatch(BaseModel):
    claim_id: str
    village: str
    district: str
    state: str
    area_hectares: float
    land_type: str
    claim_type: str
    claimant_count: int
    status: str
    risk_level: str
    evidence_type: str
    evidence_score: int
    boundary_confidence: int
    forest_cover_percent: int
    overlap_percent: int
    submission_date: str
    coordinates: List[List[float]]
    overlap_coordinates: Optional[List[List[float]]] = None


class LandPatchesResponse(BaseModel):
    disclaimer: str
    land_patches: List[LandPatch]
