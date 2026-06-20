from __future__ import annotations

from pydantic import BaseModel


class NextCrop(BaseModel):
    crop: str
    display: str
    nitrogen_role: str | None = None
    yield_available: bool


class RotationResponse(BaseModel):
    crop: str
    display: str
    family: str
    season: str
    nitrogen_role: str
    recommended_next: list[NextCrop]
    avoid_next: list[NextCrop]
    notes: str
