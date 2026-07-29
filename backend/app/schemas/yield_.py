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


# --- Nutrient/weather-based yield estimate (agronomy response model) ---

class YieldEstimateRequest(BaseModel):
    crop: str
    N: float = Field(ge=0)
    P: float = Field(ge=0)
    K: float = Field(ge=0)
    ph: float = Field(ge=0, le=14)
    temperature: float
    humidity: float = Field(ge=0, le=100)
    rainfall: float = Field(ge=0)


class YieldFactor(BaseModel):
    name: str  # N | P | K | temperature | humidity | ph | rainfall
    value: float
    optimum: float
    adequacy: float  # 0..1
    status: str  # low | ideal | high
    limiting: bool


class YieldSensitivityPoint(BaseModel):
    value: float
    yield_t_per_ha: float


class YieldSensitivity(BaseModel):
    feature: str
    points: list[YieldSensitivityPoint]
    optimum: float
    current: float


class YieldEstimateResponse(BaseModel):
    available: bool
    crop: str
    display: str
    # Present when available:
    estimated_t_per_ha: float | None = None
    estimated_kg_per_ha: float | None = None
    attainable_t_per_ha: float | None = None
    overall_adequacy: float | None = None  # 0..1
    factors: list[YieldFactor] | None = None
    most_limiting: str | None = None
    sensitivities: list[YieldSensitivity] | None = None
    note: str | None = None  # estimate disclaimer, or the unavailable message
