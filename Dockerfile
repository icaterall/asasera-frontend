# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.10.0-alpine
ARG NGINX_VERSION=stable-alpine

FROM node:${NODE_VERSION} AS build
WORKDIR /app

# Dependencies on their own layer, so editing a component does not refetch the
# whole tree. Scripts run here: esbuild fetches its platform binary that way.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts index.html ./
COPY public ./public
COPY src ./src
# Not shipped, but tsconfig.node.json typechecks it as part of `tsc -b`.
COPY scripts ./scripts

# `tsc -b && vite build` — the typecheck is part of the build, so a type error
# fails the image rather than shipping.
RUN npm run build


FROM nginx:${NGINX_VERSION} AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Node tooling is left behind in the build stage: what ships is nginx plus a
# directory of static files, with no npm, no source and no lockfile.
EXPOSE 80

# The base image already sets `STOPSIGNAL SIGQUIT`, which containerd honours,
# so the rollout drains connections instead of severing them.
