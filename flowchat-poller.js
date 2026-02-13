// FlowChat Poller - Watches for new messages from FLOW dashboard
// Run this in the background to get instant FlowChat notifications

const http = require('http');

const FLOW_URL = 'http://localhost:3456/api/messages';
let lastMessageCount = 0;
let lastCheck = Date.now();

const checkFlowChat = () => {
  http.get(FLOW_URL, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        const messages = response.messages || [];
        
        // Count messages from flowchat after last check
        const newMessages = messages.filter(m => 
          m.channel === 'flowchat' && 
          m.senderType === 'human' &&
          new Date(m.timestamp).getTime() > lastCheck
        );
        
        if (newMessages.length > 0) {
          console.log('\n🔔 NEW FLOWCHAT MESSAGE:');
          newMessages.forEach(m => {
            console.log(`[${m.timestamp}] ${m.sender}: ${m.text.substring(0, 100)}`);
          });
          console.log('');
          // Alert mechanism - could write to a file or trigger notification
        }
        
        lastCheck = Date.now();
      } catch (e) {
        // Ignore parse errors
      }
    });
  }).on('error', () => {
    // Server not running, ignore
  });
};

// Check every 2 seconds
setInterval(checkFlowChat, 2000);
console.log('🌊 FlowChat poller started - checking every 2 seconds');

// Keep process alive
process.stdin.resume();