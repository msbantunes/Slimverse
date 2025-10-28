# ---------- STAGE 1: Build (Vite/React) ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copia manifestos + possíveis lockfiles
COPY package.json ./
COPY package-lock.json* ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./

# Instala dependências incluindo devDependencies (Vite está em dev)
# Detecta o gerenciador pelo lockfile
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

# Copia o restante do código e gera o build (Vite cria /dist)
COPY . .
RUN npm run build


# ---------- STAGE 2: Runtime (Nginx servindo SPA) ----------
FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html

# Copia o build estático
COPY --from=builder /app/dist ./

# Configuração Nginx:
# - Server 1: redireciona slimverse.com.br -> https://www.slimverse.com.br
# - Server 2: atende www.slimverse.com.br com SPA fallback e cache de assets
RUN set -eux; \
  cat > /etc/nginx/conf.d/default.conf <<'NGINXCONF'
# Redirect raiz -> www (força HTTPS no host público)
server {
  listen 80;
  listen [::]:80;
  server_name slimverse.com.br;
  return 301 https://www.slimverse.com.br$request_uri;
}

# App principal em www
server {
  listen 80;
  listen [::]:80;
  server_name www.slimverse.com.br _;

  root   /usr/share/nginx/html;
  index  index.html;

  # Gzip básico
  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;
  gzip_min_length 1024;

  # Cache agressivo para assets com hash (gerados pelo Vite)
  location ~* \.(?:js|css|woff2?|ttf|eot|png|jpe?g|gif|svg)$ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # SPA fallback (React Router)
  location / {
    try_files $uri /index.html;
    add_header Cache-Control "no-store";
  }

  # Healthcheck simples
  location = /healthz {
    return 200 'ok';
    add_header Content-Type text/plain;
  }
}
NGINXCONF

# Healthcheck (usa busybox wget da própria imagem)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

# Porta interna
EXPOSE 80

# Processo principal
CMD ["nginx", "-g", "daemon off;"]
