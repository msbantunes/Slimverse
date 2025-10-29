# ---------- STAGE 1: Build (Vite/React) ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Manifestos + lockfiles
COPY package.json ./
COPY package-lock.json* ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./

# Instala deps (inclui dev para Vite)
RUN set -eux; \
    if [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
      corepack enable && yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci --include=dev; \
    else \
      npm install; \
    fi

# Código e build
COPY . .
RUN npm run build

# ---------- STAGE 2: Runtime (Nginx SPA) ----------
FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html

# Copia build
COPY --from=builder /app/dist ./

# Nginx:
# 1) default_server (catch-all) -> serve app e /healthz (funciona no *.easypanel.host)
# 2) redirect apex -> www (opcional p/ domínio final)
# 3) server www -> serve app oficial
RUN set -eux; \
  cat > /etc/nginx/conf.d/default.conf <<'NGINXCONF'
# 1) CATCH-ALL (default) — atende EasyPanel host e healthcheck
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;

  root   /usr/share/nginx/html;
  index  index.html;

  location ~* \.(?:js|css|woff2?|ttf|eot|png|jpe?g|gif|svg)$ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location / {
    try_files $uri /index.html;
    add_header Cache-Control "no-store";
  }

  location = /healthz {
    return 200 'ok';
    add_header Content-Type text/plain;
  }
}

# 2) REDIRECT apex -> www (só será usado quando o host for exatamente o apex)
server {
  listen 80;
  listen [::]:80;
  server_name slimverse.com.br;
  return 301 https://www.slimverse.com.br$request_uri;
}

# 3) APP em www
server {
  listen 80;
  listen [::]:80;
  server_name www.slimverse.com.br;

  root   /usr/share/nginx/html;
  index  index.html;

  location ~* \.(?:js|css|woff2?|ttf|eot|png|jpe?g|gif|svg)$ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location / {
    try_files $uri /index.html;
    add_header Cache-Control "no-store";
  }

  location = /healthz {
    return 200 'ok';
    add_header Content-Type text/plain;
  }
}
NGINXCONF

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
