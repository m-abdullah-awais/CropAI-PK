"""Nutrient/weather -> yield ESTIMATE (agronomy response model).

No new dataset. This reuses the real per-crop soil/climate PROFILE and observed RANGES
(baked into rotation.joblib from the real recommendation data) plus the crop's real
recent yield (attainable). It scales the attainable yield by how well the field's
nutrients and climate match the crop's real optimum, using established agronomic
response shapes:

  - nutrients (N, P, K): diminishing returns (Mitscherlich) - below the optimum reduces
    yield, at/above the optimum plateaus,
  - pH and climate: two-sided tolerance around the optimum (width from the real range),
  - combine with the law of the minimum (the limiting factor dominates), softened so a
    single factor does not zero the estimate.

This is an agronomic ESTIMATE, not a measured prediction, and is labelled that way.
"""

from __future__ import annotations

import math

from app.ml.features import RECO_FEATURES

NUTRIENTS = {"N", "P", "K"}
MIN_WEIGHT = 0.5          # overall = MIN_WEIGHT*min(factors) + (1-MIN_WEIGHT)*geomean
ATTAINABLE_YEARS = 5      # recent real years averaged for the attainable yield
_MITSCHERLICH_K = 3.0     # curvature: adequacy reaches ~1 at the optimum


def attainable_yield(history: list[dict]) -> float:
    """Crop's real recent Pakistan yield: mean of the last few real years (t/ha)."""
    if not history:
        return 0.0
    recent = sorted(history, key=lambda p: p["year"])[-ATTAINABLE_YEARS:]
    vals = [float(p["yield_t_per_ha"]) for p in recent]
    return sum(vals) / len(vals)


def _spread(feature: str, ranges: dict) -> float:
    """Tolerance width for pH/climate factors, from the real observed range."""
    r = ranges.get(feature)
    if not r:
        return 0.0
    width = float(r["max"]) - float(r["min"])
    return width / 6.0 if feature == "ph" else width / 4.0


def _nutrient_adequacy(value: float, optimum: float) -> float:
    """Diminishing returns: 0 at none, ~1 at the optimum, plateau above it."""
    if optimum <= 0:
        return 1.0
    r = max(0.0, value) / optimum
    a = (1.0 - math.exp(-_MITSCHERLICH_K * r)) / (1.0 - math.exp(-_MITSCHERLICH_K))
    return max(0.0, min(1.0, a))


def _tolerance_adequacy(value: float, optimum: float, spread: float) -> float:
    """Two-sided Gaussian tolerance: 1 at the optimum, falling off either side."""
    if spread <= 0:
        return 1.0
    z = (value - optimum) / spread
    return math.exp(-0.5 * z * z)


def factor_adequacy(feature: str, value: float, optimum: float, spread: float) -> float:
    if feature in NUTRIENTS:
        return _nutrient_adequacy(value, optimum)
    return _tolerance_adequacy(value, optimum, spread)


def estimate(
    inputs: dict[str, float],
    profile: dict[str, float],
    ranges: dict[str, dict],
    attainable: float,
) -> tuple[float, float, dict[str, dict], str]:
    """Return (estimated_t_per_ha, overall_adequacy, factors, most_limiting_feature)."""
    factors: dict[str, dict] = {}
    for f in RECO_FEATURES:
        val = float(inputs[f])
        opt = float(profile[f])
        adq = factor_adequacy(f, val, opt, _spread(f, ranges))
        factors[f] = {"value": round(val, 2), "optimum": round(opt, 2), "adequacy": round(adq, 4)}

    adq_vals = [factors[f]["adequacy"] for f in RECO_FEATURES]
    f_min = min(adq_vals)
    geomean = math.exp(sum(math.log(max(a, 1e-6)) for a in adq_vals) / len(adq_vals))
    overall = max(0.0, min(1.0, MIN_WEIGHT * f_min + (1.0 - MIN_WEIGHT) * geomean))

    most_limiting = min(RECO_FEATURES, key=lambda f: factors[f]["adequacy"])
    for f in RECO_FEATURES:
        a = factors[f]["adequacy"]
        if a >= 0.9:
            status = "ideal"
        elif factors[f]["value"] < factors[f]["optimum"]:
            status = "low"
        else:
            status = "high"
        factors[f]["status"] = status
        factors[f]["limiting"] = f == most_limiting

    return attainable * overall, overall, factors, most_limiting


def sensitivity(
    feature: str,
    inputs: dict[str, float],
    profile: dict[str, float],
    ranges: dict[str, dict],
    attainable: float,
    steps: int = 30,
) -> dict | None:
    """Sweep one feature across its real range -> the yield what-if curve."""
    r = ranges.get(feature)
    if not r:
        return None
    lo, hi = float(r["min"]), float(r["max"])
    points = []
    for i in range(steps + 1):
        v = lo + (hi - lo) * i / steps
        probe = dict(inputs)
        probe[feature] = v
        est, _, _, _ = estimate(probe, profile, ranges, attainable)
        points.append({"value": round(v, 2), "yield_t_per_ha": round(est, 3)})
    return {
        "feature": feature,
        "points": points,
        "optimum": round(float(profile[feature]), 2),
        "current": round(float(inputs[feature]), 2),
    }
