/**
 * Kai Reply Forwarder
 * Posts AI replies to FLOW so conversations are complete
 * NOW WITH INSTANT CHANNEL DETECTION (no delays)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

class KaiReplyForwarder {
  constructor(flowUrl = 'http://localhost:3457') {
    this.flowUrl = flowUrl;
    this.messagesPath = path.join('/Users/peteroberts/Documents/Kai/Repos/flow-dev', 'data', 'messages.json');
  }

  /**
   * Parse channel from message text immediately (INSTANT - no file read needed)
   * @param {string} text - The message text to parse
   * @returns {string} - The target channel
   */
  parseChannelFromText(text) {
    const prefixMatch = text.match(/^\/(\w+)\s/);
    if (prefixMatch) {
      const roleMap = {
        'general': 'general',
        'code': 'code', 'dev': 'code', 'developer': 'code',
        'design': 'design', 'ui': 'design', 'ux': 'design',
        'strategy': 'strategy', 'strat': 'strategy',
        'debug': 'debug', 'bug': 'debug',
        'marketing': 'marketing', 'mkt': 'marketing',
        'research': 'research', 'r&d': 'research',
        'writing': 'writing', 'copy': 'writing',
        'legal': 'legal', 'law': 'legal',
        'finance': 'finance', 'fin': 'finance',
        'trading': 'trading', 'trade': 'trading'
      };
      return roleMap[prefixMatch[1].toLowerCase()] || 'general';
    }
    return 'general';
  }

  /**
   * Get the channel for a message by ID (fallback method)
   * @param {string} messageId - The original message ID
   * @returns {string} - The channel (general, code, marketing, etc.)
   */
  _getMessageChannel(messageId) {
    try {
      if (fs.existsSync(this.messagesPath)) {
        const data = JSON.parse(fs.readFileSync(this.messagesPath, 'utf8'));
        const msg = data.messages.find(m => m.id === messageId);
        if (msg) {
          return msg.targetChannel || 'general';
        }
      }
    } catch (e) {
      console.error('Error reading message channel:', e);
    }
    return 'general';
  }

  /**
   * Forward a reply to FLOW - INSTANT with auto-detected channel
   * @param {Object} reply - The reply to forward
   * @param {string} reply.text - Reply content
   * @param {string} reply.inReplyTo - Original message ID
   * @param {string} reply.originalText - Original message text (for instant channel detection)
   * @param {string} reply.channel - Optional: override channel
   */
  async forwardReply(reply) {
    // INSTANT: Parse channel from original text if provided, otherwise lookup by ID
    let channel;
    if (reply.channel) {
      channel = reply.channel;
    } else if (reply.originalText) {
      channel = this.parseChannelFromText(reply.originalText);  // INSTANT - no delay
    } else if (reply.inReplyTo) {
      channel = this._getMessageChannel(reply.inReplyTo);  // Fallback - requires file read
    } else {
      channel = 'general';
    }
    
    const payload = {
      id: `kai_${Date.now()}`,
      text: reply.text,
      sender: 'Kai',
      senderType: 'ai',
      channel: 'telegram',
      channelName: 'Telegram',
      targetChannel: channel,
      inReplyTo: reply.inReplyTo,
      timestamp: new Date().toISOString(),
      via: 'kai-reply'
    };

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      
      const options = {
        hostname: 'localhost',
        port: 3457,
        path: '/api/receive',
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
            const result = JSON.parse(body);
            if (result.success) {
              console.log('✅ Reply forwarded to FLOW:', channel);
              resolve(true);
            } else {
              console.error('❌ FLOW rejected reply:', result.error);
              resolve(false);
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', (err) => {
        console.error('❌ Failed to forward reply:', err.message);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
  }
}

// Singleton
let forwarderInstance = null;

function getReplyForwarder() {
  if (!forwarderInstance) {
    forwarderInstance = new KaiReplyForwarder();
  }
  return forwarderInstance;
}

module.exports = {
  KaiReplyForwarder,
  getReplyForwarder
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length >= 2) {
    const channel = args[0];
    const text = args.slice(1).join(' ');
    getReplyForwarder().forwardReply({ channel, text });
  } else {
    console.log('Usage: node kai-reply-forwarder.js <channel> <text>');
    console.log('Example: node kai-reply-forwarder.js code "This is my reply"');
  }
}
