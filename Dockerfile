FROM node:22-alpine AS build

WORKDIR /workspace

RUN npm install -g npm@11.16.0

COPY grab-seller-product/package*.json ./grab-seller-product/
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    cd grab-seller-product \
    && npm ci

COPY grab-seller-product ./grab-seller-product
RUN cd grab-seller-product \
    && npm run build

FROM nginx:1.27-alpine AS runtime

COPY grab-seller-product/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /workspace/grab-seller-product/dist /usr/share/nginx/html

ENV API_UPSTREAM=host.docker.internal:8080 \
    NGINX_ENVSUBST_FILTER=API_UPSTREAM

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/mf-manifest.json || exit 1

