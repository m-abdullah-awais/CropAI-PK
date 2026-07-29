from __future__ import annotations

from fastapi import APIRouter

from app.schemas.yield_ import (
    YieldEstimateRequest,
    YieldEstimateResponse,
    YieldHistoryResponse,
    YieldRequest,
    YieldResponse,
)
from app.services.yield_response_service import estimate_yield
from app.services.yield_service import predict_yield, yield_history

router = APIRouter(prefix="/api", tags=["yield"])


@router.post("/yield", response_model=YieldResponse)
def post_yield(req: YieldRequest) -> YieldResponse:
    return predict_yield(req)


@router.post("/yield/estimate", response_model=YieldEstimateResponse)
def post_yield_estimate(req: YieldEstimateRequest) -> YieldEstimateResponse:
    return estimate_yield(req)


@router.get("/yield/history/{crop}", response_model=YieldHistoryResponse)
def get_yield_history(crop: str) -> YieldHistoryResponse:
    return yield_history(crop)
