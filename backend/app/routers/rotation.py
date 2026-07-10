from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.rotation import RotationRequest, RotationResponse
from app.services.rotation_service import UnknownCrop, plan_rotation

router = APIRouter(prefix="/api", tags=["rotation"])


@router.post("/rotation", response_model=RotationResponse)
def plan_rotation_route(req: RotationRequest) -> RotationResponse:
    try:
        return plan_rotation(req)
    except UnknownCrop:
        raise HTTPException(
            status_code=404,
            detail=f"No rotation data for crop '{req.current_crop}'.",
        )
