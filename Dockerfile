RUN set -eux; \
  cat > /etc/nginx/conf.d/default.conf <<'NGINXCONF'
# Redirect raiz -> www (somente para requisições externas)
server {
  listen 80;
  listen [::]:80;
  server_name slimverse.com.br;
  
  # Se o pedido for de localhost (healthcheck interno), não redireciona
  if ($host = "127.0.0.1") {
    return 200 'ok';
    add_header Content-Type text/plain;
  }

  return 301 https://www.slimverse.com.br$request_uri;
}

# App principal
server {
  listen 80;
  listen [::]:80;
  server_name www.slimverse.com.br _;

  root   /usr/share/nginx/html;
  index  index.html;

  # Cache para assets
  location ~* \.(?:js|css|woff2?|ttf|eot|png|jpe?g|gif|svg)$ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # SPA fallback
  location / {
    try_files $uri /index.html;
    add_header Cache-Control "no-store";
  }

  # Healthcheck real
  location = /healthz {
    return 200 'ok';
    add_header Content-Type text/plain;
  }
}
NGINXCONF
