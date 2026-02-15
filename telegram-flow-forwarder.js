/**
 * Telegram to FLOW Auto-Forward Utility
 * Forwards Telegram messages to FLOW's /api/receive endpoint
 */

const http = require('http');

class TelegramToFlowForwarder {
  constructor(flowUrl = 'http://localhost:3457') {
    this.flowUrl = flowUrl;
    this.forwardedMessages = new Set(); // Track forwarded message IDs
  }

  /**
   * Forward a Telegram message to FLOW
   * @param {Object} message - The message to forward
   * @param {string} message.id - Message ID
   * @param {string} message.text - Message text
   * @param {string} message.sender - Sender name
   * @param {string} message.timestamp - ISO timestamp
   * @returns {Promise<boolean>} - Success status
   */
  async forwardMessage(message) {
    // Skip if already forwarded
    if (this.forwardedMessages.has(message.id)) {
      console.log(`[Forwarder] Message ${message.id} already forwarded, skipping`);
      return true;
    }

    const payload = {
      id: message.id,
      text: message.text,
      sender: message.sender || 'Unknown',
      senderType: 'human',
      channel: 'telegram',
      channelName: 'Telegram',
      timestamp: message.timestamp || new Date().toISOString()
    };

    try {
      const response = await this._post('/api/receive', payload);
      
      if (response.success) {
        this.forwardedMessages.add(message.id);
        console.log(`[Forwarder] ✅ Forwarded message ${message.id} to FLOW`);
        return true;
      } else {
        console.error(`[Forwarder] ❌ FLOW rejected message:`, response.error);
        return false;
      }
    } catch (e) {
      console.error(`[Forwarder] ❌ Failed to forward:`, e.message);
      return false;
    }
  }

  /**
   * Check if FLOW server is running
   */
  async checkConnection() {
    try {
      const response = await this._get('/api/clawvault/stats');
      return response && typeof response.totalMemories === 'number';
    } catch (e) {
      return false;
    }
  }

  _post(path, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      
      const options = {
        hostname: 'localhost',
        port: 3457,
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

  _get(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3457,
        path: path,
        method: 'GET'
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(null);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }
}

// Singleton instance
let forwarderInstance = null;

function getForwarder() {
  if (!forwarderInstance) {
    forwarderInstance = new TelegramToFlowForwarder();
  }
  return forwarderInstance;
}

module.exports = {
  TelegramToFlowForwarder,
  getForwarder
};

// If run directly, test the connection
if (require.main === module) {
  const forwarder = getForwarder();
  forwarder.checkConnection().then(connected => {
    console.log(connected ? '✅ FLOW server connected' : '❌ FLOW server not available');
    process.exit(connected ? 0 : 1);
  });
}
