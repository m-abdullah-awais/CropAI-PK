from __future__ import annotations

from pydantic import BaseModel, Field


class YieldRequest(BaseModel):
    crop: str
    year: int = Field(ge=1900, le=2100)
    rainfall_mm_per_year: float = Field(ge=0, le=5000)
    avg_temp: float = Field(ge=-20, le=60)
    pesticides_tonnes: float | None = Field(default=None, ge=0)


class YieldResponse(BaseModel):
    available: bool
    crop: str
    display: str
    # Present when available:
    year: int | None = None
    yield_hg_per_ha: float | None = None
    yield_kg_per_ha: float | None = None
    yield_t_per_ha: float | None = None
    pesticides_tonnes: float | None = None
    pesticides_defaulted: bool | None = None
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
