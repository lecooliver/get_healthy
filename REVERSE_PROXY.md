# Reverse Proxy Configuration for Get Healthy

This document explains how to deploy the Get Healthy application behind a reverse proxy (nginx, Caddy, Traefik, etc.) with a proper domain name or subdomain.

## Overview

The application consists of:
- **Frontend** (Vue.js SPA) - serves static files via nginx
- **Backend** (Express.js API) - handles API requests
- **Database** (PostgreSQL) - data storage

When using a reverse proxy, the proxy handles SSL termination and routes traffic to the appropriate service.

## Architecture

```
Internet → Reverse Proxy (nginx/Caddy) → Docker Containers
                                    ├── Frontend (port 80)
                                    └── Backend (port 3000)
```

## Option 1: Single Domain with Path-Based Routing

### DNS Configuration
Point your domain to your server:
```
A    gethealthy.example.com     → 192.0.2.10
```

### Reverse Proxy Configuration (nginx)

```nginx
# /etc/nginx/sites-available/gethealthy.example.com

server {
    listen 80;
    server_name gethealthy.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gethealthy.example.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/gethealthy.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gethealthy.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - all non-API requests
    location / {
        proxy_pass http://127.0.0.1:8025;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded files
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Docker Compose Override

Create `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  frontend:
    ports:
      - "8025:80"  # Expose frontend to localhost only
    environment:
      - VITE_API_URL=/api  # Relative URL for same-domain deployment

  backend:
    ports:
      - "127.0.0.1:3000:3000"  # Expose to localhost only
    environment:
      - FRONTEND_URL=https://gethealthy.example.com
      - NODE_ENV=production
