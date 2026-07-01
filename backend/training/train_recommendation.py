"""Train the crop recommendation classifier.

Run from backend/:  python -m training.train_recommendation
"""

from __future__ import annotations

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from app.config import settings
from app.ml.data_loaders import load_recommendation
from app.ml.features import RECO_FEATURES

RANDOM_STATE = 42


def train() -> dict:
    df = load_recommendation()
    X = df[RECO_FEATURES]
    y = df["label"].astype(str)

    # 70 / 15 / 15 stratified split (val held out for honesty; metrics on test).
    X_train, X_tmp, y_train, y_tmp = train_test_split(
        X, y, test_size=0.30, stratify=y, random_state=RANDOM_STATE
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_tmp, y_tmp, test_size=0.50, stratify=y_tmp, random_state=RANDOM_STATE
    )

    pipe = Pipeline([
        ("rf", RandomForestClassifier(
            n_estimators=300, n_jobs=-1, random_state=RANDOM_STATE
        )),
    ])
    pipe.fit(X_train, y_train)

    # --- Evaluate on the held-out test set ---
    y_pred = pipe.predict(X_test)
    accuracy = float((y_pred == y_test.to_numpy()).mean())
    macro_f1 = float(f1_score(y_test, y_pred, average="macro"))

    # Top-3 accuracy.
    proba = pipe.predict_proba(X_test)
    classes = pipe.named_steps["rf"].classes_
    top3_idx = np.argsort(proba, axis=1)[:, -3:]
    top3_labels = classes[top3_idx]
    top3_hits = [yt in row for yt, row in zip(y_test.to_numpy(), top3_labels)]
    top3_accuracy = float(np.mean(top3_hits))

    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=classes)

    settings.model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {"model": pipe, "features": RECO_FEATURES, "classes": list(classes)},
        settings.model_dir / "recommendation.joblib",
    )

    metrics = {
        "model": "RandomForestClassifier(n_estimators=300)",
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
            "Trained on the real crop-recommendation dataset (22 crops). The classes "
            "are well separated, so accuracy is high."
        ),
    }
    return metrics


if __name__ == "__main__":
    from training._metrics import merge_metrics

    m = train()
    merge_metrics("recommendation", m)
    print(
        f"[recommendation] accuracy={m['accuracy']} macro_f1={m['macro_f1']} "
        f"top3={m['top3_accuracy']} (n_test={m['n_test']})"
    )
