/**
 * MIND Chat Module
 * Handles chat interface, @mentions, and message sending
 */

// Chat state
const chatState = {
  messages: [],
  isTyping: false,
  currentAgent: null,
  sessionId: 'default'
};

// Agent colors for styling
const agentColors = {
  strategist: '#8b5cf6',
  maker: '#10b981',
  market: '#f59e0b',
  systems: '#06b6d4',
  engine: '#6366f1'
};

// Agent icons
const agentIcons = {
  strategist: '🎯',
  maker: '🔨',
  market: '📊',
  systems: '⚙️',
  engine: '🧠'
};

/**
 * Initialize chat module
 */
function initChat() {
  setupChatInput();
  setupMentionButtons();
  setupAgentMentions();
  
  // Focus input on load
  const chatInput = document.getElementById('chatInput');
  if (chatInput && window.location.hash === '#chat') {
    setTimeout(() => chatInput.focus(), 100);
  }
}

/**
 * Set up chat input behavior
 */
function setupChatInput() {
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  
  if (!chatInput || !sendBtn) return;
  
  // Auto-resize textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 200) + 'px';
  });
  
  // Send on Enter (Shift+Enter for new line)
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Send button click
  sendBtn.addEventListener('click', sendMessage);
}

/**
 * Set up mention buttons in header
 */
function setupMentionButtons() {
  const mentionBtns = document.querySelectorAll('.mention-btn');
  
  mentionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const agent = btn.dataset.agent;
      const chatInput = document.getElementById('chatInput');
      
      if (chatInput) {
        const mention = `@${agent} `;
        const start = chatInput.selectionStart;
        const end = chatInput.selectionEnd;
        const text = chatInput.value;
        
        chatInput.value = text.substring(0, start) + mention + text.substring(end);
        chatInput.focus();
        chatInput.setSelectionRange(start + mention.length, start + mention.length);
      }
    });
  });
}

/**
 * Set up @mention autocomplete in textarea
 */
function setupAgentMentions() {
  const chatInput = document.getElementById('chatInput');
  if (!chatInput) return;
  
  // Simple @mention detection
  chatInput.addEventListener('input', (e) => {
    const cursorPosition = chatInput.selectionStart;
    const textBeforeCursor = chatInput.value.substring(0, cursorPosition);
    
    // Check if we're typing an @mention
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      showMentionSuggestions(mentionMatch[1], cursorPosition);
    } else {
      hideMentionSuggestions();
    }
  });
}

/**
 * Show mention suggestions dropdown
 */
function showMentionSuggestions(partial, cursorPosition) {
  const agents = ['strategist', 'maker', 'market', 'systems'];
  const matches = agents.filter(a => a.toLowerCase().startsWith(partial.toLowerCase()));
  
  if (matches.length === 0) {
    hideMentionSuggestions();
    return;
  }
  
  // Remove existing suggestions
  hideMentionSuggestions();
  
  // Create suggestions dropdown
  const suggestions = document.createElement('div');
  suggestions.id = 'mentionSuggestions';
  suggestions.style.cssText = `
    position: absolute;
    bottom: 100%;
    left: 0;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 100;
    min-width: 150px;
    margin-bottom: 8px;
  `;
  
  matches.forEach(agent => {
    const item = document.createElement('div');
    item.style.cssText = `
      padding: 8px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--text-sm);
    `;
    item.innerHTML = `
      <span>${agentIcons[agent]}</span>
      <span style="color: ${agentColors[agent]}; font-weight: 500;">@${agent}</span>
    `;
    
    item.addEventListener('click', () => {
      insertMention(agent);
    });
    
    item.addEventListener('mouseenter', () => {
      item.style.background = 'var(--color-bg-secondary)';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.background = 'transparent';
    });
    
    suggestions.appendChild(item);
  });
  
  // Position relative to input
  const wrapper = chatInput.closest('.chat-input-wrapper');
  if (wrapper) {
    wrapper.style.position = 'relative';
    wrapper.appendChild(suggestions);
  }
}

/**
 * Hide mention suggestions
 */
function hideMentionSuggestions() {
  const existing = document.getElementById('mentionSuggestions');
  if (existing) existing.remove();
}

/**
 * Insert mention at cursor position
 */
