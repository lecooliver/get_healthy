# Production Fix - Photo Upload Issue

## Problem
Photo uploads failing in production with:
```
Error: ENOENT: no such file or directory, open '/app/uploads/photos/1777917094334-98660323.png'
```

Root cause: The `/app/uploads/photos/` directory doesn't exist or has wrong permissions in the production container.

## Fixes Applied

### 1. Backend Entrypoint Fix (`backend/docker-entrypoint.prod.sh`)
Added directory creation and permission setup at container startup:

```bash
#!/bin/bash

echo "Checking database connection and schema..."
npx prisma db push --accept-data-loss 2>/dev/null || {
  echo "Schema push failed, trying migrate..."
  npx prisma migrate deploy 2>/dev/null || true
}

echo "Setting up uploads directory..."
mkdir -p /app/uploads/photos
chown -R nodejs:nodejs /app/uploads 2>/dev/null || true
chmod -R 755 /app/uploads 2>/dev/null || true

echo "Starting server..."
exec node src/index.js
```

### 2. Frontend Nginx Config Fix (`frontend/nginx.conf`)
Added upload handling to prevent buffering issues:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Allow file uploads up to 10MB
    client_max_body_size 10M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Handle file uploads - disable buffering
        proxy_buffering off;
        proxy_request_buffering off;
    }

    location /uploads/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Handle file uploads
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

## Images Rebuilt & Pushed

```bash
bmcgonag/get_healthy_backend:latest    (fixed entrypoint)
bmcgonag/get_healthy_frontend:latest  (fixed nginx upload config)
```

## To Update Production

### Option 1: Pull and Restart
```bash
docker-compose pull
docker-compose down
docker-compose up -d
```

### Option 2: Manual Pull
```bash
docker pull bmcgonag/get_healthy_backend:latest
docker pull bmcgonag/get_healthy_frontend:latest
docker-compose down
docker-compose up -d
```

### Verify Fix
After updating, check:
```bash
# Check uploads directory exists in backend container
docker exec get_healthy_backend ls -la /app/uploads/photos

# Check permissions
docker exec get_healthy_backend stat -c "%U:%G" /app/uploads/photos

# Test upload via API
TOKEN="your-jwt-token"
curl -X POST https://your-domain.com/api/photos \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@test.jpg" \
  -F "category=progress"
```

## Additional Notes

1. **Volume Mount**: If using bind mount for uploads, ensure host directory has correct permissions:
   ```bash
   sudo chown -R 100:101 /path/to/uploads
   ```

2. **Nginx Buffering**: The `proxy_buffering off` and `proxy_request_buffering off` directives fix the "client request body is buffered to a temporary file" warning.

3. **Upload Size**: `client_max_body_size 10M` allows photos up to 10MB. Adjust if needed.
