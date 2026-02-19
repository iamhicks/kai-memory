/**
 * MIND API Client
 * Handles all backend communication with retry logic and error handling
 */

const API_BASE = '';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make an API request with retry logic
 */
async function makeRequest(endpoint, options = {}, retryCount = 0) {
  const url = `${API_BASE}/api${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  const fetchOptions = { ...defaultOptions, ...options };
  
  if (fetchOptions.body && typeof fetchOptions.body === 'object') {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }
  
  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new APIError(
        errorData?.error || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }
    
    return await response.json();
  } catch (error) {
    // Retry on network errors or 5xx errors
    if (retryCount < MAX_RETRIES && (
      error.name === 'TypeError' || // Network error
      (error.status >= 500 && error.status < 600)
    )) {
      await sleep(RETRY_DELAY * (retryCount + 1));
      return makeRequest(endpoint, options, retryCount + 1);
    }
    
    throw error;
  }
}

/**
 * API Client object with all available methods
 */
const api = {
  /**
   * Health check
   */
  async health() {
    const response = await fetch('/health');
    return response.json();
  },

  /**
   * Get list of available agents
   */
  async getAgents() {
    return makeRequest('/agents');
  },

  /**
   * Send a chat message
   * @param {string} message - The message text
   * @param {string} agent - Optional agent name (strategist, maker, market, systems)
   * @param {object} context - Additional context
   */
  async chat(message, agent = null, context = {}) {
    return makeRequest('/chat', {
      method: 'POST',
      body: { message, agent, context }
    });
  },

  /**
   * Get all projects
   */
  async getProjects() {
    return makeRequest('/projects');
  },

  /**
   * Get a specific project
   */
  async getProject(id) {
    return makeRequest(`/projects/${id}`);
  },

  /**
   * Create or update a project
   */
  async saveProject(project) {
    return makeRequest('/projects', {
      method: 'POST',
      body: project
    });
  },

  /**
   * Create a task
   */
  async createTask(task) {
    return makeRequest('/tasks', {
      method: 'POST',
      body: task
    });
  },

  /**
   * Search the knowledge base
   * @param {string} query - Search query
   * @param {string} type - Optional type filter (note, project, decision)
   */
  async search(query, type = null) {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    return makeRequest(`/search?${params}`);
  },

  /**
   * Get system status including Ollama
   */
  async getStatus() {
    return makeRequest('/status');
  },

  /**
   * Ollama: Check status (via backend proxy)
   */
  async ollamaStatus() {
    return makeRequest('/ollama/status');
  },

  /**
   * Ollama: Generate text (via backend proxy)
   */
  async ollamaGenerate(prompt, model = null, options = {}) {
    return makeRequest('/ollama/generate', {
      method: 'POST',
      body: { prompt, model, options }
    });
  },

  /**
   * Ollama: Chat completion (via backend proxy)
   */
  async ollamaChat(messages, model = null, options = {}) {
    return makeRequest('/ollama/chat', {
      method: 'POST',
      body: { messages, model, options }
    });
  }
    return makeRequest('/notes');
  },

  /**
   * Save a note
   */
  async saveNote(note) {
    return makeRequest('/notes', {
      method: 'POST',
      body: note
    });
  }
};

// Make API available globally
window.api = api;
window.APIError = APIError;