function insertMention(agent) {
  const chatInput = document.getElementById('chatInput');
  if (!chatInput) return;
  
  const cursorPosition = chatInput.selectionStart;
  const text = chatInput.value;
  const beforeMention = text.substring(0, cursorPosition).replace(/@\w*$/, '');
  const afterMention = text.substring(cursorPosition);
  
  chatInput.value = beforeMention + `@${agent} ` + afterMention;
  chatInput.focus();
  
  hideMentionSuggestions();
}

/**
 * Send a chat message
 */
async function sendMessage() {
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  
  if (!chatInput) return;
  
  const message = chatInput.value.trim();
  if (!message || chatState.isTyping) return;
  
  // Add user message to UI
  addMessage({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });
  
  // Clear input
  chatInput.value = '';
  chatInput.style.height = 'auto';
  
  // Show typing indicator
  showTypingIndicator();
  chatState.isTyping = true;
  if (sendBtn) sendBtn.disabled = true;
  
  try {
    // Parse @mention if present
    const mentionMatch = message.match(/@(\w+)/);
    const agent = mentionMatch ? mentionMatch[1] : null;
    
    // Send to backend
    const response = await api.chat(message, agent, {
      sessionId: chatState.sessionId
    });
    
    // Add agent response
    addMessage({
      role: 'assistant',
      content: response.response.text,
      agent: response.response.agent,
      agentDisplay: response.response.agentDisplay,
      agentColor: response.response.agentColor,
      agentIcon: response.response.agentIcon,
      timestamp: response.timestamp
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    addMessage({
      role: 'system',
      content: 'Sorry, I encountered an error. Please make sure the backend is running and try again.',
      isError: true
    });
  } finally {
    hideTypingIndicator();
    chatState.isTyping = false;
    if (sendBtn) sendBtn.disabled = false;
  }
}

/**
 * Add a message to the chat UI
 */
function addMessage({ role, content, agent, agentDisplay, agentColor, agentIcon, timestamp, isError }) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const messageEl = document.createElement('div');
  messageEl.className = `message ${role}-message`;
  if (isError) messageEl.classList.add('error');
  
  let headerHtml = '';
  let avatarHtml = '';
  
  if (role === 'assistant' && agent) {
    const color = agentColor || agentColors[agent] || '#6366f1';
    const icon = agentIcon || agentIcons[agent] || '🤖';
    const name = agentDisplay || agent;
    
    headerHtml = `
      <div class="message-header">
        <div class="message-avatar" style="background-color: ${color};">${icon}</div>
        <span class="message-author" style="color: ${color};">${name}</span>
        <span class="message-time">${formatTime(timestamp)}</span>
      </div>
    `;
  } else if (role === 'user') {
    headerHtml = `
      <div class="message-header">
        <span class="message-time">${formatTime(timestamp)}</span>
      </div>
    `;
  }
  
  // Convert markdown-like formatting to HTML
  const formattedContent = formatMessage(content);
  
  messageEl.innerHTML = `
    ${headerHtml}
    <div class="message-content">${formattedContent}</div>
  `;
  
  chatMessages.appendChild(messageEl);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Store in state
  chatState.messages.push({ role, content, agent, timestamp });
}

/**
 * Format message content (basic markdown)
 */
function formatMessage(content) {
  if (!content) return '';
  
  let formatted = content
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code inline
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Line breaks
    .replace(/\n/g, '<br>')
    // Bullet points
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  // Wrap consecutive li elements in ul
  formatted = formatted.replace(/(<li>.+?<\/li>(\n|$))+/g, '<ul>$&</ul>');
  
  return formatted;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const typingEl = document.createElement('div');
  typingEl.id = 'typingIndicator';
  typingEl.className = 'message agent-message';
  typingEl.innerHTML = `
    <div class="message-header">
      <div class="message-avatar" style="background-color: #6366f1;">🧠</div>
      <span class="message-author">MIND</span>
    </div>
    <div class="message-content">
      <div class="message-typing">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  
  chatMessages.appendChild(typingEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
  const typingEl = document.getElementById('typingIndicator');
  if (typingEl) typingEl.remove();
}

/**
 * Format timestamp
 */
function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Clear chat history
 */
function clearChat() {
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
  }
  chatState.messages = [];
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initChat);

// Make functions available globally
window.sendMessage = sendMessage;
window.clearChat = clearChat;
window.chatState = chatState;
