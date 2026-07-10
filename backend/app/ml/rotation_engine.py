"""Core rotation logic shared by training and serving.

The rotation model does NOT introduce a new dataset. It reuses the real
recommendation KNN: we take the field's soil/climate state, project it forward by
the current crop's real agronomic nutrient effect, score every candidate crop on
that projected soil with the KNN, then blend that soil-suitability score with real
agronomy facts (family breaks, avoid lists, legume-after-feeder nitrogen boost).
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from app.ml.features import RECO_FEATURES

PERENNIAL_SEASON = "perennial"
FEEDER_ROLES = {"heavy_feeder", "moderate_feeder"}

# Blend weights: soil-suitability is the base score, then real agronomy adjusts it.
# These encode two established rotation principles (not a tuned dataset):
#   - follow a nutrient feeder with a nitrogen-fixing legume to restore the soil,
#   - do NOT stack another heavy feeder straight after a feeder (compounds depletion).
LEGUME_BOOST = 1.5           # nitrogen fixer after a feeder.
FEEDER_STACK_PENALTY = 0.8   # heavy feeder after a feeder.


def project_soil(
    state: dict[str, float],
    role: str,
    effects: dict[str, dict],
    ranges: dict[str, dict],
) -> dict[str, float]:
    """Apply the current crop's nutrient effect to N/P/K, clamped to real ranges."""
    delta = effects.get(role, {})
    projected = dict(state)
    projected["N"] = state["N"] + float(delta.get("delta_n", 0.0))
    projected["P"] = state["P"] + float(delta.get("delta_p", 0.0))
    projected["K"] = state["K"] + float(delta.get("delta_k", 0.0))
    for f in RECO_FEATURES:
        r = ranges.get(f)
        if r is not None:
            projected[f] = float(min(r["max"], max(r["min"], projected[f])))
    return projected


def _scaled(pipe, values: dict[str, float]):
    row = pd.DataFrame([[values[f] for f in RECO_FEATURES]], columns=RECO_FEATURES)
    return pipe.named_steps["scaler"].transform(row)[0]


def soil_suitability(
    projected: dict[str, float],
    knn_bundle: dict,
    profiles: dict[str, dict[str, float]],
) -> dict[str, float]:
    """How well the projected soil matches each crop's real profile.

    We reuse the trained recommendation model's StandardScaler (so features are
    weighted exactly as the KNN sees them), then score every crop by its distance
    to the projected soil in that scaled space. Unlike KNN predict_proba - which is
    near one-hot and leaves most crops at 0 - this is smooth and comparable across
    all 21 crops, so the agronomy blend can meaningfully reorder it.
    """
    pipe = knn_bundle["model"]
    px = _scaled(pipe, projected)
    sims: dict[str, float] = {}
    for crop, prof in profiles.items():
        dist = float(np.linalg.norm(px - _scaled(pipe, prof)))
        sims[str(crop)] = 1.0 / (1.0 + dist)  # smooth similarity in (0, 1]
    return sims


def rank_next(
    current: str,
    meta_by_crop: dict[str, dict],
    scores: dict[str, float],
    top_n: int,
) -> tuple[list[dict], list[dict]]:
    """Blend soil scores with agronomy. Returns (recommended_next, avoid).

    recommended: crops that suit the projected soil and are agronomically sound,
    ranked by the blended score. avoid: same-family / documented avoid_next crops.
    """
    cur = meta_by_crop[current]
    cur_family = cur["family"]
    cur_role = cur["nitrogen_role"]
    avoid_slugs = set(cur["avoid_next"])

    recommended: list[dict] = []
    avoid: list[dict] = []
    seen_avoid: set[str] = set()

    for crop, base in scores.items():
        if crop == current:
            continue
        m = meta_by_crop.get(crop)
        if m is None:
            continue

        same_family = m["family"] == cur_family
        in_avoid = crop in avoid_slugs

        if same_family or in_avoid:
            if crop not in seen_avoid:
                seen_avoid.add(crop)
                avoid.append(
                    {"crop": crop, "reason": "same_family" if same_family else "avoid_pair"}
                )
            continue

        # Perennials (orchards) are not planted as a one-season rotation crop.
        if m["season"] == PERENNIAL_SEASON:
            continue

        score = base
        note = "soil_match"
        if cur_role in FEEDER_ROLES and m["nitrogen_role"] == "nitrogen_fixer":
            score *= LEGUME_BOOST
            note = "nitrogen_break"
        elif cur_role in FEEDER_ROLES and m["nitrogen_role"] == "heavy_feeder":
            score *= FEEDER_STACK_PENALTY

        recommended.append(
            {
                "crop": crop,
                "score": score,
                "soil_suitability": base,
                "nitrogen_role": m["nitrogen_role"],
                "note": note,
            }
        )

    recommended.sort(key=lambda r: r["score"], reverse=True)
    # Normalise to the best candidate so the bars read as a 0..1 relative match.
    if recommended:
        top_score = max(r["score"] for r in recommended) or 1.0
        top_soil = max(r["soil_suitability"] for r in recommended) or 1.0
        for r in recommended:
            r["score"] = round(min(1.0, r["score"] / top_score), 4)
            r["soil_suitability"] = round(min(1.0, r["soil_suitability"] / top_soil), 4)

    return recommended[:top_n], avoid
