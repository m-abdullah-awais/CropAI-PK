"""Serve the nutrient/weather-based yield estimate.

Reuses real, already-loaded artifacts only: the per-crop soil/climate PROFILE and
observed RANGES from rotation.joblib, and the crop's real yield history (attainable).
No new dataset. Returns available=false for crops without a real nutrient profile
(the yield-only crops), which cannot get an honest nutrient response.
"""

from __future__ import annotations

from app.crops import ROTATION_AVAILABLE, display_name, normalize
from app.ml.features import RECO_FEATURES, t_per_ha_to_units
from app.ml.yield_response_engine import attainable_yield, estimate, sensitivity
from app.registry import registry
from app.schemas.yield_ import (
    YieldEstimateRequest,
    YieldEstimateResponse,
    YieldFactor,
    YieldSensitivity,
)

NUTRIENT_SWEEP = ["N", "P", "K"]

_NOTE = (
    "Estimated from how well your soil and climate match this crop's ideal conditions "
    "(from real data), scaled by its recent real yield. This is an agronomic estimate, "
    "not a measured value - validate against a local soil test."
)


def estimate_yield(req: YieldEstimateRequest) -> YieldEstimateResponse:
    crop = normalize(req.crop)
    display = display_name(crop)

    profiles = registry.rotation_model["profiles"]
    ranges = registry.rotation_model["ranges"]

    if crop not in ROTATION_AVAILABLE or crop not in profiles:
        return YieldEstimateResponse(
            available=False,
            crop=crop,
            display=display,
            note=(
                f"A nutrient-based estimate needs real soil-nutrient data, which is not "
                f"available for {display}. See its real yield history instead."
            ),
        )

    profile = profiles[crop]
    attainable = attainable_yield(registry.yield_history.get(crop, []))
    inputs = {f: float(getattr(req, f)) for f in RECO_FEATURES}

    est_t, overall, factors, most_limiting = estimate(inputs, profile, ranges, attainable)
    units = t_per_ha_to_units(est_t)

    sensitivities = []
    for f in NUTRIENT_SWEEP:
        curve = sensitivity(f, inputs, profile, ranges, attainable)
        if curve is not None:
            sensitivities.append(YieldSensitivity(**curve))

    return YieldEstimateResponse(
        available=True,
        crop=crop,
        display=display,
        estimated_t_per_ha=units["yield_t_per_ha"],
        estimated_kg_per_ha=units["yield_kg_per_ha"],
        attainable_t_per_ha=round(attainable, 3),
        overall_adequacy=round(overall, 4),
        factors=[YieldFactor(name=f, **factors[f]) for f in RECO_FEATURES],
        most_limiting=most_limiting,
        sensitivities=sensitivities,
        note=_NOTE,
    )
