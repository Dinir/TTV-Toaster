#!/bin/bash

echo "Starting Twitch Toaster..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found!"
    echo "Please copy .env.example to .env and add your Twitch credentials."
    echo ""
    read -p "Press enter to exit..."
    exit 1
fi

# Start the server and open browser
echo "Starting server on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# Open browser (works on macOS and most Linux)
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
fi

npm start
