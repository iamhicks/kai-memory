/**
 * Telegram Message Queue for FLOW Forwarding
 * Used by OpenClaw to queue Telegram messages for forwarding
 */

const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.join(__dirname, 'pending-telegram-messages.json');
const MAX_QUEUE_SIZE = 100;

// Initialize queue file
function initQueue() {
  if (!fs.existsSync(QUEUE_FILE)) {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify({ messages: [], lastUpdated: new Date().toISOString() }, null, 2));
  }
}

/**
 * Add a Telegram message to the forwarding queue
 * @param {Object} message - The message to queue
 * @param {string} message.id - Unique message ID
 * @param {string} message.text - Message content
 * @param {string} message.sender - Sender name
 * @param {string} message.timestamp - ISO timestamp
 */
function queueMessage(message) {
  initQueue();
  
  try {
    const data = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    
    // Check if already queued
    const exists = data.messages.some(m => m.id === message.id);
    if (exists) {
      return false;
    }
    
    // Add to queue
    data.messages.push({
      id: message.id,
      text: message.text,
      sender: message.sender,
      timestamp: message.timestamp || new Date().toISOString(),
      queuedAt: new Date().toISOString()
    });
    
    // Limit queue size
    if (data.messages.length > MAX_QUEUE_SIZE) {
      data.messages = data.messages.slice(-MAX_QUEUE_SIZE);
    }
    
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(data, null, 2));
    
    return true;
  } catch (e) {
    console.error('Failed to queue message:', e);
    return false;
  }
}

/**
 * Get queue stats
 */
function getStats() {
  initQueue();
  
  try {
    const data = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    return {
      queued: data.messages.length,
      lastUpdated: data.lastUpdated
    };
  } catch (e) {
    return { queued: 0, lastUpdated: null };
  }
}

module.exports = {
  queueMessage,
  getStats
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'add' && args[1]) {
    const success = queueMessage({
      id: args[1],
      text: args[2] || 'Test message',
      sender: args[3] || 'Test User',
      timestamp: new Date().toISOString()
    });
    console.log(success ? '✅ Message queued' : '⚠️ Already queued or error');
  } else if (args[0] === 'stats') {
    console.log(getStats());
  } else {
    console.log('Usage: node telegram-queue.js add <msgId> <text> [sender]');
    console.log('       node telegram-queue.js stats');
  }
}
