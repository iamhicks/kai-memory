#!/usr/bin/env node
// Sync Telegram messages to FlowChat - runs every 5 seconds

const http = require('http');

const FLOW_RECEIVE_URL = 'http://localhost:3456/api/receive';
const lastSyncFile = '/tmp/flow-telegram-last-sync.txt';

// Get last sync timestamp
let lastSync = 0;
try {
  const fs = require('fs');
  if (fs.existsSync(lastSyncFile)) {
    lastSync = parseInt(fs.readFileSync(lastSyncFile, 'utf8')) || 0;
  }
} catch (e) {}

const now = Date.now();

// Forward a message to FlowChat
const forwardToFlowChat = (message) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      id: message.id || 'msg_' + Date.now(),
      text: message.text,
      sender: message.sender || 'Pete',
      senderType: message.senderType || 'human',
      channel: 'telegram',
      channelName: 'Telegram',
      timestamp: message.timestamp || new Date().toISOString()
    });

    const req = http.request(FLOW_RECEIVE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let response = '';
      res.on('data', chunk => response += chunk);
      res.on('end', () => resolve(response));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

// This is a placeholder - in production, this would query OpenClaw Gateway
// For now, we'll save the timestamp for the next run
const fs = require('fs');
fs.writeFileSync(lastSyncFile, now.toString());

console.log(`[${new Date().toISOString()}] Sync check complete`);
