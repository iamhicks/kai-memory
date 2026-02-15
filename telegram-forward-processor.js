#!/usr/bin/env node
/**
 * Telegram to FLOW Forwarding Processor
 * Processes pending messages and forwards them to FLOW
 * Run by cron job every few minutes
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const QUEUE_FILE = path.join(__dirname, 'pending-telegram-messages.json');
const FORWARDED_FILE = path.join(__dirname, 'telegram-forwarded-ids.json');
const FLOW_HOST = 'localhost';
const FLOW_PORT = 3457;

// Load forwarded message IDs (persistent tracking)
function loadForwardedIds() {
  if (!fs.existsSync(FORWARDED_FILE)) {
    return new Set();
  }
  try {
    const data = JSON.parse(fs.readFileSync(FORWARDED_FILE, 'utf8'));
    return new Set(data.ids || []);
  } catch (e) {
    return new Set();
  }
}

// Save forwarded message IDs
function saveForwardedIds(ids) {
  try {
    const data = { ids: Array.from(ids), lastUpdated: new Date().toISOString() };
    fs.writeFileSync(FORWARDED_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('[Forwarder] Failed to save forwarded IDs:', e.message);
  }
}

// Load pending messages
function loadPendingMessages() {
  if (!fs.existsSync(QUEUE_FILE)) {
    return [];
  }
  try {
    const data = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    return data.messages || [];
  } catch (e) {
    console.error('[Forwarder] Failed to load queue:', e.message);
    return [];
  }
}

// Save pending messages (after removing forwarded ones)
function savePendingMessages(messages) {
  try {
    const data = { messages, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('[Forwarder] Failed to save queue:', e.message);
  }
}

// POST to FLOW
function postToFlow(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: FLOW_HOST,
      port: FLOW_PORT,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ success: false, error: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Check FLOW connection
function checkFlowConnection() {
  return new Promise((resolve) => {
    const options = {
      hostname: FLOW_HOST,
      port: FLOW_PORT,
      path: '/api/clawvault/stats',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(!!data.totalMemories);
        } catch (e) {
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

// Main processing function
async function processQueue() {
  console.log('[Forwarder] Starting Telegram → FLOW processing...');
  console.log(`[Forwarder] ${new Date().toISOString()}`);
  
  // Check FLOW is available
  const connected = await checkFlowConnection();
  if (!connected) {
    console.log('[Forwarder] ❌ FLOW server not available, skipping');
    return { processed: 0, failed: 0, skipped: 0, reason: 'FLOW unavailable' };
  }
  console.log('[Forwarder] ✅ FLOW server connected');
  
  // Load state
  const forwardedIds = loadForwardedIds();
  const pendingMessages = loadPendingMessages();
  
  console.log(`[Forwarder] Queue: ${pendingMessages.length} pending, ${forwardedIds.size} already forwarded`);
  
  if (pendingMessages.length === 0) {
    console.log('[Forwarder] Nothing to forward');
    return { processed: 0, failed: 0, skipped: 0 };
  }
  
  const toForward = [];
  const alreadyForwarded = [];
  
  // Separate messages to forward vs already forwarded
  for (const msg of pendingMessages) {
    if (forwardedIds.has(msg.id)) {
      alreadyForwarded.push(msg);
    } else {
      toForward.push(msg);
    }
  }
  
  console.log(`[Forwarder] ${toForward.length} to forward, ${alreadyForwarded.length} already done`);
  
  let processed = 0;
  let failed = 0;
  const newForwardedIds = new Set();
  const failedMessages = [];
  
  // Forward each message
  for (const msg of toForward) {
    const payload = {
      id: msg.id,
      text: msg.text,
      sender: msg.sender || 'Unknown',
      senderType: 'human',
      channel: 'telegram',
      channelName: 'Telegram',
      timestamp: msg.timestamp || new Date().toISOString()
    };
    
    try {
      const response = await postToFlow('/api/receive', payload);
      
      if (response.success) {
        console.log(`[Forwarder] ✅ Forwarded: ${msg.id.substring(0, 30)}...`);
        newForwardedIds.add(msg.id);
        processed++;
      } else {
        console.error(`[Forwarder] ❌ FLOW rejected: ${msg.id.substring(0, 30)}... - ${response.error || 'Unknown error'}`);
        failedMessages.push(msg);
        failed++;
      }
    } catch (e) {
      console.error(`[Forwarder] ❌ Failed: ${msg.id.substring(0, 30)}... - ${e.message}`);
      failedMessages.push(msg);
      failed++;
    }
    
    // Small delay between requests
    await new Promise(r => setTimeout(r, 100));
  }
  
  // Update forwarded IDs
  newForwardedIds.forEach(id => forwardedIds.add(id));
  saveForwardedIds(forwardedIds);
  
  // Update queue: keep only failed messages for retry
  const remainingMessages = [...failedMessages, ...alreadyForwarded];
  savePendingMessages(remainingMessages);
  
  console.log(`[Forwarder] Done: ${processed} forwarded, ${failed} failed, ${alreadyForwarded.length} already done`);
  console.log(`[Forwarder] Queue now has ${remainingMessages.length} messages`);
  
  return { processed, failed, skipped: alreadyForwarded.length };
}

// Run if called directly
if (require.main === module) {
  processQueue()
    .then(result => {
      console.log(`[Forwarder] Result:`, result);
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch(e => {
      console.error('[Forwarder] Fatal error:', e);
      process.exit(1);
    });
}

module.exports = { processQueue };