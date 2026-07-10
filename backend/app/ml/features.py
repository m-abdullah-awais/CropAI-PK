"""Feature definitions and helpers shared by training and serving."""

from __future__ import annotations

# Recommendation model input order (must match training).
RECO_FEATURES: list[str] = [
    "N", "P", "K", "temperature", "humidity", "ph", "rainfall",
]

# Yield trend model: number of most-recent years used to estimate a crop's trend.
TREND_WINDOW = 15


def hg_per_ha_to_units(hg_per_ha: float) -> dict[str, float]:
    return {
        "yield_hg_per_ha": round(hg_per_ha, 1),
        "yield_kg_per_ha": round(hg_per_ha * 0.1, 1),
        "yield_t_per_ha": round(hg_per_ha / 10000.0, 3),
    }


def t_per_ha_to_units(t_per_ha: float) -> dict[str, float]:
    return hg_per_ha_to_units(t_per_ha * 10000.0)


def forecast_from_trend(last_year: int, last_value: float, slope: float, year: int) -> float:
    """Project a crop's recent trend forward (or interpolate) to a target year."""
    return last_value + slope * (year - last_year)
