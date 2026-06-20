from __future__ import annotations

import numpy as np
import pandas as pd

from app import __version__
from app.crops import display_name, rotation_available, yield_available
from app.ml.features import RECO_FEATURES
from app.registry import registry
from app.schemas.recommend import (
    CropRecommendation,
    RecommendRequest,
    RecommendResponse,
)


def _confidence(p: float) -> str:
    if p >= 0.6:
        return "high"
    if p >= 0.3:
        return "medium"
    return "low"


def recommend(req: RecommendRequest) -> RecommendResponse:
    bundle = registry.recommendation
    pipe = bundle["model"]
    classes = np.asarray(bundle["classes"])

    row = pd.DataFrame([[getattr(req, f) for f in RECO_FEATURES]], columns=RECO_FEATURES)
    proba = pipe.predict_proba(row)[0]

    order = np.argsort(proba)[::-1][: req.top_n]
    recs = [
        CropRecommendation(
            crop=str(classes[i]),
            display=display_name(str(classes[i])),
            probability=round(float(proba[i]), 4),
            confidence=_confidence(float(proba[i])),
            yield_available=yield_available(str(classes[i])),
            rotation_available=rotation_available(str(classes[i])),
        )
        for i in order
    ]
    return RecommendResponse(recommendations=recs, model_version=__version__)
