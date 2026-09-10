# Single image serving both the React frontend and the FastAPI backend.
#
# Stage 1 builds the static site; stage 2 copies it next to the API, which
# serves it (see the SPA block at the bottom of backend/app/main.py). One
# container means one Render service and no cross-origin requests in
# production.
#
# Build locally with:
#   docker build -t auronix .
#   docker run --rm -p 8000:8000 --env-file backend/.env auronix

# ---------------------------------------------------------------- frontend --
FROM node:20-alpine AS frontend

WORKDIR /build

# Install dependencies first so this layer is cached until the lockfile moves.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

# Baked in at build time by Vite. A relative path keeps the browser talking to
# whatever host serves the page, so no deploy URL is hardcoded into the bundle.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ----------------------------------------------------------------- backend --
FROM python:3.12-slim AS runtime

# PYTHONUNBUFFERED keeps logs streaming to Render rather than sitting in a buffer.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

WORKDIR /app

# curl is used by the container healthcheck below. psycopg2-binary and Pillow
# ship manylinux wheels, so no compiler toolchain is required here.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

# The compiled site lands where main.py looks for it (backend/static).
COPY --from=frontend /build/dist ./static

# Drop privileges. uploads/ must be writable because main.py creates it on boot.
RUN useradd --create-home --uid 10001 appuser \
    && mkdir -p /app/uploads \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS "http://127.0.0.1:${PORT}/health" || exit 1

# Render injects PORT and it can change between deploys, so bind it at runtime
# rather than baking a number in — hence the shell, for the expansion.
# "exec" replaces that shell with uvicorn so it becomes PID 1 and receives
# SIGTERM directly; without it the signal stops at the shell and Render's
# graceful shutdown degrades into a hard kill.
# One worker suits a 512MB free instance; raise it with more memory.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1 --proxy-headers --forwarded-allow-ips=*"]
