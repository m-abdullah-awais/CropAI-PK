from __future__ import annotations

from pydantic import BaseModel, Field


class YieldRequest(BaseModel):
    crop: str
    year: int = Field(ge=1900, le=2100)


class YieldResponse(BaseModel):
    available: bool
    crop: str
    display: str
    # Present when available:
    year: int | None = None
    yield_hg_per_ha: float | None = None
    yield_kg_per_ha: float | None = None
    yield_t_per_ha: float | None = None
    is_forecast: bool | None = None
    trend_per_year: float | None = None
    trend_direction: str | None = None  # rising | falling | stable
    last_real_year: int | None = None
    extrapolation_warning: str | None = None
    model_version: str | None = None
    # Present when NOT available:
    message: str | None = None
    yield_available_crops: list[str] | None = None


class YieldHistoryPoint(BaseModel):
    year: int
    yield_hg_per_ha: float
    yield_t_per_ha: float


class YieldHistoryResponse(BaseModel):
    available: bool
    crop: str
    display: str
    series: list[YieldHistoryPoint]
