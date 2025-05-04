#!/bin/bash

# This script provides a more robust way to restart the server
# - Kills any existing Node.js processes using the project's server ports
# - Then starts the server in development mode

echo "==============================================="
echo "TerraToken Backend Server Management Script"
echo "==============================================="

# Function to kill processes using a specific port
kill_port_process() {
  local PORT=$1
  echo "Checking for processes on port $PORT..."
  
  PID=$(lsof -i :$PORT -t)
  
  if [ -n "$PID" ]; then
    echo "Found process with PID $PID using port $PORT. Killing it..."
    kill -9 $PID
    echo "Process killed."
  else
    echo "No process found using port $PORT."
  fi
}

# Kill processes on common ports our app might use
kill_port_process 5000
kill_port_process 5001
kill_port_process 5002

# Kill any node processes related to our app
echo "Checking for any lingering Node.js server processes..."
pkill -f "node server.js" || true
echo "Any lingering server processes have been terminated."

# Start the server
echo "==============================================="
echo "Starting TerraToken backend server..."
echo "==============================================="
npm run dev
