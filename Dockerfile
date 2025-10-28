RUN set -eux; \
  cat > /etc/nginx/conf.d/default.conf <<'NGINXCONF'
server {
  listen 80;
  listen [::]:80;
  server_name _;

  root   /usr/share/nginx/html;
  index  index.html;

  # Cache de assets com hash
  location ~* \.(?:js|css|woff2?|ttf|eot|png|jpe?g|gif|svg)$ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # SPA fallback
  location / {
    try_files $uri /index.html;
    add_header Cache-Control "no-store";
  }

  # Healthcheck
  location = /healthz {
    return 200 'ok';
    add_header Content-Type text/plain;
  }
}
NGINXCONF
