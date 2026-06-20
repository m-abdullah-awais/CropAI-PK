from __future__ import annotations

from fastapi import APIRouter

from app.crops import (
    ALL_CROPS,
    YIELD_AVAILABLE,
    display_name,
    rotation_available,
    yield_available,
)
from app.ml.data_loaders import load_requirements
from app.registry import registry
from app.schemas.common import CropInfo, FeatureRange

router = APIRouter(prefix="/api", tags=["meta"])

# Feature -> unit, for the frontend hints.
_UNITS = {
    "N": "", "P": "", "K": "", "temperature": "°C",
    "humidity": "%", "ph": "", "rainfall": "mm",
}


@router.get("/crops", response_model=list[CropInfo])
def get_crops() -> list[CropInfo]:
    return [
        CropInfo(
            crop=c,
            display=display_name(c),
            yield_available=yield_available(c),
            rotation_available=rotation_available(c),
        )
        for c in ALL_CROPS
    ]


@router.get("/feature-ranges", response_model=list[FeatureRange])
def get_feature_ranges() -> list[FeatureRange]:
    df = load_requirements()
    out: list[FeatureRange] = []
    # Map requirement columns (e.g. N_min/N_max) to recommendation features.
    pairs = {
        "N": ("N_min", "N_max"), "P": ("P_min", "P_max"), "K": ("K_min", "K_max"),
        "temperature": ("temp_min", "temp_max"), "humidity": ("hum_min", "hum_max"),
        "ph": ("ph_min", "ph_max"), "rainfall": ("rain_min", "rain_max"),
    }
    for feat, (lo, hi) in pairs.items():
        out.append(FeatureRange(
            feature=feat,
            min=float(df[lo].min()),
            max=float(df[hi].max()),
            unit=_UNITS.get(feat, ""),
        ))
    return out


@router.get("/metrics")
def get_metrics() -> dict:
    return registry.metrics


# Convenience constant exposed for tests/imports.
N_YIELD_CROPS = len(YIELD_AVAILABLE)
