from __future__ import annotations

from app.crops import display_name, normalize, yield_available
from app.registry import registry
from app.schemas.rotation import NextCrop, RotationResponse


class UnknownCrop(Exception):
    pass


def _next_crop(slug: str) -> NextCrop:
    info = registry.rotation.get(slug)
    return NextCrop(
        crop=slug,
        display=display_name(slug),
        nitrogen_role=info["nitrogen_role"] if info else None,
        yield_available=yield_available(slug),
    )


def get_rotation(crop: str) -> RotationResponse:
    slug = normalize(crop)
    info = registry.rotation.get(slug)
    if info is None:
        raise UnknownCrop(slug)

    return RotationResponse(
        crop=slug,
        display=display_name(slug),
        family=info["family"],
        season=info["season"],
        nitrogen_role=info["nitrogen_role"],
        recommended_next=[_next_crop(c) for c in info["recommended_next"]],
        avoid_next=[_next_crop(c) for c in info["avoid_next"]],
        notes=info["notes"],
    )
