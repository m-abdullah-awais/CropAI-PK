# syntax=docker/dockerfile:1
# CropAI PK frontend (Next.js 16, standalone output).
# Build context: frontend/ - see docker-compose.yml.

# ---- deps: install node_modules from the lockfile ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm@11.8.0
# pnpm-workspace.yaml pins ignoredBuiltDependencies - copy it so install
# behaves exactly like local dev.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Slow-network tolerance (written as .npmrc because pnpm reads that).
RUN printf 'fetch-timeout=1200000\nfetch-retries=5\nfetch-retry-maxtimeout=120000\n' > .npmrc
# Cache the store so a retried build resumes instead of starting over.
# --ignore-scripts: the only deps with build scripts (sharp, unrs-resolver)
# are intentionally skipped in local dev too (see pnpm-workspace.yaml);
# without the flag pnpm 11 treats the skip as a hard error in fresh envs.
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --store-dir /root/.pnpm-store \
    --ignore-scripts

# ---- build: compile the standalone production server ----
FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@11.8.0
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---- run: minimal runtime image (no node_modules install) ----
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# server.js reads PORT/HOSTNAME; API_URL (backend base) is injected by compose.
ENV PORT=4319
ENV HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 4319
CMD ["node", "server.js"]
