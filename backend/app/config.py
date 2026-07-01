"""Application configuration (env-overridable)."""

from __future__ import annotations

from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ directory (parent of app/).
BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"), env_file_encoding="utf-8", extra="ignore"
    )

    port: int = 9271
    allowed_origins: list[str] = [
        "http://localhost:4319",
        "http://127.0.0.1:4319",
    ]
    api_version: str = "1.0.0"

    # data/ lives next to backend/ (e:\SM\data); models/ inside backend/.
    data_dir: Path = BASE_DIR.parent / "data"
    model_dir: Path = BASE_DIR / "models"

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _split_origins(cls, v: object) -> object:
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v


settings = Settings()
