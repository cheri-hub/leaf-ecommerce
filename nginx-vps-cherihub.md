# Nginx VPS — cherihub.cloud

> Arquivo: `/etc/nginx/sites-available/cherihub`
>
> Após editar, validar e recarregar:
> ```bash
> sudo nginx -t
> sudo systemctl reload nginx
> ```

```nginx
# ============================================
# HTTP -> HTTPS Redirect
# ============================================
server {
    if ($host = vl08.cherihub.cloud) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = leaf-parfum.cherihub.cloud) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = ja-quiz-ia.cherihub.cloud) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = datageoplan-python-api.cherihub.cloud) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = www.cherihub.cloud) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = cherihub.cloud) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = djiag-api.cherihub.cloud) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name cherihub.cloud www.cherihub.cloud datageoplan-python-api.cherihub.cloud djiag-api.cherihub.cloud ja-quiz-ia.cherihub.cloud leaf-parfum.cherihub.cloud;
    return 301 https://$host$request_uri;
}

# ============================================
# HOME - cherihub.cloud
# ============================================
server {
    listen 443 ssl;
    server_name cherihub.cloud www.cherihub.cloud;
    ssl_certificate /etc/letsencrypt/live/djiag-api.cherihub.cloud/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/djiag-api.cherihub.cloud/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# ============================================
# DATAGEOPLAN-PYTHON-API
# ============================================
server {
    listen 443 ssl;
    server_name datageoplan-python-api.cherihub.cloud;
    ssl_certificate /etc/letsencrypt/live/djiag-api.cherihub.cloud/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/djiag-api.cherihub.cloud/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        client_max_body_size 100M;
    }
}

# ============================================
# LEAF ECOMMERCE - leaf-parfum.cherihub.cloud
# ============================================
server {
    listen 443 ssl;
    server_name leaf-parfum.cherihub.cloud;
    ssl_certificate /etc/letsencrypt/live/djiag-api.cherihub.cloud/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/djiag-api.cherihub.cloud/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend (Next.js :3003)
    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (ASP.NET Core :5000)
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Hangfire dashboard
    location /hangfire {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ============================================
# DJIAG-API - DJI Agriculture API
# ============================================
server {
    listen 443 ssl;
    server_name djiag-api.cherihub.cloud;
    ssl_certificate /etc/letsencrypt/live/djiag-api.cherihub.cloud/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/djiag-api.cherihub.cloud/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:8002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}

# ============================================
# JA-QUIZ-IA - Projeto JA
# ============================================
server {
    listen 443 ssl;
    server_name ja-quiz-ia.cherihub.cloud;
    ssl_certificate /etc/letsencrypt/live/djiag-api.cherihub.cloud/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/djiag-api.cherihub.cloud/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8003/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```
