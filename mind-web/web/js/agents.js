/**
 * MIND Agents Module
 * Handles agent directory and agent detail views
 */

// Agents state
const agentsState = {
  agents: [],
  currentAgent: null
};

// Fallback agent data in case API fails
const FALLBACK_AGENTS = [
  {
    name: 'strategist',
    displayName: 'Strategist',
    description: 'Strategic thinking, vision, and long-term planning',
    color: '#8b5cf6',
    icon: '🎯',
    capabilities: ['strategy', 'planning', 'vision', 'analysis']
  },
  {
    name: 'maker',
    displayName: 'Maker',
    description: 'Building, coding, and creating deliverables',
    color: '#10b981',
    icon: '🔨',
    capabilities: ['coding', 'writing', 'building', 'creating', 'implementation']
  },
  {
    name: 'market',
    displayName: 'Market',
    description: 'Business strategy, users, and market analysis',
    color: '#f59e0b',
    icon: '📊',
    capabilities: ['business', 'marketing', 'users', 'competition', 'pricing']
  },
  {
    name: 'systems',
    displayName: 'Systems',
    description: 'Operations, processes, and workflow optimization',
    color: '#06b6d4',
    icon: '⚙️',
    capabilities: ['process', 'workflow', 'operations', 'documentation', 'automation']
  }
];

/**
 * Initialize agents module
 */
function initAgents() {
  // Listen for agents loaded event from app.js
  window.addEventListener('agentsLoaded', (e) => {
    agentsState.agents = e.detail || FALLBACK_AGENTS;
    if (window.location.hash === '#agents') {
      renderAgents();
    }
  });
  
  // If agents already loaded
  if (window.appState?.agents?.length > 0) {
    agentsState.agents = window.appState.agents;
  }
  
  // Create agents view if it doesn't exist
  createAgentsView();
}

/**
 * Create agents view section
 */
function createAgentsView() {
  // Check if view already exists
  if (document.getElementById('view-agents')) return;
  
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;
  
  const agentsView = document.createElement('section');
  agentsView.className = 'view view-agents';
  agentsView.id = 'view-agents';
  agentsView.innerHTML = `
    <header class="view-header">
      <h1>Agents</h1>
      <p style="color: var(--color-text-muted); font-size: var(--text-sm);">
        Your multi-agent intelligence network
      </p>
    </header>
    
    <div class="agents-grid" id="agentsGrid">
      <!-- Agents loaded dynamically -->
    </div>
  `;
  
  mainContent.appendChild(agentsView);
  
  // Add agents to nav
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (sidebarNav) {
    const agentsLink = document.createElement('a');
    agentsLink.href = '#agents';
    agentsLink.className = 'nav-item';
    agentsLink.dataset.view = 'agents';
    agentsLink.innerHTML = `
      <span class="nav-icon">🤖</span>
      <span class="nav-text">Agents</span>
    `;
    
    // Insert before search
    const searchLink = sidebarNav.querySelector('[data-view="search"]');
    if (searchLink) {
      sidebarNav.insertBefore(agentsLink, searchLink);
    } else {
      sidebarNav.appendChild(agentsLink);
    }
    
    // Add click handler
    agentsLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('agents');
    });
  }
}

/**
 * Load and render agents
 */
function loadAgents() {
  if (agentsState.agents.length === 0) {
    agentsState.agents = FALLBACK_AGENTS;
  }
  renderAgents();
}

/**
 * Render agents grid
 */
function renderAgents() {
  const grid = document.getElementById('agentsGrid');
  if (!grid) return;
  
  grid.innerHTML = agentsState.agents.map(agent => `
    <div class="agent-card" onclick="viewAgent('${agent.name}')">
      <div class="agent-card-header">
        <div class="agent-card-icon ${agent.name}" style="color: ${agent.color};">
          ${agent.icon}
        </div>
        <div>
          <div class="agent-card-title">${agent.displayName}</div>
          <div class="agent-card-role">@${agent.name}</div>
        </div>
      </div>
      
      <p class="agent-card-description">${agent.description}</p>
      
      <div class="agent-card-capabilities">
        ${(agent.capabilities || []).map(cap => `
          <span class="agent-capability">${cap}</span>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/**
 * View agent details
 */
function viewAgent(agentName) {
  const agent = agentsState.agents.find(a => a.name === agentName);
  if (!agent) return;
  
  agentsState.currentAgent = agent;
  showAgentDetails(agent);
}

/**
 * Show agent details modal
 */
function showAgentDetails(agent) {
  // Remove existing modal
  const existingModal = document.getElementById('agentDetailModal');
  if (existingModal) existingModal.remove();
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'agentDetailModal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeAgentModal()"></div>
    <div class="modal-content" style="max-width: 600px;">
      <header class="modal-header">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="
            width: 48px; 
            height: 48px; 
            border-radius: 12px; 
            background-color: ${agent.color}20;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
          ">
            ${agent.icon}
          </div>
          <div>
            <h2 style="margin: 0;">${agent.displayName}</h2>
            <span style="color: ${agent.color}; font-size: 0.875rem; font-weight: 500;">@${agent.name}</span>
          </div>
        </div>
        <button class="modal-close" onclick="closeAgentModal()">&times;</button>
      </header>
      
      <div class="modal-form">
        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin-bottom: 0.5rem;">
            About
          </h3>
          <p style="color: var(--color-text-secondary); line-height: 1.6;">${agent.description}</p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin-bottom: 0.5rem;">
            Capabilities
          </h3>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${(agent.capabilities || []).map(cap => `
              <span style="
                padding: 0.25rem 0.75rem;
                background-color: var(--color-bg-secondary);
                border-radius: 4px;
                font-size: 0.875rem;
                color: var(--color-text-secondary);
              ">${cap}</span>
            `).join('')}
          </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin-bottom: 0.5rem;">
            How to Use
          </h3>
          <div style="background-color: var(--color-bg-secondary); padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.875rem; color: var(--color-text-secondary);">
            @${agent.name} your message here
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-primary" onclick="chatWithAgent('${agent.name}')">
            💬 Chat with ${agent.displayName}
          </button>
          <button type="button" class="btn btn-secondary" onclick="closeAgentModal()">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

/**
 * Close agent modal
 */
function closeAgentModal() {
  const modal = document.getElementById('agentDetailModal');
  if (modal) modal.remove();
}

/**
 * Start chat with specific agent
 */
function chatWithAgent(agentName) {
  closeAgentModal();
  navigateTo('chat');
  
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.value = `@${agentName} `;
    chatInput.focus();
  }
}

/**
 * Get agent color
 */
function getAgentColor(agentName) {
  const agent = agentsState.agents.find(a => a.name === agentName);
  return agent?.color || '#6366f1';
}

/**
 * Get agent display name
 */
function getAgentDisplayName(agentName) {
  const agent = agentsState.agents.find(a => a.name === agentName);
  return agent?.displayName || agentName;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAgents);

// Make functions available globally
window.loadAgents = loadAgents;
window.viewAgent = viewAgent;
window.closeAgentModal = closeAgentModal;
window.chatWithAgent = chatWithAgent;
window.getAgentColor = getAgentColor;
window.getAgentDisplayName = getAgentDisplayName;
window.agentsState = agentsState;
