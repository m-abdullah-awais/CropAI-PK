# CropAI PK — Crop Recommendation, Yield & Rotation

A full-stack web application for Pakistani agriculture with three capabilities:

1. **Crop Recommendation** — soil (N, P, K, pH) + live weather → best crops, ranked.
2. **Yield Prediction** — crop + year + climate → expected yield (t/ha) + history chart.
3. **Rotation Planning** — a crop → what to plant next, what to avoid, and why.

## Architecture

```
e:\SM\
  data/       shared datasets (CSV) + methodology README
  scripts/    PowerShell dataset generator
  backend/    FastAPI + scikit-learn ML service        (port 8077)
  frontend/   Next.js 16 (App Router, pnpm, Tailwind v4) (port 3007)
```

The browser talks only to Next.js. Next.js route handlers proxy ML calls to the
FastAPI backend (no CORS) and call Open-Meteo for weather. Three separate models,
chained in the UI: recommendation → rotation / yield.

## Prerequisites

- **Node 18+ and pnpm** (frontend).
- **Python 3.11+** — a real interpreter, not the Microsoft Store stub. The
  project was built with Python 3.14 via the `py` launcher.

## Run the backend (terminal 1)

```powershell
cd e:\SM\backend
py -3.14 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m training.eval_report          # train models (once)
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir . --port 8077
```

Docs at http://localhost:8077/docs · health at http://localhost:8077/health

## Run the frontend (terminal 2)

```powershell
cd e:\SM\frontend
pnpm install
# .env.local already points API_URL at http://127.0.0.1:8077
pnpm dev
```

Open http://localhost:3007

> Ports 8077/3007 are used because 8000/3000 are occupied by other apps on this
> machine. Change them in `backend/.env` and `frontend/package.json` if needed.

## Honesty notes

- The **recommendation** model trains on reference-grounded *synthetic* data
  (real measured ranges for 7 crops, published Pakistani agronomic ranges for 8).
  High accuracy is expected and is **not** proof of field validity.
- **Yield** uses real FAO data for **7 crops only** — no cotton or sugarcane.
  Measured through **2024** for wheat/rice/maize/potato/soybean (via Our World in
  Data) and 2013 for sorghum/sweet potato; 2025–2026 are trend projections, flagged
  as such. Unsupported crops return a graceful "not available" state.
- Weather **rainfall** from Open-Meteo is recent precipitation, not the seasonal
  total the model expects — it is auto-filled but flagged for the user to verify.

See `data/README.md` for full dataset methodology and `backend/README.md` for the
ML/API details.
