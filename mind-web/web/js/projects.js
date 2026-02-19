/**
 * MIND Projects Module
 * Handles project management, creation, and pipeline visualization
 */

// Projects state
const projectsState = {
  projects: [],
  currentProject: null,
  isLoading: false
};

// Pipeline stages
const PIPELINE_STAGES = ['chaos', 'emerge', 'focus', 'build', 'ship'];

/**
 * Initialize projects module
 */
function initProjects() {
  setupProjectModal();
  setupProjectForm();
  
  // Load projects if on projects view
  if (window.location.hash === '#projects') {
    loadProjects();
  }
}

/**
 * Load projects from backend
 */
async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid || projectsState.isLoading) return;
  
  projectsState.isLoading = true;
  
  // Show loading state
  grid.innerHTML = `
    <div class="loading" style="grid-column: 1 / -1;">
      <div class="loading-spinner"></div>
    </div>
  `;
  
  try {
    const { projects } = await api.getProjects();
    projectsState.projects = projects || [];
    renderProjects();
  } catch (error) {
    console.error('Failed to load projects:', error);
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-title">Failed to load projects</div>
        <div class="empty-state-text">Please check your connection and try again.</div>
      </div>
    `;
  } finally {
    projectsState.isLoading = false;
  }
}

/**
 * Render projects grid
 */
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  
  if (projectsState.projects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📁</div>
        <div class="empty-state-title">No projects yet</div>
        <div class="empty-state-text">Create your first project to get started!</div>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = projectsState.projects.map(project => `
    <div class="project-card" data-project-id="${project.id}" onclick="viewProject('${project.id}')">
      <div class="project-header">
        <div>
          <div class="project-title">${escapeHtml(project.name)}</div>
          <div class="project-description">${escapeHtml(project.description || '')}</div>
        </div>
        <span class="project-status ${project.status}">${project.status}</span>
      </div>
      
      ${renderPipeline(project.stage || 'chaos')}
      
      <div class="project-meta">
        <span>📅 ${formatDate(project.updatedAt || project.createdAt)}</span>
        <span>📋 ${project.taskCount || 0} tasks</span>
      </div>
    </div>
  `).join('');
}

/**
 * Render pipeline visualization
 */
function renderPipeline(currentStage) {
  const currentIndex = PIPELINE_STAGES.indexOf(currentStage);
  
  return `
    <div class="pipeline">
      ${PIPELINE_STAGES.map((stage, index) => {
        let state = 'pending';
        if (index < currentIndex) state = 'completed';
        else if (index === currentIndex) state = 'active';
        
        return `
          <div class="pipeline-stage ${state}" title="${capitalize(stage)}">
            ${getStageIcon(stage)}
          </div>
          ${index < PIPELINE_STAGES.length - 1 ? '<span class="pipeline-arrow">→</span>' : ''}
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Get icon for pipeline stage
 */
function getStageIcon(stage) {
  const icons = {
    chaos: '🔥',
    emerge: '💡',
    focus: '🎯',
    build: '🔨',
    ship: '🚀'
  };
  return icons[stage] || '○';
}

/**
 * View project details
 */
function viewProject(projectId) {
  const project = projectsState.projects.find(p => p.id === projectId);
  if (!project) return;
  
  projectsState.currentProject = project;
  
  // For now, show a modal with project details
  // In a full implementation, this could navigate to a detail view
  showProjectDetails(project);
}

/**
 * Show project details modal
 */
function showProjectDetails(project) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'projectDetailModal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeProjectDetailModal()"></div>
    <div class="modal-content">
      <header class="modal-header">
        <h2>${escapeHtml(project.name)}</h2>
        <button class="modal-close" onclick="closeProjectDetailModal()">&times;</button>
      </header>
      <div class="modal-form">
        <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">
          ${escapeHtml(project.description || 'No description')}
        </p>
        
        <div style="margin-bottom: 1rem;">
          <strong>Status:</strong> 
          <span class="project-status ${project.status}">${project.status}</span>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <strong>Pipeline:</strong>
          ${renderPipeline(project.stage || 'chaos')}
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-primary" onclick="chatAboutProject('${project.id}')">
            💬 Chat with Agents
          </button>
          <button type="button" class="btn btn-secondary" onclick="closeProjectDetailModal()">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

/**
 * Close project detail modal
 */
function closeProjectDetailModal() {
  const modal = document.getElementById('projectDetailModal');
  if (modal) modal.remove();
}

/**
 * Open chat about a project
 */
function chatAboutProject(projectId) {
  const project = projectsState.projects.find(p => p.id === projectId);
  if (!project) return;
  
  closeProjectDetailModal();
  navigateTo('chat');
  
  // Pre-fill chat input with project context
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.value = `@strategist Help me with project "${project.name}". `;
    chatInput.focus();
  }
}

/**
 * Set up project modal
 */
function setupProjectModal() {
  const newProjectBtn = document.getElementById('newProjectBtn');
  const closeBtn = document.getElementById('closeProjectModal');
  const cancelBtn = document.getElementById('cancelProject');
  const modal = document.getElementById('projectModal');
  
  if (newProjectBtn) {
    newProjectBtn.addEventListener('click', () => {
      modal.classList.add('active');
      document.getElementById('projectName')?.focus();
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeProjectModal);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeProjectModal);
  }
  
  // Close on overlay click
  const overlay = modal?.querySelector('.modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeProjectModal);
  }
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      closeProjectModal();
    }
  });
}

/**
 * Close project modal
 */
function closeProjectModal() {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.remove('active');
    document.getElementById('projectForm')?.reset();
  }
}

/**
 * Set up project form
 */
function setupProjectForm() {
  const form = document.getElementById('projectForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const project = {
      name: document.getElementById('projectName').value,
      description: document.getElementById('projectDesc').value,
      status: document.getElementById('projectStatus').value,
      stage: 'chaos',
      createdAt: new Date().toISOString()
    };
    
    try {
      await api.saveProject(project);
      closeProjectModal();
      showNotification('Project created successfully!', 'success');
      loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      showNotification('Failed to create project. Please try again.', 'error');
    }
  });
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Capitalize string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initProjects);

// Make functions available globally
window.loadProjects = loadProjects;
window.viewProject = viewProject;
window.closeProjectModal = closeProjectModal;
window.closeProjectDetailModal = closeProjectDetailModal;
window.chatAboutProject = chatAboutProject;
window.projectsState = projectsState;
