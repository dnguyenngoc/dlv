#!/bin/bash

# DLV Development Setup Script
# This script starts the backend + database in Docker and frontend locally

echo "🚀 Starting DLV Development Environment..."

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Start backend and database
echo "🐳 Starting PostgreSQL and Backend..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📊 Services running:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Backend API: http://localhost:8080"
echo ""
echo "🎯 Next steps:"
echo "   1. Open a new terminal"
echo "   2. cd ui"
echo "   3. npm run dev"
echo ""
echo "🌐 Then visit: http://localhost:5173"
echo ""
echo "📝 To stop services: docker-compose -f docker-compose.dev.yml down"
