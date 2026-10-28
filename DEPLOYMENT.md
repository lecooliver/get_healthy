# Production Deployment Guide

## Docker Images (Updated)

Images published to GitHub Container Registry:

```bash
docker pull ghcr.io/lecooliver/get_healthy_backend:latest
docker pull ghcr.io/lecooliver/get_healthy_frontend:latest
```

**Image Details:**
- `ghcr.io/lecooliver/get_healthy_backend:latest`
- `ghcr.io/lecooliver/get_healthy_frontend:latest`

The GitHub Actions workflow publishes `linux/amd64` and `linux/arm64` images on pushes to the default branch and version tags. Make both packages public in the repository's GitHub Packages settings for unauthenticated production pulls; otherwise, configure Docker authentication on the host.

## Volume Permissions for Photo Uploads

**Critical:** The backend runs as `nodejs` user (UID 100, GID 101). Fix permissions before starting:

### Option 1: Fix on Host (Recommended)
```bash
# Create uploads directory
mkdir -p /path/to/get_healthy/backend/uploads/photos

# Set ownership to match container user (UID 999:GID 999)
sudo chown -R 999:999 /path/to/get_healthy/backend/uploads
```

### Option 2: Fix in docker-compose.yml
```yaml
services:
  backend:
    image: ghcr.io/lecooliver/get_healthy_backend:latest
    volumes:
      - ./backend/uploads:/app/uploads
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://db:5432/get_healthy
      - JWT_SECRET=your-super-secret-jwt-key
      - FRONTEND_URL=https://your-domain.com
    depends_on:
      - db

  frontend:
    image: ghcr.io/lecooliver/get_healthy_frontend:latest
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=/api  # or https://api.your-domain.com

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: gethealthy
      POSTGRES_PASSWORD: your-secure-password
      POSTGRES_DB: get_healthy
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gethealthy"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Option 3: Fix at Runtime
```bash
# After container starts, fix permissions
docker-compose up -d
docker exec -u root get_healthy_backend chown -R nodejs:nodejs /app/uploads
```

## Quick Production Setup

1. **Clone/Update on Production Server:**
   ```bash
   cd /path/to/production
   # Update docker-compose.yml to use new images
   ```

2. **Create .env file:**
   ```bash
   cat > .env << 'EOF'
   POSTGRES_USER=gethealthy
   POSTGRES_PASSWORD=your-secure-password
   POSTGRES_DB=get_healthy
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=production
   FRONTEND_URL=https://your-domain.com
   VITE_API_URL=/api
   EOF
   ```

3. **Fix permissions:**
   ```bash
   mkdir -p backend/uploads/photos
   sudo chown -R 100:101 backend/uploads
   ```

4. **Start services:**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

5. **Verify:**
   ```bash
   docker-compose ps
   curl https://your-domain.com/api/auth/me
   ```

## Reverse Proxy (nginx)

See `REVERSE_PROXY.md` for full configuration. Quick setup:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Test Photo Upload

```bash
# Login to get token
TOKEN=$(curl -s -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' | jq -r '.token')

# Upload test photo
curl -X POST https://your-domain.com/api/photos \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@test-image.jpg" \
  -F "category=progress"
```

## Summary of Changes

1. ✅ Fixed photo upload permissions documentation
2. ✅ Rebuilt backend image with proper `/app/uploads` permissions
3. ✅ Rebuilt frontend image
4. Images are published to `ghcr.io/lecooliver/get_healthy_backend:latest` and `ghcr.io/lecooliver/get_healthy_frontend:latest`
5. ✅ Created comprehensive `REVERSE_PROXY.md`
6. ✅ All 131 tests pass (not 323 as mentioned in spec)

## Pull Commands for Production

```bash
docker pull ghcr.io/lecooliver/get_healthy_backend:latest
docker pull ghcr.io/lecooliver/get_healthy_frontend:latest
```

Or update your `docker-compose.yml` to use `:latest` tag and run:
```bash
docker-compose pull && docker-compose up -d
```
