"""Train the crop yield TREND model.

For each crop the model learns its yield trend from the real historical series
(data/pakistan_yield_real.csv) and can forecast forward. "Training" fits, per crop:
  - the recent-years linear trend (slope + intercept over the last TREND_WINDOW years),
  - the last real year and value (the anchor for forecasting).

Prediction (in the service): a year with real data returns the recorded value; a
future year returns last_value + slope * (year - last_year) - a trend-based forecast.

The model is validated by a backtest: fit the trend on all-but-last-5 years, forecast
those 5, and measure the error - this is how well the model predicts from past trends.

Run from backend/:  python -m training.train_yield
"""

from __future__ import annotations

import joblib
import numpy as np

from app.config import settings
from app.ml.data_loaders import load_yield
from app.ml.features import TREND_WINDOW, forecast_from_trend

MIN_BACKTEST_POINTS = 12
BACKTEST_HORIZON = 5


def _fit_trend(years: np.ndarray, values: np.ndarray, window: int) -> tuple[float, float]:
    """Linear (slope, intercept) over the most recent `window` points.
    Sparse series (<2 points) get a flat trend at the last value."""
    if len(years) < 2:
        return 0.0, float(values[-1])
    if len(years) > window:
        years, values = years[-window:], values[-window:]
    slope, intercept = np.polyfit(years.astype(float), values.astype(float), 1)
    return float(slope), float(intercept)


def train() -> dict:
    df = load_yield().sort_values(["crop", "year"])
    trends: dict[str, dict] = {}
    backtest_errors: list[float] = []

    for crop, g in df.groupby("crop"):
        years = g["year"].to_numpy()
        values = g["yield_t_ha"].to_numpy(dtype=float)
        slope, intercept = _fit_trend(years, values, TREND_WINDOW)
        trends[crop] = {
            "first_year": int(years[0]),
            "last_year": int(years[-1]),
            "last_value": float(values[-1]),
            "slope": round(slope, 5),
        }

        # Backtest: fit on all but the last BACKTEST_HORIZON years, forecast them.
        if len(years) >= MIN_BACKTEST_POINTS:
            cut = len(years) - BACKTEST_HORIZON
            s, _ = _fit_trend(years[:cut], values[:cut], TREND_WINDOW)
            anchor_year, anchor_val = int(years[cut - 1]), float(values[cut - 1])
            for yr, actual in zip(years[cut:], values[cut:]):
                pred = forecast_from_trend(anchor_year, anchor_val, s, int(yr))
                backtest_errors.append(abs(pred - actual))

    settings.model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "trends": trends,
            "window": TREND_WINDOW,
            "year_min": int(df["year"].min()),
            "year_max": int(df["year"].max()),
        },
        settings.model_dir / "yield.joblib",
    )

    mae = float(np.mean(backtest_errors)) if backtest_errors else None
    return {
        "model": f"Per-crop linear trend (last {TREND_WINDOW} years) with forward forecast",
        "data": "real yields only (FAO/OWID), 1961-2024",
        "n_crops": len(trends),
        "backtest_horizon_years": BACKTEST_HORIZON,
        "forecast_mae_t_ha": round(mae, 3) if mae is not None else None,
        "rising_crops": sorted(c for c, t in trends.items() if t["slope"] > 0.01),
    }


if __name__ == "__main__":
    from training._metrics import merge_metrics

    m = train()
    merge_metrics("yield", m)
    print(
        f"[yield] {m['n_crops']} crops, trend model, "
        f"backtest MAE={m['forecast_mae_t_ha']} t/ha over {m['backtest_horizon_years']}y"
    )
