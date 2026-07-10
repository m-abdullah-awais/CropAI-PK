"""Loads model artifacts and reference data ONCE at startup and holds them as a
singleton for the request handlers."""

from __future__ import annotations

import json

import joblib

from app.config import settings
from app.crops import YIELD_CROPS
from app.ml.data_loaders import load_yield


class ModelRegistry:
    def __init__(self) -> None:
        self.recommendation: dict | None = None
        self.yield_bundle: dict | None = None
        self.rotation_model: dict | None = None
        self.metrics: dict = {}
        self.yield_history: dict[str, list[dict]] = {}

    @property
    def ready(self) -> bool:
        return (
            self.recommendation is not None
            and self.yield_bundle is not None
            and self.rotation_model is not None
        )

    def load(self) -> None:
        reco_path = settings.model_dir / "recommendation.joblib"
        yield_path = settings.model_dir / "yield.joblib"
        rotation_path = settings.model_dir / "rotation.joblib"
        metrics_path = settings.model_dir / "metrics.json"

        if not reco_path.exists() or not yield_path.exists() or not rotation_path.exists():
            raise RuntimeError(
                "Model artifacts not found. Run training first:\n"
                "  python -m training.eval_report"
            )

        self.recommendation = joblib.load(reco_path)
        self.yield_bundle = joblib.load(yield_path)
        self.rotation_model = joblib.load(rotation_path)
        if metrics_path.exists():
            self.metrics = json.loads(metrics_path.read_text(encoding="utf-8"))

        self._load_yield_history()

    def _load_yield_history(self) -> None:
        df = load_yield()  # crop, year, yield_t_ha (one row per crop-year)
        for crop in YIELD_CROPS:
            rows = df[df["crop"] == crop].sort_values("year")
            self.yield_history[crop] = [
                {
                    "year": int(r["year"]),
                    "yield_hg_per_ha": round(float(r["yield_t_ha"]) * 10000.0, 1),
                    "yield_t_per_ha": round(float(r["yield_t_ha"]), 3),
                }
                for _, r in rows.iterrows()
            ]


registry = ModelRegistry()
