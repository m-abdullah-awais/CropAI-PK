"""Train the crop recommendation classifier.

Uses a feature-scaled, distance-weighted K-Nearest-Neighbours model. Why KNN and
not RandomForest: on this small, well-separated real dataset a RandomForest carves
chunky, flat decision regions - large areas map to one crop, so changing an input
(especially pH, which RF weights near zero) often does NOT change the recommendation.
A scaled distance-weighted KNN responds smoothly and continuously to every feature,
so the recommendation actually reflects the soil/climate the farmer enters.

Run from backend/:  python -m training.train_recommendation
"""

from __future__ import annotations

import joblib
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.config import settings
from app.ml.data_loaders import load_recommendation
from app.ml.features import RECO_FEATURES

RANDOM_STATE = 42


def train() -> dict:
    df = load_recommendation()
    X = df[RECO_FEATURES]
    y = df["label"].astype(str)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, stratify=y, random_state=RANDOM_STATE
    )

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("knn", KNeighborsClassifier(n_neighbors=9, weights="distance")),
    ])
    pipe.fit(X_train, y_train)

    classes = pipe.classes_
    y_pred = pipe.predict(X_test)
    accuracy = float((y_pred == y_test.to_numpy()).mean())
    macro_f1 = float(f1_score(y_test, y_pred, average="macro"))

    proba = pipe.predict_proba(X_test)
    top3_idx = np.argsort(proba, axis=1)[:, -3:]
    top3_labels = classes[top3_idx]
    top3_accuracy = float(
        np.mean([yt in row for yt, row in zip(y_test.to_numpy(), top3_labels)])
    )

    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=classes)

    settings.model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {"model": pipe, "features": RECO_FEATURES, "classes": list(classes)},
        settings.model_dir / "recommendation.joblib",
    )

    return {
        "model": "StandardScaler + KNeighborsClassifier(n_neighbors=9, weights=distance)",
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "accuracy": round(accuracy, 4),
        "macro_f1": round(macro_f1, 4),
        "top3_accuracy": round(top3_accuracy, 4),
        "per_class_f1": {
            k: round(v["f1-score"], 4)
            for k, v in report.items()
            if k in set(classes)
        },
        "confusion": {"labels": list(classes), "matrix": cm.tolist()},
        "note": (
            "Feature-scaled distance-weighted KNN so the recommendation responds "
            "continuously to every input. Validate against local soil tests."
        ),
    }


if __name__ == "__main__":
    from training._metrics import merge_metrics

    m = train()
    merge_metrics("recommendation", m)
    print(
        f"[recommendation] accuracy={m['accuracy']} macro_f1={m['macro_f1']} "
        f"top3={m['top3_accuracy']} (n_test={m['n_test']})"
    )