```

## Option 2: Subdomain-Based Routing

### DNS Configuration
```
A    gethealthy.example.com     → 192.0.2.10
A    api.gethealthy.example.com → 192.0.2.10
```

### Reverse Proxy Configuration (nginx)

```nginx
# Frontend: gethealthy.example.com
server {
    listen 443 ssl http2;
    server_name gethealthy.example.com;

    ssl_certificate /etc/letsencrypt/live/gethealthy.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gethealthy.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8025;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API: api.gethealthy.example.com
server {
    listen 443 ssl http2;
    server_name api.gethealthy.example.com;

    ssl_certificate /etc/letsencrypt/live/gethealthy.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gethealthy.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker Compose Environment

```yaml
# docker-compose.override.yml
services:
  frontend:
    ports:
      - "8025:80"
    environment:
      - VITE_API_URL=https://api.gethealthy.example.com

  backend:
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - FRONTEND_URL=https://gethealthy.example.com
      - NODE_ENV=production
      - CORS_ORIGIN=https://gethealthy.example.com
```

## Option 3: Using Caddy (Simpler Alternative)

Caddy automatically handles SSL certificates via Let's Encrypt.

### Caddyfile

```
gethealthy.example.com {
    reverse_proxy /api/* localhost:3000
    reverse_proxy /uploads/* localhost:3000
    reverse_proxy localhost:8025
}
```

### Docker Compose for Caddy

```yaml
services:
  caddy:
    image: caddy:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - frontend
      - backend

volumes:
  caddy_data:
  caddy_config:
```

## Important Environment Variables

### Backend (.env or docker-compose)
```env
NODE_ENV=production
FRONTEND_URL=https://gethealthy.example.com
JWT_SECRET=your-super-secret-jwt-key-change-this
DATABASE_URL=postgresql://user:pass@db:5432/get_healthy

# OAuth callbacks must use the public domain
GOOGLE_CALLBACK_URL=https://gethealthy.example.com/api/auth/oidc/google/callback
GITHUB_CALLBACK_URL=https://gethealthy.example.com/api/auth/oidc/github/callback
# ... etc
```

### Frontend (build argument or .env)
```env
VITE_API_URL=/api  # or https://api.gethealthy.example.com if using subdomain
```

## WebSocket Support (for future features)

If you plan to add WebSocket support (e.g., for real-time notifications):

```nginx
location /ws/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

## SSL Certificate with Let's Encrypt

### Using certbot with nginx:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d gethealthy.example.com
```

### Using certbot standalone (if port 80 is free):
```bash
sudo certbot certonly --standalone -d gethealthy.example.com
```

## Security Considerations

1. **Firewall**: Only expose ports 80 and 443 to the internet
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp  # SSH
   ```

2. **Docker ports**: Bind services to 127.0.0.1 to prevent direct access
   ```yaml
   ports:
     - "127.0.0.1:3000:3000"
   ```

3. **Rate limiting** (nginx):
   ```nginx
   location /api/ {
       limit_req zone=api burst=10 nodelay;
       proxy_pass http://127.0.0.1:3000;
   }
   ```

4. **Security headers**:
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
   ```

## Testing the Setup

1. Start services:
   ```bash
   docker-compose up -d
   ```

2. Check logs:
   ```bash
   docker-compose logs -f
   ```

3. Test API endpoint:
   ```bash
   curl https://gethealthy.example.com/api/auth/me
   ```

4. Access the application:
   ```
   https://gethealthy.example.com
   ```

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` in backend matches your domain
- Check `CORS_ORIGIN` environment variable
- Ensure proxy headers are set correctly

### 502 Bad Gateway
- Check if Docker containers are running: `docker-compose ps`
- Verify port mappings in docker-compose.yml
- Check container logs: `docker-compose logs backend`

### WebSocket Connection Issues
- Ensure `Upgrade` and `Connection` headers are properly set
- Check nginx `proxy_http_version 1.1` is configured

### OAuth/SSO Callback Issues
- Update callback URLs in your OAuth provider settings
- Use the public domain (not localhost) in callback URLs
- Verify `X-Forwarded-Proto` header is set to `https`

## Volume Permissions for Photo Uploads

### Problem
When mounting a host directory to `/app/uploads` in the backend container, the nodejs user (UID/GID created in Dockerfile) may not have write permissions, causing upload failures with "EACCES: permission denied" errors.

### Solution 1: Fix Permissions on Host (Recommended)
Before starting the container, ensure the host directory has the correct permissions:

```bash
# Create the uploads directory on host
mkdir -p /home/brian/Development/get_healthy/backend/uploads/photos

# Find the UID/GID of nodejs user in container
docker run --rm bmcgonag/get_healthy_backend:latest id nodejs
# Output: uid=999(nodejs) gid=999(nodejs) groups=999(nodejs)

# Set ownership on host to match container user (UID 999, GID 999)
sudo chown -R 999:999 /home/brian/Development/get_healthy/backend/uploads
```

### Solution 2: Fix Permissions via Entrypoint
Add a permission fix to the entrypoint script (`docker-entrypoint.prod.sh`):

```bash
#!/bin/sh
# Fix uploads directory permissions
chown -R nodejs:nodejs /app/uploads 2>/dev/null || true
exec "$@"
```

### Solution 3: Docker Compose Volume Configuration
In `docker-compose.yml`, use a named volume instead of bind mount:

```yaml
services:
  backend:
    image: bmcgonag/get_healthy_backend:latest
    volumes:
      - uploads_data:/app/uploads  # Named volume (recommended)
      # OR bind mount with correct permissions:
      # - ./backend/uploads:/app/uploads:rw
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://db:5432/get_healthy
      - JWT_SECRET=${JWT_SECRET}

volumes:
  uploads_data:  # Docker manages permissions automatically
```

### Solution 4: Runtime Permission Fix
If you see upload errors in logs:

```bash
# Fix permissions on running container
docker exec -u root get_healthy_backend chown -R nodejs:nodejs /app/uploads

# Or recreate container with correct permissions
docker-compose down
sudo chown -R 100:101 ./backend/uploads
docker-compose up -d
```

### Verification
Test that uploads work correctly:

```bash
# Check permissions inside container
docker exec get_healthy_backend ls -la /app/uploads

# Test upload via API
TOKEN="your-jwt-token"
curl -X POST http://localhost:8025/api/photos \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@test-image.jpg" \
  -F "category=progress"
```

### Summary of Ownership Requirements
| Directory | Owner | Purpose |
|-----------|--------|---------|
| `/app/uploads` | nodejs:nodejs (UID 999:GID 999) | Parent upload directory |
| `/app/uploads/photos` | nodejs:nodejs (UID 999:GID 999) | Photo storage |
| Host bind mount | UID 999:GID 999 | Match container nodejs user |

**Important:** The container's `nodejs` user has UID 999 and GID 999. When mounting a host directory, ensure it's owned by UID 999:GID 999:
```bash
sudo chown -R 999:999 /path/to/backend/uploads
```

## Quick Reference

| Component | Internal Port | External Access |
|-----------|---------------|-----------------|
| Frontend  | 80 (in container) | Via reverse proxy |
| Backend   | 3000 | Via reverse proxy (/api) |
| Database  | 5432 | Internal only |
| SMTP      | - | External (for emails) |

## Summary

For most deployments, **Option 1 (Single Domain)** is recommended as it:
- Uses only one domain name
- Simplifies SSL certificate management
- Works well with CORS (same origin)
- Is easier to configure
