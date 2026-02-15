#!/usr/bin/env node
/**
 * Cron job: Forward queued Telegram messages to FLOW
 * Called by OpenClaw cron system
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const QUEUE_FILE = path.join(__dirname, 'pending-telegram-messages.json');
const PROCESSED_FILE = path.join(__dirname, 'processed-messages.json');

// Load processed message IDs
function loadProcessed() {
  if (!fs.existsSync(PROCESSED_FILE)) return new Set();
  try {
    const data = JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf8'));
    return new Set(data.ids || []);
  } catch (e) {
    return new Set();
  }
}

// Save processed message IDs
function saveProcessed(processed) {
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify({
    ids: Array.from(processed),
    lastUpdated: new Date().toISOString()
  }, null, 2));
}

// Forward message to FLOW
function forwardToFlow(message) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      id: message.id,
      text: message.text,
      sender: message.sender || 'Unknown',
      senderType: 'human',
      channel: 'telegram',
      channelName: 'Telegram',
      timestamp: message.timestamp || new Date().toISOString()
    });

    const options = {
      hostname: 'localhost',
      port: 3457,
      path: '/api/receive',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result.success || false);
        } catch (e) {
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.write(payload);
    req.end();
  });
}

async function main() {
  // Check if queue file exists
  if (!fs.existsSync(QUEUE_FILE)) {
    console.log('[Cron] No queue file found');
    process.exit(0);
  }

  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  const processed = loadProcessed();
  const toForward = queue.messages.filter(m => !processed.has(m.id));

  if (toForward.length === 0) {
    console.log('[Cron] No new messages to forward');
    process.exit(0);
  }

  console.log(`[Cron] Forwarding ${toForward.length} message(s)...`);
  let successCount = 0;

  for (const msg of toForward) {
    const success = await forwardToFlow(msg);
    if (success) {
      processed.add(msg.id);
      successCount++;
      console.log(`  ✅ ${msg.id}`);
    } else {
      console.log(`  ❌ ${msg.id}`);
    }
  }

  saveProcessed(processed);
  console.log(`[Cron] Done: ${successCount}/${toForward.length} forwarded`);
}

main().catch(console.error);
