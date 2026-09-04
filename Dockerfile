# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.10.0-alpine
ARG NGINX_VERSION=stable-alpine

FROM node:${NODE_VERSION} AS build
WORKDIR /app

# The commit this image was built from, inlined into the bundle so the running
# front end can say which code it is. A stale front end is otherwise
# indistinguishable from a current one.
ARG GIT_COMMIT=unknown
ENV VITE_BUILD_COMMIT=$GIT_COMMIT

# Dependencies on their own layer, so editing a component does not refetch the
# whole tree. Scripts run here: esbuild fetches its platform binary that way.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts index.html ./

# The production API origin, inlined by Vite at build time.
#
# Without this file the build still succeeds and VITE_API_URL is simply empty,
# so every deployed request goes same-origin — the browser asks the *front end*
# host for /api/v1/... and gets nginx's SPA fallback: an HTML page, HTTP 200,
# and a JSON parse error in the console. It fails at runtime, in production
# only, and looks like a backend problem. Copying it is what prevents that.
COPY .env.production ./
COPY public ./public
COPY src ./src
# Not shipped, but tsconfig.node.json typechecks it as part of `tsc -b`.
COPY scripts ./scripts

# `tsc -b && vite build` — the typecheck is part of the build, so a type error
# fails the image rather than shipping.
RUN npm run build


FROM nginx:${NGINX_VERSION} AS runtime

ARG GIT_COMMIT=unknown
LABEL org.opencontainers.image.revision=$GIT_COMMIT

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Node tooling is left behind in the build stage: what ships is nginx plus a
# directory of static files, with no npm, no source and no lockfile.
EXPOSE 80

# The base image already sets `STOPSIGNAL SIGQUIT`, which containerd honours,
# so the rollout drains connections instead of severing them.
