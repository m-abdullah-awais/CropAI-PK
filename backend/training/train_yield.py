"""Train the crop yield regressor on REAL data only.

Input: data/pakistan_yield_real.csv (crop, year, yield_t_ha) - real FAO/OWID
yields for Pakistan, 1990-2024 (sorghum/sweet_potato 1990-2013). The model maps
(crop, year) -> yield; no estimated climate features, no projected rows.

Run from backend/:  python -m training.train_yield
"""

from __future__ import annotations

import joblib
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from app.ml.data_loaders import load_yield
from app.ml.features import YIELD_CROP_FEATURE, YIELD_NUMERIC_FEATURES
from app.config import settings

RANDOM_STATE = 42


def _rmse(a, b) -> float:
    return float(np.sqrt(mean_squared_error(a, b)))


def train() -> dict:
    df = load_yield()
    X = df[[YIELD_CROP_FEATURE] + YIELD_NUMERIC_FEATURES]
    y = (df["yield_t_ha"].astype(float) * 10000.0)  # store as hg/ha

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=df[YIELD_CROP_FEATURE]
    )

    pre = ColumnTransformer(
        [("crop", OneHotEncoder(handle_unknown="ignore"), [YIELD_CROP_FEATURE])],
        remainder="passthrough",
    )
    pipe = Pipeline([
        ("pre", pre),
        ("rf", RandomForestRegressor(
            n_estimators=400, n_jobs=-1, random_state=RANDOM_STATE
        )),
    ])
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    metrics = {
        "model": "RandomForestRegressor(n_estimators=400) + OneHot(crop), inputs=(crop, year)",
        "data": "real yields only (FAO/OWID), 1990-2024",
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "rmse_hg_ha": round(_rmse(y_test, y_pred), 1),
        "mae_hg_ha": round(float(mean_absolute_error(y_test, y_pred)), 1),
        "r2": round(float(r2_score(y_test, y_pred)), 4),
        "year_min": int(df["year"].min()),
        "year_max": int(df["year"].max()),
        "crops": sorted(df["crop"].unique().tolist()),
    }

    settings.model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "model": pipe,
            "crop_feature": YIELD_CROP_FEATURE,
            "numeric_features": YIELD_NUMERIC_FEATURES,
            "year_min": int(df["year"].min()),
            "year_max": int(df["year"].max()),
        },
        settings.model_dir / "yield.joblib",
    )
    return metrics


if __name__ == "__main__":
    from training._metrics import merge_metrics

    m = train()
    merge_metrics("yield", m)
    print(f"[yield] r2={m['r2']} rmse={m['rmse_hg_ha']} hg/ha (n_test={m['n_test']})")
