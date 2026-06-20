from __future__ import annotations

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    version: str
    n_crops_recommendation: int
    n_crops_yield: int


class CropInfo(BaseModel):
    crop: str
    display: str
    yield_available: bool
    rotation_available: bool


class FeatureRange(BaseModel):
    feature: str
    min: float
    max: float
    unit: str


class ErrorResponse(BaseModel):
    error: str
