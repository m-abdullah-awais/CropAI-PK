"""Loads model artifacts and reference data ONCE at startup and holds them as a
singleton for the request handlers."""

from __future__ import annotations

import json
from typing import Any

import joblib

from app.config import settings
from app.crops import YIELD_ITEM_TO_CANON
from app.ml.data_loaders import load_rotation, load_yield


def _split_list(value: Any) -> list[str]:
    if not isinstance(value, str) or not value.strip():
        return []
    return [x.strip() for x in value.split(";") if x.strip()]


class ModelRegistry:
    def __init__(self) -> None:
        self.recommendation: dict | None = None
        self.yield_bundle: dict | None = None
        self.metrics: dict = {}
        self.rotation: dict[str, dict] = {}
        self.yield_history: dict[str, list[dict]] = {}

    @property
    def ready(self) -> bool:
        return self.recommendation is not None and self.yield_bundle is not None

    def load(self) -> None:
        reco_path = settings.model_dir / "recommendation.joblib"
        yield_path = settings.model_dir / "yield.joblib"
        metrics_path = settings.model_dir / "metrics.json"

        if not reco_path.exists() or not yield_path.exists():
            raise RuntimeError(
                "Model artifacts not found. Run training first:\n"
                "  python -m training.eval_report"
            )

        self.recommendation = joblib.load(reco_path)
        self.yield_bundle = joblib.load(yield_path)
        if metrics_path.exists():
            self.metrics = json.loads(metrics_path.read_text(encoding="utf-8"))

        self._load_rotation()
        self._load_yield_history()

    def _load_rotation(self) -> None:
        df = load_rotation()
        for _, row in df.iterrows():
            self.rotation[str(row["crop"])] = {
                "crop": str(row["crop"]),
                "family": str(row["family"]),
                "season": str(row["season"]),
                "nitrogen_role": str(row["nitrogen_role"]),
                "recommended_next": _split_list(row["recommended_next"]),
                "avoid_next": _split_list(row["avoid_next"]),
                "notes": str(row["notes"]),
            }

    def _load_yield_history(self) -> None:
        df = load_yield()
        # One value per (crop, year); the target is constant within a year.
        deduped = df.drop_duplicates(subset=["crop", "Year"])
        for crop in sorted(set(YIELD_ITEM_TO_CANON.values())):
            rows = deduped[deduped["crop"] == crop].sort_values("Year")
            self.yield_history[crop] = [
                {
                    "year": int(r["Year"]),
                    "yield_hg_per_ha": float(r["hg/ha_yield"]),
                    "yield_t_per_ha": round(float(r["hg/ha_yield"]) / 10000.0, 3),
                }
                for _, r in rows.iterrows()
            ]


registry = ModelRegistry()
