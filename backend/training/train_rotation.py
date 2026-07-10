"""Build the crop rotation model artifact.

Rotation reuses the real recommendation KNN (no new dataset). This step precomputes,
from real data, everything the serving path needs to project the soil forward and
score candidates:
  - each crop's AVERAGE soil/climate profile from the real recommendation dataset
    (used to seed the field state when the farmer leaves the soil inputs blank),
  - the real nutrient-effect table (N/P/K a crop leaves for the next crop, by role),
  - the observed feature ranges (to clamp the projected soil to real values),
  - per-crop agronomy meta (family, season, nitrogen_role, avoid_next) for the blend.

It is validated with agronomy sanity checks: no crop should recommend itself or a
same-family crop, and a heavy feeder should tend to be followed by a nitrogen fixer.

Run from backend/:  python -m training.train_rotation
"""

from __future__ import annotations

import joblib

from app.config import settings
from app.crops import RECO_CROPS
from app.ml.data_loaders import (
    load_nutrient_effects,
    load_recommendation,
    load_rotation,
)
from app.ml.features import RECO_FEATURES
from app.ml.rotation_engine import (
    FEEDER_ROLES,
    PERENNIAL_SEASON,
    project_soil,
    rank_next,
    soil_suitability,
)

TOP_N = 4


def _split_list(value: object) -> list[str]:
    if not isinstance(value, str) or not value.strip():
        return []
    return [x.strip() for x in value.split(";") if x.strip()]


def _build_profiles() -> dict[str, dict[str, float]]:
    df = load_recommendation()
    means = df.groupby("label")[RECO_FEATURES].mean()
    return {
        str(crop): {f: round(float(means.loc[crop, f]), 3) for f in RECO_FEATURES}
        for crop in means.index
    }


def _build_ranges() -> dict[str, dict[str, float]]:
    df = load_recommendation()
    return {
        f: {"min": round(float(df[f].min()), 3), "max": round(float(df[f].max()), 3)}
        for f in RECO_FEATURES
    }


def _build_effects() -> dict[str, dict[str, float]]:
    df = load_nutrient_effects()
    return {
        str(row["nitrogen_role"]): {
            "delta_n": float(row["delta_n"]),
            "delta_p": float(row["delta_p"]),
            "delta_k": float(row["delta_k"]),
        }
        for _, row in df.iterrows()
    }


def _build_meta() -> dict[str, dict]:
    df = load_rotation()
    meta: dict[str, dict] = {}
    for _, row in df.iterrows():
        meta[str(row["crop"])] = {
            "family": str(row["family"]),
            "season": str(row["season"]),
            "nitrogen_role": str(row["nitrogen_role"]),
            "avoid_next": _split_list(row["avoid_next"]),
            "notes": str(row["notes"]),
        }
    return meta


def train() -> dict:
    profiles = _build_profiles()
    ranges = _build_ranges()
    effects = _build_effects()
    meta = _build_meta()

    settings.model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "profiles": profiles,
            "ranges": ranges,
            "effects": effects,
            "meta": meta,
            "features": RECO_FEATURES,
            "top_n": TOP_N,
        },
        settings.model_dir / "rotation.joblib",
    )

    return _sanity_metrics(profiles, ranges, effects, meta)


def _sanity_metrics(profiles, ranges, effects, meta) -> dict:
    """Validate the blend against the real KNN (if the reco artifact is present)."""
    reco_path = settings.model_dir / "recommendation.joblib"
    n_rotatable = sum(1 for c in RECO_CROPS if meta[c]["season"] != PERENNIAL_SEASON)

    base = {
        "model": "Projected soil -> recommendation KNN, blended with agronomy facts",
        "data": "real recommendation dataset (KNN) + curated agronomy facts",
        "n_crops": len(RECO_CROPS),
        "n_rotatable": n_rotatable,
        "n_perennial": len(RECO_CROPS) - n_rotatable,
        "top_n": TOP_N,
    }
    if not reco_path.exists():
        base["note"] = "Recommendation artifact absent; sanity checks skipped."
        return base

    knn = joblib.load(reco_path)
    self_reco = same_family = 0
    feeders = legume_after_feeder = 0
    top1_scores: list[float] = []

    for crop in RECO_CROPS:
        m = meta[crop]
        if m["season"] == PERENNIAL_SEASON:
            continue
        projected = project_soil(profiles[crop], m["nitrogen_role"], effects, ranges)
        scores = soil_suitability(projected, knn, profiles)
        nexts, _ = rank_next(crop, meta, scores, TOP_N)
        slugs = [n["crop"] for n in nexts]
        if crop in slugs:
            self_reco += 1
        if any(meta[s]["family"] == m["family"] for s in slugs):
            same_family += 1
        if nexts:
            top1_scores.append(nexts[0]["soil_suitability"])
        if m["nitrogen_role"] in FEEDER_ROLES:
            feeders += 1
            if nexts and meta[nexts[0]["crop"]]["nitrogen_role"] == "nitrogen_fixer":
                legume_after_feeder += 1

    base.update(
        {
            "self_recommended": self_reco,
            "same_family_in_top": same_family,
            "legume_after_feeder_rate": round(legume_after_feeder / feeders, 3) if feeders else None,
            "mean_top1_soil_suitability": round(sum(top1_scores) / len(top1_scores), 4) if top1_scores else None,
        }
    )
    return base


if __name__ == "__main__":
    from training._metrics import merge_metrics

    m = train()
    merge_metrics("rotation", m)
    print(
        f"[rotation] {m['n_crops']} crops ({m['n_rotatable']} rotatable), "
        f"legume-after-feeder={m.get('legume_after_feeder_rate')}, "
        f"self/same-family in top={m.get('self_recommended')}/{m.get('same_family_in_top')}"
    )
