from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.rotation import RotationResponse
from app.services.rotation_service import UnknownCrop, get_rotation

router = APIRouter(prefix="/api", tags=["rotation"])


@router.get("/rotation/{crop}", response_model=RotationResponse)
def get_rotation_route(crop: str) -> RotationResponse:
    try:
        return get_rotation(crop)
    except UnknownCrop:
        raise HTTPException(
            status_code=404, detail=f"No rotation data for crop '{crop}'."
        )
