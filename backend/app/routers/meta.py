from __future__ import annotations

from fastapi import APIRouter

from app.crops import (
    ALL_CROPS,
    YIELD_AVAILABLE,
    display_name,
    rotation_available,
    yield_available,
)
from app.ml.data_loaders import load_recommendation
from app.ml.features import RECO_FEATURES
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
    # Observed min/max per feature from the real recommendation dataset.
    df = load_recommendation()
    return [
        FeatureRange(
            feature=feat,
            min=round(float(df[feat].min()), 2),
            max=round(float(df[feat].max()), 2),
            unit=_UNITS.get(feat, ""),
        )
        for feat in RECO_FEATURES
    ]


@router.get("/metrics")
def get_metrics() -> dict:
    return registry.metrics


# Convenience constant exposed for tests/imports.
N_YIELD_CROPS = len(YIELD_AVAILABLE)
