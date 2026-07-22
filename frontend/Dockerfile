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
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --store-dir /root/.pnpm-store

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
