"""Feature definitions and unit conversions shared by training and serving."""

from __future__ import annotations

# Recommendation model input order (must match training).
RECO_FEATURES: list[str] = [
    "N", "P", "K", "temperature", "humidity", "ph", "rainfall",
]

# Yield model inputs: crop (one-hot) + year. Both are real, no estimated features.
YIELD_CROP_FEATURE: str = "crop"
YIELD_NUMERIC_FEATURES: list[str] = ["year"]

# Last year of real measured yield per crop. Most have data through 2024;
# sorghum & sweet_potato only through the FAO 2013 cut-off (no OWID series).
YIELD_REAL_THROUGH_DEFAULT = 2024
YIELD_REAL_THROUGH_BY_CROP: dict[str, int] = {
    "sorghum": 2013,
    "sweet_potato": 2013,
}


def yield_real_through(crop: str) -> int:
    return YIELD_REAL_THROUGH_BY_CROP.get(crop, YIELD_REAL_THROUGH_DEFAULT)


def hg_per_ha_to_units(hg_per_ha: float) -> dict[str, float]:
    """Convert the model's hg/ha target to friendlier units."""
    return {
        "yield_hg_per_ha": round(hg_per_ha, 1),
        "yield_kg_per_ha": round(hg_per_ha * 0.1, 1),
        "yield_t_per_ha": round(hg_per_ha / 10000.0, 3),
    }
