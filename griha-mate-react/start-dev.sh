#!/bin/bash

echo "🔍 Checking for processes on port 3000..."

# Kill all Node.js processes
killall -9 node 2>/dev/null

# Wait for port to be freed
sleep 2

# Check if port is still in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is still in use!"
    echo "   Please close any browser tabs pointing to localhost:3000"
    echo "   Then run this script again or run: npm run dev"
    exit 1
fi

echo "✅ Port 3000 is free!"
echo "🚀 Starting React development server on port 3000..."

# Start the dev server
npm run dev


