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
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["models_loaded"] is True
    assert body["n_crops_recommendation"] == 15
    assert body["n_crops_yield"] == 9


def test_recommend_returns_ranked_crops(client):
    payload = {"N": 80, "P": 45, "K": 40, "temperature": 24,
               "humidity": 80, "ph": 6.5, "rainfall": 210, "top_n": 3}
    r = client.post("/api/recommend", json=payload)
    assert r.status_code == 200
    recs = r.json()["recommendations"]
    assert len(recs) == 3
    probs = [x["probability"] for x in recs]
    assert probs == sorted(probs, reverse=True)


def test_recommend_validation_error(client):
    bad = {"N": 80, "P": 45, "K": 40, "temperature": 24,
           "humidity": 80, "ph": 15, "rainfall": 210}  # ph out of range
    assert client.post("/api/recommend", json=bad).status_code == 422


def test_yield_available_crop(client):
    payload = {"crop": "rice", "year": 2013,
               "rainfall_mm_per_year": 500, "avg_temp": 25}
    body = client.post("/api/yield", json=payload).json()
    assert body["available"] is True
    assert body["pesticides_defaulted"] is True
    assert body["yield_t_per_ha"] > 0


def test_yield_unavailable_crop_is_graceful(client):
    payload = {"crop": "cotton", "year": 2010,
               "rainfall_mm_per_year": 400, "avg_temp": 28}
    r = client.post("/api/yield", json=payload)
    assert r.status_code == 200  # not a 500
    assert r.json()["available"] is False


def test_yield_history(client):
    body = client.get("/api/yield/history/wheat").json()
    assert body["available"] is True
    assert len(body["series"]) > 0


def test_rotation_known_crop(client):
    body = client.get("/api/rotation/wheat").json()
    assert body["season"] == "Rabi"
    assert len(body["recommended_next"]) > 0


def test_rotation_unknown_crop_404(client):
    assert client.get("/api/rotation/banana").status_code == 404
