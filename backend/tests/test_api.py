"""End-to-end endpoint tests (require trained model artifacts in models/).

Run training first:  python -m training.eval_report
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:  # triggers lifespan -> registry.load()
        yield c


def test_health(client):
    body = client.get("/health").json()
    assert body["models_loaded"] is True
    assert body["n_crops_recommendation"] == 21
    assert body["n_crops_yield"] == 31


def test_recommend_returns_ranked_crops(client):
    payload = {"N": 90, "P": 42, "K": 43, "temperature": 21,
               "humidity": 82, "ph": 6.5, "rainfall": 200, "top_n": 3}
    recs = client.post("/api/recommend", json=payload).json()["recommendations"]
    assert len(recs) == 3
    probs = [x["probability"] for x in recs]
    assert probs == sorted(probs, reverse=True)


def test_recommend_validation_error(client):
    bad = {"N": 90, "P": 42, "K": 43, "temperature": 21,
           "humidity": 82, "ph": 15, "rainfall": 200}
    assert client.post("/api/recommend", json=bad).status_code == 422


def test_yield_available_crop(client):
    body = client.post("/api/yield", json={"crop": "wheat", "year": 2024}).json()
    assert body["available"] is True
    assert body["yield_t_per_ha"] > 0
    assert body["is_forecast"] is False  # 2024 is real data


def test_yield_future_is_trend_forecast(client):
    body = client.post("/api/yield", json={"crop": "wheat", "year": 2030}).json()
    assert body["available"] is True
    assert body["is_forecast"] is True
    assert body["trend_direction"] in {"rising", "falling", "stable"}


def test_yield_unavailable_crop_is_graceful(client):
    r = client.post("/api/yield", json={"crop": "coffee", "year": 2024})
    assert r.status_code == 200
    assert r.json()["available"] is False


def test_yield_history(client):
    body = client.get("/api/yield/history/sugarcane").json()
    assert body["available"] is True
    assert len(body["series"]) > 0


def test_rotation_known_crop(client):
    body = client.post("/api/rotation", json={"current_crop": "rice"}).json()
    assert body["season"] == "Kharif"
    assert body["is_perennial"] is False
    # Soil was left blank, so it is seeded from the crop's real average profile.
    assert body["projected_soil"]["soil_estimated"] is True
    assert len(body["next_crops"]) > 0
    # A heavy feeder like rice must not be followed by itself or a same-family grass.
    next_slugs = [c["crop"] for c in body["next_crops"]]
    assert "rice" not in next_slugs
    assert "maize" not in next_slugs  # same family (Poaceae) -> excluded


def test_rotation_heavy_feeder_prefers_legume(client):
    body = client.post("/api/rotation", json={"current_crop": "rice"}).json()
    assert body["next_crops"][0]["nitrogen_role"] == "nitrogen_fixer"


def test_rotation_respects_provided_soil(client):
    body = client.post(
        "/api/rotation",
        json={"current_crop": "cotton", "N": 60, "P": 40, "K": 45,
              "temperature": 26, "humidity": 70, "ph": 6.8, "rainfall": 120},
    ).json()
    assert body["projected_soil"]["soil_estimated"] is False
    assert len(body["next_crops"]) > 0


def test_rotation_perennial_has_no_successor(client):
    body = client.post("/api/rotation", json={"current_crop": "mango"}).json()
    assert body["is_perennial"] is True
    assert body["next_crops"] == []


def test_rotation_unknown_crop_404(client):
    r = client.post("/api/rotation", json={"current_crop": "zucchini"})
    assert r.status_code == 404
