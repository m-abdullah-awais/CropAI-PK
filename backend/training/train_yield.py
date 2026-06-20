"""Train the crop yield regressor.

CRITICAL: the FAO CSV repeats the same yearly target across ~9 monthly avg_temp
rows per (crop, year). A naive row-level split leaks the target. We split at the
(crop, year) GROUP level so duplicate rows never span train/test.

Run from backend/:  python -m training.train_yield
"""

from __future__ import annotations

import joblib
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from app.config import settings
from app.ml.data_loaders import load_yield
from app.ml.features import YIELD_CROP_FEATURE, YIELD_NUMERIC_FEATURES

RANDOM_STATE = 42
TARGET = "hg/ha_yield"


def _rmse(y_true, y_pred) -> float:
    return float(np.sqrt(mean_squared_error(y_true, y_pred)))


def train() -> dict:
    df = load_yield()
    feature_cols = [YIELD_CROP_FEATURE] + YIELD_NUMERIC_FEATURES
    X = df[feature_cols]
    y = df[TARGET].astype(float)
    groups = df["Item"].astype(str) + "_" + df["Year"].astype(str)

    # Group-level 80/20 split (prevents target leakage across duplicate rows).
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=RANDOM_STATE)
    train_idx, test_idx = next(gss.split(X, y, groups))
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

    pre = ColumnTransformer(
        transformers=[
            ("crop", OneHotEncoder(handle_unknown="ignore"), [YIELD_CROP_FEATURE]),
        ],
        remainder="passthrough",
    )
    pipe = Pipeline([
        ("pre", pre),
        ("rf", RandomForestRegressor(
            n_estimators=400, n_jobs=-1, random_state=RANDOM_STATE
        )),
    ])
    pipe.fit(X_train, y_train)

    # --- Overall test metrics ---
    y_pred = pipe.predict(X_test)
    rmse = _rmse(y_test, y_pred)
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    # --- Per-crop metrics vs a per-crop-mean baseline (from training data) ---
    train_means = y_train.groupby(X_train[YIELD_CROP_FEATURE]).mean().to_dict()
    per_crop: dict[str, dict] = {}
    test_crops = X_test[YIELD_CROP_FEATURE].to_numpy()
    for crop in sorted(set(test_crops)):
        mask = test_crops == crop
        yt, yp = y_test.to_numpy()[mask], y_pred[mask]
        baseline = np.full_like(yt, train_means.get(crop, y_train.mean()), dtype=float)
        per_crop[crop] = {
            "n": int(mask.sum()),
            "rmse": round(_rmse(yt, yp), 1),
            "mae": round(float(mean_absolute_error(yt, yp)), 1),
            "r2": round(float(r2_score(yt, yp)), 4) if mask.sum() > 1 else None,
            "mean_actual_hg_ha": round(float(yt.mean()), 1),
            "baseline_rmse": round(_rmse(yt, baseline), 1),
        }

    # National mean pesticides per year (used to default the awkward farmer input).
    pesticides_mean_by_year = {
        int(yr): round(float(v), 2)
        for yr, v in df.groupby("Year")["pesticides_tonnes"].mean().items()
    }

    settings.model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "model": pipe,
            "numeric_features": YIELD_NUMERIC_FEATURES,
            "crop_feature": YIELD_CROP_FEATURE,
            "pesticides_mean_by_year": pesticides_mean_by_year,
            "year_min": int(df["Year"].min()),
            "year_max": int(df["Year"].max()),
        },
        settings.model_dir / "yield.joblib",
    )

    metrics = {
        "model": "RandomForestRegressor(n_estimators=400) + OneHot(crop)",
        "split": "GroupShuffleSplit by (crop, year) — leakage-safe",
        "n_train_rows": int(len(X_train)),
        "n_test_rows": int(len(X_test)),
        "rmse_hg_ha": round(rmse, 1),
        "mae_hg_ha": round(mae, 1),
        "r2": round(r2, 4),
        "per_crop": per_crop,
        "year_min": int(df["Year"].min()),
        "year_max": int(df["Year"].max()),
    }
    return metrics


if __name__ == "__main__":
    from training._metrics import merge_metrics

    m = train()
    merge_metrics("yield", m)
    print(
        f"[yield] r2={m['r2']} rmse={m['rmse_hg_ha']} hg/ha "
        f"(n_test_rows={m['n_test_rows']})"
    )
