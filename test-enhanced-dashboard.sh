#!/bin/bash

# DLV Enhanced Dashboard Test Script
echo "🎨 Testing Enhanced DLV Dashboard..."

# Test backend health
echo "1. Testing backend health..."
HEALTH_RESPONSE=$(curl -s http://localhost:8080/health)
if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
    echo "   ✅ Backend is healthy"
else
    echo "   ❌ Backend is not responding"
    exit 1
fi

# Test login
echo "2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
    echo "   ✅ Login successful"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "   🔑 Token: ${TOKEN:0:20}..."
else
    echo "   ❌ Login failed"
    echo "   📝 Response: $LOGIN_RESPONSE"
fi

# Test frontend
echo "3. Testing frontend..."
FRONTEND_RESPONSE=$(curl -s -I http://localhost:5173 | head -1)
if [[ $FRONTEND_RESPONSE == *"200"* ]]; then
    echo "   ✅ Frontend is accessible"
else
    echo "   ❌ Frontend is not accessible"
fi

echo ""
echo "🎯 New Features Available:"
echo "   📊 Professional Dashboard UI with gradient background"
echo "   🎛️  Single navigation bar (no more duplicates)"
echo "   📋 Dashboard Management (Create/Edit/Delete)"
echo "   🔐 Permission System (Read/Write roles)"
echo "   🎨 Enhanced Node Icons (Spark, Kafka, Airflow, Database)"
echo "   📈 Real-time Metrics in Navigation Bar"
echo "   🔄 Dashboard Switching"
echo ""
echo "🌐 Access the enhanced dashboard:"
echo "   1. Open browser: http://localhost:5173"
echo "   2. Login with: admin / admin123"
echo "   3. Explore the new professional interface!"
echo ""
echo "✨ Key Improvements:"
echo "   - Modern gradient design"
echo "   - Professional color scheme"
echo "   - Better typography and spacing"
echo "   - Enhanced user experience"
echo "   - Permission-based access control"
