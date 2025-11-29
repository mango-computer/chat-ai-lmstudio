#!/bin/bash

echo "🚀 Starting Chat AI Frontend..."
echo ""

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the client-chat directory"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if backend is running
echo ""
echo "🔍 Checking backend connection..."
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "✅ Backend is running!"
else
    echo "⚠️  Warning: Backend doesn't appear to be running on port 8000"
    echo "   Please start the backend server first (run ./start-backend.sh)"
fi

echo ""
echo "🌟 Starting Vite dev server on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the dev server
npm run dev

