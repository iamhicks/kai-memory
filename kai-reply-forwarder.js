/**
 * Kai Reply Forwarder
 * Posts AI replies to FLOW so conversations are complete
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
   * Get the channel for a message by ID
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
   * Forward a reply to FLOW - auto-detects channel from original message
   * @param {Object} reply - The reply to forward
   * @param {string} reply.text - Reply content
   * @param {string} reply.inReplyTo - Original message ID (to determine channel)
   * @param {string} reply.channel - Optional: override channel
   */
  async forwardReply(reply) {
    // Auto-detect channel from original message, or use provided channel
    const channel = reply.channel || this._getMessageChannel(reply.inReplyTo);
    
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
