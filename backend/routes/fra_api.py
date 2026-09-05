from fastapi import APIRouter, HTTPException
from backend.models.fra_schemas import (
    AISummaryResponse,
    AnomaliesResponse,
    DistrictsResponse,
    LandPatchesResponse,
    SummaryResponse,
)
from backend.services.fra_data_service import (
    generate_ai_summary,
    get_anomalies,
    get_district_by_name,
    get_districts,
    get_land_patches,
    get_summary,
)

router = APIRouter(prefix="/api", tags=["FRA Monitoring API"])


@router.get("/districts", response_model=DistrictsResponse)
def list_districts():
    data = get_districts()
    if not data.get("districts"):
        raise HTTPException(status_code=503, detail="District data unavailable")
    return data


@router.get("/anomalies", response_model=AnomaliesResponse)
def list_anomalies():
    return get_anomalies()


@router.get("/summary", response_model=SummaryResponse)
def state_summary():
    return get_summary()


@router.get("/ai-summary/{district}", response_model=AISummaryResponse)
def ai_summary(district: str):
    if not get_district_by_name(district):
        raise HTTPException(status_code=404, detail=f"District '{district}' not found")
    return generate_ai_summary(district)


@router.get("/land-patches", response_model=LandPatchesResponse)
def land_patches():
    data = get_land_patches()
    if not data.get("land_patches"):
        raise HTTPException(status_code=503, detail="Land patch demo data unavailable")
    return data
