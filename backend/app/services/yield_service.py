from __future__ import annotations

from app import __version__
from app.crops import YIELD_AVAILABLE, display_name, normalize
from app.ml.features import forecast_from_trend, t_per_ha_to_units
from app.registry import registry
from app.schemas.yield_ import (
    YieldHistoryPoint,
    YieldHistoryResponse,
    YieldRequest,
    YieldResponse,
)


def _direction(slope: float) -> str:
    if slope > 0.01:
        return "rising"
    if slope < -0.01:
        return "falling"
    return "stable"


def predict_yield(req: YieldRequest) -> YieldResponse:
    crop = normalize(req.crop)
    display = display_name(crop)

    if crop not in YIELD_AVAILABLE:
        return YieldResponse(
            available=False,
            crop=crop,
            display=display,
            message=(
                f"Yield data is not available for '{display}'. Real yield series exist "
                f"for {len(YIELD_AVAILABLE)} crops."
            ),
            yield_available_crops=sorted(display_name(c) for c in YIELD_AVAILABLE),
        )

    bundle = registry.yield_bundle
    window = bundle["window"]
    tr = bundle["trends"][crop]
    first_year, last_year = tr["first_year"], tr["last_year"]
    last_value, slope = tr["last_value"], tr["slope"]

    real = {p["year"]: p["yield_t_per_ha"] for p in registry.yield_history.get(crop, [])}
    target = req.year
    warning = None

    if target in real:
        value_t = real[target]
        is_forecast = False
    elif target > last_year:
        # Trend-based forecast beyond the last real year.
        value_t = max(forecast_from_trend(last_year, last_value, slope, target), 0.05)
        is_forecast = True
        direction = _direction(slope)
        warning = (
            f"Trend forecast for {target}: over the last {window} years {display} "
            f"yields have been {direction} about {abs(slope):.3f} t/ha per year "
            f"(last real data {last_year})."
        )
    elif target < first_year:
        value_t = real[first_year]
        is_forecast = False
        warning = f"No real data before {first_year}; showing the earliest year."
    else:
        # Gap within the real range: interpolate between neighbours.
        lo = max((y for y in real if y < target), default=first_year)
        hi = min((y for y in real if y > target), default=last_year)
        frac = (target - lo) / (hi - lo) if hi != lo else 0.0
        value_t = real[lo] + frac * (real[hi] - real[lo])
        is_forecast = False

    units = t_per_ha_to_units(value_t)
    return YieldResponse(
        available=True,
        crop=crop,
        display=display,
        year=target,
        yield_hg_per_ha=units["yield_hg_per_ha"],
        yield_kg_per_ha=units["yield_kg_per_ha"],
        yield_t_per_ha=units["yield_t_per_ha"],
        is_forecast=is_forecast,
        trend_per_year=round(slope, 3),
        trend_direction=_direction(slope),
        last_real_year=last_year,
        extrapolation_warning=warning,
        model_version=__version__,
    )


def yield_history(crop: str) -> YieldHistoryResponse:
    slug = normalize(crop)
    series = registry.yield_history.get(slug, [])
    return YieldHistoryResponse(
        available=bool(series),
        crop=slug,
        display=display_name(slug),
        series=[YieldHistoryPoint(**p) for p in series],
    )
