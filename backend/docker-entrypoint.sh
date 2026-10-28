#!/bin/bash

echo "Waiting for database..."
sleep 2

echo "Running database migrations..."
echo "=========================================="
npx prisma migrate deploy 2>&1 || {
    echo "=========================================="
    echo "Migration failed! Trying schema push..."
    echo "=========================================="
    npx prisma db push --accept-data-loss 2>&1 || {
        echo "=========================================="
        echo "Schema push failed! Resetting database..."
        echo "=========================================="
        npx prisma migrate reset --force 2>&1
        npx prisma migrate deploy 2>&1
    }
}
echo "=========================================="

echo "Starting development server..."
npm run dev
