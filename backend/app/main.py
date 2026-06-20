from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.config import settings
from app.crops import ROTATION_AVAILABLE, YIELD_AVAILABLE
from app.registry import registry
from app.routers import meta, recommend, rotation, yield_
from app.schemas.common import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    registry.load()
    yield


app = FastAPI(
    title="Pakistan Crop AI",
    version=__version__,
    description="ML backend: crop recommendation, yield prediction, rotation planning.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,
)

app.include_router(recommend.router)
app.include_router(yield_.router)
app.include_router(rotation.router)
app.include_router(meta.router)


@app.get("/health", response_model=HealthResponse, tags=["meta"])
def health() -> HealthResponse:
    return HealthResponse(
        status="ok" if registry.ready else "degraded",
        models_loaded=registry.ready,
        version=__version__,
        n_crops_recommendation=len(ROTATION_AVAILABLE),
        n_crops_yield=len(YIELD_AVAILABLE),
    )
