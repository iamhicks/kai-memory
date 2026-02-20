#!/bin/bash
cd ~/Documents/Kai/Repos/mind
pkill -f "node.*mind/server" 2>/dev/null
sleep 1
node server/index.js > /tmp/mind-server.log 2>&1 &
echo "Server started. Checking log..."
sleep 2
cat /tmp/mind-server.log
