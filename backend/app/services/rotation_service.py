from __future__ import annotations

from app import __version__
from app.crops import display_name, normalize, yield_available
from app.ml.features import RECO_FEATURES
from app.ml.rotation_engine import (
    PERENNIAL_SEASON,
    project_soil,
    rank_next,
    soil_suitability,
)
from app.registry import registry
from app.schemas.rotation import (
    AvoidCrop,
    NextCrop,
    ProjectedSoil,
    RotationRequest,
    RotationResponse,
)


class UnknownCrop(Exception):
    pass


def _seed_state(req: RotationRequest, profile: dict[str, float]) -> tuple[dict[str, float], bool]:
    """Field state = provided values, else the crop's real average profile."""
    estimated = False
    state: dict[str, float] = {}
    for f in RECO_FEATURES:
        provided = getattr(req, f)
        if provided is None:
            state[f] = float(profile[f])
            estimated = True
        else:
            state[f] = float(provided)
    return state, estimated


def plan_rotation(req: RotationRequest) -> RotationResponse:
    slug = normalize(req.current_crop)
    model = registry.rotation_model
    meta = model["meta"].get(slug)
    if meta is None:
        raise UnknownCrop(slug)

    profile = model["profiles"].get(slug)
    ranges = model["ranges"]
    effects = model["effects"]

    state, estimated = _seed_state(req, profile)
    projected = project_soil(state, meta["nitrogen_role"], effects, ranges)

    is_perennial = meta["season"] == PERENNIAL_SEASON
    next_crops: list[NextCrop] = []
    avoid: list[AvoidCrop] = []

    # Perennial orchards are not rotated on an annual cycle: no successor ranking.
    if not is_perennial:
        scores = soil_suitability(projected, registry.recommendation, model["profiles"])
        ranked, avoid_raw = rank_next(slug, model["meta"], scores, req.top_n)
        next_crops = [
            NextCrop(
                crop=n["crop"],
                display=display_name(n["crop"]),
                score=n["score"],
                soil_suitability=n["soil_suitability"],
                nitrogen_role=n["nitrogen_role"],
                note=n["note"],
                yield_available=yield_available(n["crop"]),
            )
            for n in ranked
        ]
        avoid = [
            AvoidCrop(crop=a["crop"], display=display_name(a["crop"]), reason=a["reason"])
            for a in avoid_raw
        ]

    return RotationResponse(
        crop=slug,
        display=display_name(slug),
        family=meta["family"],
        season=meta["season"],
        nitrogen_role=meta["nitrogen_role"],
        is_perennial=is_perennial,
        projected_soil=ProjectedSoil(
            **{f: round(projected[f], 2) for f in RECO_FEATURES},
            soil_estimated=estimated,
        ),
        next_crops=next_crops,
        avoid=avoid,
        notes=meta["notes"],
        model_version=__version__,
    )
