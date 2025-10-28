# ---------- STAGE 1: build (Vite) ----------
FROM node:20-alpine AS builder

# Definições básicas
WORKDIR /app

# Instala dependências de build
# Dica: se você usa pnpm ou yarn, troque os comandos abaixo.
COPY package*.json ./
RUN npm ci

# Copia o restante do projeto e gera o build
COPY . .
# Vite: gera /dist
RUN npm run build


# ---------- STAGE 2: produção (Nginx) ----------
FROM nginx:1.27-alpine AS runner

# Diretório padrão do Nginx para arquivos estáticos
WORKDIR /usr/share/nginx/html

# Copia o build gerado
COPY --from=builder /app/dist ./

# Gera uma configuração Nginx otimizada para SPA (fallback para /index.html)
# e com cache estático para assets.
RUN <<'EOF' bash
cat >/etc/nginx/conf.d/default.conf <<'NGINXCONF'
server {
    listen 80;
    listen [::]:80;
    server_name _;

    # Arquivos gerados pelo Vite
    root   /usr/share/nginx/html;
    index  index.html;

    # Gzip simples (nginx alpine já vem com gzip; podemos ligar de forma segura)
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    # Cache agressivo para assets com hash no nome (Vite gera com hash)
    location ~* \.(?:js|css|woff2?|ttf|eot|png|jpe?g|gif|svg)$ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # SPA fallback – roteamento do React
    location / {
        try_files $uri /index.html;
        add_header Cache-Control "no-store";
    }

    # Saúde simples
    location = /healthz {
        return 200 'ok';
        add_header Content-Type text/plain;
    }
}
NGINXCONF
EOF

# Healthcheck básico
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/healthz || exit 1

# Exponha a porta HTTP
EXPOSE 80

# Processo padrão do Nginx
CMD ["nginx", "-g", "daemon off;"]
