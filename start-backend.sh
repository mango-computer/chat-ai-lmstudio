#!/bin/bash

echo "🚀 Starting Chat AI Backend..."
echo ""

# Check if we're in the right directory
if [ ! -f "backend/main.py" ]; then
    echo "❌ Error: Please run this script from the client-chat directory"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Check if LM Studio is running
echo ""
echo "🔍 Checking LM Studio connection..."
if curl -s http://localhost:1234/v1/models > /dev/null 2>&1; then
    echo "✅ LM Studio is running!"
else
    echo "⚠️  Warning: LM Studio doesn't appear to be running on port 1234"
    echo "   Please start LM Studio and load a model before using the chat"
fi

echo ""
echo "🌟 Starting FastAPI server on http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
uvicorn main:app --reload

