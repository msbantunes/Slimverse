# ---------- STAGE 1: build (Vite/React) ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copia manifestos + possíveis lockfiles
COPY package.json ./
COPY package-lock.json* ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./

# Instala dependências INCLUINDO devDependencies (necessário para Vite)
# Detecta lockfile e usa o gerenciador correspondente
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

# Copia o restante e gera o build (Vite cria /dist)
COPY . .
RUN npm run build

# ---------- STAGE 2: produção (Nginx servindo SPA) ----------
FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html

# Copia build estático
COPY --from=builder /app/dist ./

# Config Nginx para SPA (fallback) + cache de assets
RUN set -eux; \
  cat > /etc/nginx/conf.d/default.conf <<'NGINXCONF'
server {
  listen 80;
  listen [::]:80;
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
NGINXCONF

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
