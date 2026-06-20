from __future__ import annotations

from fastapi import APIRouter

from app.schemas.recommend import RecommendRequest, RecommendResponse
from app.services.recommend_service import recommend

router = APIRouter(prefix="/api", tags=["recommend"])


@router.post("/recommend", response_model=RecommendResponse)
def post_recommend(req: RecommendRequest) -> RecommendResponse:
    return recommend(req)
