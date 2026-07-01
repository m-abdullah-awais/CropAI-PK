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
    assert body["n_crops_recommendation"] == 22
    assert body["n_crops_yield"] == 13


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


def test_yield_unavailable_crop_is_graceful(client):
    r = client.post("/api/yield", json={"crop": "cotton", "year": 2024})
    assert r.status_code == 200
    assert r.json()["available"] is False


def test_yield_history(client):
    body = client.get("/api/yield/history/sugarcane").json()
    assert body["available"] is True
    assert len(body["series"]) > 0


def test_rotation_known_crop(client):
    body = client.get("/api/rotation/rice").json()
    assert body["season"] == "Kharif"
    assert len(body["recommended_next"]) > 0


def test_rotation_unknown_crop_404(client):
    assert client.get("/api/rotation/zucchini").status_code == 404
