# syntax=docker/dockerfile:1
# CropAI PK backend (FastAPI + scikit-learn).
# Build context: repo ROOT (needs backend/ + the committed data/ CSVs) -
# see docker-compose.yml. Models are trained during the build from the real
# datasets, so a training failure fails the build and never ships.

# ---- deps: build the virtualenv ----
FROM python:3.14-slim AS deps
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
# Generous timeout + retries so slow networks do not fail the build.
ENV PIP_DEFAULT_TIMEOUT=120
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY backend/requirements.txt /tmp/requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --retries 10 -r /tmp/requirements.txt

# ---- train: bake model artifacts from the real datasets ----
FROM deps AS train
WORKDIR /app/backend
# config.py resolves data_dir as backend/../data and model_dir as backend/models.
COPY data /app/data
COPY backend/app ./app
COPY backend/training ./training
RUN python -m training.eval_report

# ---- run: slim runtime with venv + app + trained models ----
FROM python:3.14-slim AS run
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PATH="/opt/venv/bin:$PATH"
RUN useradd --create-home --uid 1001 appuser
COPY --from=deps /opt/venv /opt/venv
WORKDIR /app/backend
COPY data /app/data
COPY backend/app ./app
COPY --from=train /app/backend/models ./models
USER appuser
EXPOSE 9271
# Python-stdlib healthcheck (no curl in slim images).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:9271/health', timeout=4).status == 200 else 1)"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9271"]
