"""Feature definitions, column order, and unit conversions shared by training
and serving so the two never drift."""

from __future__ import annotations

# Recommendation model input order (must match training).
RECO_FEATURES: list[str] = [
    "N", "P", "K", "temperature", "humidity", "ph", "rainfall",
]

# Yield model inputs. `crop` is one-hot encoded inside the pipeline; the rest
# are numeric and passed through.
YIELD_NUMERIC_FEATURES: list[str] = [
    "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp",
]
YIELD_CROP_FEATURE: str = "crop"  # canonical slug column added before fitting

YIELD_YEAR_MIN = 1990
YIELD_YEAR_MAX = 2026

# Last year of real measured FAO yield per crop. wheat/rice/maize/potato/soybean
# have measured data through 2024 (via Our World in Data); sorghum & sweet_potato
# only through the original 2013 cut-off. Years beyond these are trend projections.
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
