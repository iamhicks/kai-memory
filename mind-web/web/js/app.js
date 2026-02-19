/**
 * MIND Main Application
 * Handles navigation, theme switching, and app initialization
 */

// App state
const appState = {
  currentView: 'chat',
  theme: localStorage.getItem('mind-theme') || 'light',
  sidebarOpen: false,
  agents: [],
  isConnected: false
};

/**
 * Initialize the application
 */
function init() {
  // Set up theme
  applyTheme(appState.theme);
  
  // Set up event listeners
  setupEventListeners();
  
  // Set up navigation
  setupNavigation();
  
  // Check connection
  checkConnection();
  
  // Load initial data
  loadInitialData();
  
  // Set up mobile sidebar
  setupMobileSidebar();
  
  console.log('🧠 MIND initialized');
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  appState.theme = theme;
  
  // Update toggle button icon
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  }
  
  localStorage.setItem('mind-theme', theme);
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
  const newTheme = appState.theme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Theme toggle
  const themeToggle = document.getElementById('themeBtn');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Sidebar toggle (mobile)
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    
    if (window.innerWidth <= 768 && 
        appState.sidebarOpen && 
        !sidebar.contains(e.target) && 
        !toggle.contains(e.target)) {
      closeSidebar();
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });
}

/**
 * Set up navigation between views
 */
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.dataset.view;
      if (view) {
        navigateTo(view);
      }
    });
  });
  
  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.view) {
      showView(e.state.view, false);
    }
  });
  
  // Check URL hash on load
  const hash = window.location.hash.slice(1);
  if (hash && ['chat', 'projects', 'tasks', 'search', 'agents'].includes(hash)) {
    navigateTo(hash, false);
  }
}

/**
 * Navigate to a specific view
 */
function navigateTo(view, updateHistory = true) {
  if (view === appState.currentView) return;
  
  showView(view);
  
  if (updateHistory) {
    window.history.pushState({ view }, '', `#${view}`);
  }
  
  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

/**
 * Show a specific view
 */
function showView(view) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });
  
  // Hide all views
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
  });
  
  // Show target view
  const targetView = document.getElementById(`view-${view}`);
  if (targetView) {
    targetView.classList.add('active');
  }
  
  appState.currentView = view;
  
  // Trigger view-specific initialization
  if (view === 'projects' && typeof loadProjects === 'function') {
    loadProjects();
  } else if (view === 'tasks' && typeof loadTasks === 'function') {
    loadTasks();
  } else if (view === 'agents' && typeof loadAgents === 'function') {
    loadAgents();
  }
}

/**
 * Toggle sidebar on mobile
 */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  appState.sidebarOpen = !appState.sidebarOpen;
  sidebar.classList.toggle('open', appState.sidebarOpen);
}

/**
 * Close sidebar
 */
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  appState.sidebarOpen = false;
  sidebar.classList.remove('open');
}

/**
 * Set up mobile sidebar behavior
 */
function setupMobileSidebar() {
  // Add overlay for mobile
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 99;
  `;
  
  overlay.addEventListener('click', closeSidebar);
  document.body.appendChild(overlay);
  
  // Show/hide overlay with sidebar
  const sidebar = document.getElementById('sidebar');
  const observer = new MutationObserver(() => {
    overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
  });
  
  observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
}

/**
 * Check connection to backend
 */
async function checkConnection() {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  
  try {
    await api.health();
    appState.isConnected = true;
    if (statusIndicator) {
      statusIndicator.classList.add('connected');
      statusIndicator.classList.remove('error');
    }
    if (statusText) {
      statusText.textContent = 'Connected';
    }
  } catch (error) {
    appState.isConnected = false;
    if (statusIndicator) {
      statusIndicator.classList.add('error');
      statusIndicator.classList.remove('connected');
    }
    if (statusText) {
      statusText.textContent = 'Offline';
    }
    console.warn('Backend connection failed:', error);
  }
}

/**
 * Load initial data
 */
async function loadInitialData() {
  try {
    const { agents } = await api.getAgents();
    appState.agents = agents || [];
    
    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('agentsLoaded', { detail: agents }));
  } catch (error) {
    console.warn('Failed to load agents:', error);
  }
}

/**
 * Get agent info by name
 */
function getAgentInfo(name) {
  return appState.agents.find(a => a.name === name) || null;
}

/**
 * Show a notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Make functions available globally
window.appState = appState;
window.navigateTo = navigateTo;
window.showView = showView;
window.showNotification = showNotification;
window.getAgentInfo = getAgentInfo;
