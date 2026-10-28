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
