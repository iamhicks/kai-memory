#!/usr/bin/env node
/**
 * Telegram to FLOW Monitor
 * Continuously monitors and forwards Telegram messages to FLOW
 * Runs as a background service
 */

const fs = require('fs');
const path = require('path');
const { getForwarder } = require('./telegram-flow-forwarder.js');

// Configuration
const CHECK_INTERVAL_MS = 5000; // Check every 5 seconds
const LOG_FILE = path.join(__dirname, 'logs', 'telegram-forwarder.log');
const STATE_FILE = path.join(__dirname, '.telegram-forwarder-state.json');

// Ensure log directory exists
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Logger
function log(level, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// Load processed message IDs
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {
    log('ERROR', `Failed to load state: ${e.message}`);
  }
  return { processedIds: [], lastCheck: null };
}

// Save processed message IDs
function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    log('ERROR', `Failed to save state: ${e.message}`);
  }
}

// Fetch messages from queue
const { getStats } = require('./telegram-queue.js');

async function fetchTelegramMessages() {
  const messagesFile = path.join(__dirname, 'pending-telegram-messages.json');
  
  if (!fs.existsSync(messagesFile)) {
    return [];
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
    const messages = data.messages || [];
    
    // Clear the queue after reading
    if (messages.length > 0) {
      fs.writeFileSync(messagesFile, JSON.stringify({ 
        messages: [], 
        lastCleared: new Date().toISOString() 
      }, null, 2));
    }
    
    return messages;
  } catch (e) {
    log('ERROR', `Failed to read messages: ${e.message}`);
    return [];
  }
}

// Main monitoring loop
async function monitor() {
  const forwarder = getForwarder();
  const state = loadState();
  
  log('INFO', '📡 Telegram to FLOW Forwarder started');
  log('INFO', `⏱️  Check interval: ${CHECK_INTERVAL_MS}ms`);
  
  // Check FLOW connection
  const connected = await forwarder.checkConnection();
  if (!connected) {
    log('WARN', '⚠️  FLOW server not available. Waiting for it to start...');
  } else {
    log('INFO', '✅ Connected to FLOW server');
  }
  
  // Processing loop
  setInterval(async () => {
    try {
      // Check FLOW connection
      const isConnected = await forwarder.checkConnection();
      if (!isConnected) {
        log('WARN', 'FLOW server not available, skipping check...');
        return;
      }
      
      // Fetch pending messages
      const messages = await fetchTelegramMessages();
      
      if (messages.length > 0) {
        log('INFO', `📨 Found ${messages.length} message(s) to forward`);
        
        for (const message of messages) {
          // Skip already processed
          if (state.processedIds.includes(message.id)) {
            continue;
          }
          
          // Forward to FLOW
          const success = await forwarder.forwardMessage(message);
          
          if (success) {
            state.processedIds.push(message.id);
            // Keep only last 1000 IDs to prevent memory bloat
            if (state.processedIds.length > 1000) {
              state.processedIds = state.processedIds.slice(-1000);
            }
          }
        }
        
        // Save state
        state.lastCheck = new Date().toISOString();
        saveState(state);
      }
    } catch (e) {
      log('ERROR', `Monitor error: ${e.message}`);
    }
  }, CHECK_INTERVAL_MS);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('INFO', '🛑 Shutting down forwarder...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('INFO', '🛑 Shutting down forwarder...');
  process.exit(0);
});

// Start monitoring
monitor().catch(e => {
  log('ERROR', `Fatal error: ${e.message}`);
  process.exit(1);
});
