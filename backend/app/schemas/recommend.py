from __future__ import annotations

from pydantic import BaseModel, Field


class RecommendRequest(BaseModel):
    N: float = Field(ge=0, le=200, description="Nitrogen in soil")
    P: float = Field(ge=0, le=150, description="Phosphorus in soil")
    K: float = Field(ge=0, le=200, description="Potassium in soil")
    temperature: float = Field(ge=-10, le=60, description="Temperature (°C)")
    humidity: float = Field(ge=0, le=100, description="Relative humidity (%)")
    ph: float = Field(ge=3, le=10, description="Soil pH")
    rainfall: float = Field(ge=0, le=600, description="Rainfall (mm)")
    top_n: int = Field(default=3, ge=1, le=15)


class CropRecommendation(BaseModel):
    crop: str
    display: str
    probability: float
    confidence: str  # high | medium | low
    yield_available: bool
    rotation_available: bool


class RecommendResponse(BaseModel):
    recommendations: list[CropRecommendation]
    model_version: str
