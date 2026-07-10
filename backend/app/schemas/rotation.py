from __future__ import annotations

from pydantic import BaseModel, Field


class RotationRequest(BaseModel):
    """Current crop is required; soil/climate are optional (defaults come from the
    crop's real average profile when a field is left blank)."""

    current_crop: str
    N: float | None = Field(default=None, ge=0, le=200)
    P: float | None = Field(default=None, ge=0, le=150)
    K: float | None = Field(default=None, ge=0, le=200)
    temperature: float | None = Field(default=None, ge=-10, le=60)
    humidity: float | None = Field(default=None, ge=0, le=100)
    ph: float | None = Field(default=None, ge=3, le=10)
    rainfall: float | None = Field(default=None, ge=0, le=600)
    top_n: int = Field(default=4, ge=1, le=10)


class ProjectedSoil(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    soil_estimated: bool  # True when soil values were filled from the crop profile.


class NextCrop(BaseModel):
    crop: str
    display: str
    score: float  # blended rank score, 0..1
    soil_suitability: float  # raw KNN probability on the projected soil, 0..1
    nitrogen_role: str
    note: str  # nitrogen_break | soil_match
    yield_available: bool


class AvoidCrop(BaseModel):
    crop: str
    display: str
    reason: str  # same_family | avoid_pair


class RotationResponse(BaseModel):
    crop: str
    display: str
    family: str
    season: str
    nitrogen_role: str
    is_perennial: bool
    projected_soil: ProjectedSoil
    next_crops: list[NextCrop]
    avoid: list[AvoidCrop]
    notes: str
    model_version: str
