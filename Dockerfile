FROM node:lts-alpine@sha256:2867d550cf9d8bb50059a0fff528741f11a84d985c732e60e19e8e75c7239c43 AS base
RUN apk add --no-cache dumb-init
WORKDIR /usr/src/app

FROM base AS development
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY src ./src
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js", "--watch"]