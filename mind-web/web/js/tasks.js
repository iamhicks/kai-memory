/**
 * MIND Tasks Module
 * Handles task management and kanban-style board
 */

// Tasks state
const tasksState = {
  tasks: [],
  projects: [],
  currentFilter: 'all',
  isLoading: false
};

/**
 * Initialize tasks module
 */
function initTasks() {
  setupTaskFilters();
  setupTaskModal();
  
  // Load tasks if on tasks view
  if (window.location.hash === '#tasks') {
    loadTasks();
  }
}

/**
 * Load tasks from projects
 */
async function loadTasks() {
  const board = document.getElementById('tasksBoard');
  if (!board || tasksState.isLoading) return;
  
  tasksState.isLoading = true;
  
  // Show loading state
  board.innerHTML = `
    <div class="loading" style="grid-column: 1 / -1;">
      <div class="loading-spinner"></div>
    </div>
  `;
  
  try {
    // Load projects (which contain tasks)
    const { projects } = await api.getProjects();
    tasksState.projects = projects || [];
    
    // Extract all tasks from projects
    tasksState.tasks = [];
    projects.forEach(project => {
      if (project.tasks) {
        project.tasks.forEach(task => {
          tasksState.tasks.push({
            ...task,
            projectId: project.id,
            projectName: project.name
          });
        });
      }
    });
    
    renderTasks();
  } catch (error) {
    console.error('Failed to load tasks:', error);
    board.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-title">Failed to load tasks</div>
        <div class="empty-state-text">Please check your connection and try again.</div>
      </div>
    `;
  } finally {
    tasksState.isLoading = false;
  }
}

/**
 * Render tasks board
 */
function renderTasks() {
  const board = document.getElementById('tasksBoard');
  if (!board) return;
  
  // Filter tasks
  let filteredTasks = tasksState.tasks;
  if (tasksState.currentFilter !== 'all') {
    filteredTasks = tasksState.tasks.filter(t => t.status === tasksState.currentFilter);
  }
  
  if (filteredTasks.length === 0) {
    board.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">✅</div>
        <div class="empty-state-title">${tasksState.currentFilter === 'all' ? 'No tasks yet' : `No ${tasksState.currentFilter} tasks`}</div>
        <div class="empty-state-text">Create tasks in your projects to see them here.</div>
      </div>
    `;
    return;
  }
  
  // Group by status for kanban view (when showing all)
  if (tasksState.currentFilter === 'all') {
    const columns = {
      'todo': { title: 'To Do', tasks: [] },
      'in-progress': { title: 'In Progress', tasks: [] },
      'done': { title: 'Done', tasks: [] }
    };
    
    filteredTasks.forEach(task => {
      const status = task.status || 'todo';
      if (columns[status]) {
        columns[status].tasks.push(task);
      } else {
        columns.todo.tasks.push(task);
      }
    });
    
    board.innerHTML = Object.entries(columns).map(([status, column]) => `
      <div class="task-column">
        <div class="task-column-header">
          <span class="task-column-title">${column.title}</span>
          <span class="task-count">${column.tasks.length}</span>
        </div>
        ${column.tasks.map(task => renderTaskCard(task)).join('')}
      </div>
    `).join('');
  } else {
    // Simple list view for filtered tasks
    board.innerHTML = `
      <div class="task-column" style="grid-column: 1 / -1;">
        ${filteredTasks.map(task => renderTaskCard(task)).join('')}
      </div>
    `;
  }
}

/**
 * Render a single task card
 */
function renderTaskCard(task) {
  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e'
  };
  
  return `
    <div class="task-card" onclick="viewTask('${task.id}')">
      <div class="task-title">${escapeHtml(task.title)}</div>
      ${task.description ? `<div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">${escapeHtml(task.description)}</div>` : ''}
      <div class="task-meta">
        <span class="task-priority ${task.priority || 'medium'}"></span>
        <span style="font-size: 0.75rem; color: var(--color-text-muted);">
          ${task.projectName || 'Unknown Project'}
        </span>
        ${task.assignee ? `<span class="task-assignee">👤 ${escapeHtml(task.assignee)}</span>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Set up task filters
 */
function setupTaskFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Apply filter
      tasksState.currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });
}

/**
 * View task details
 */
function viewTask(taskId) {
  const task = tasksState.tasks.find(t => t.id === taskId);
  if (!task) return;
  
  showTaskDetails(task);
}

/**
 * Show task details modal
 */
function showTaskDetails(task) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'taskDetailModal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeTaskDetailModal()"></div>
    <div class="modal-content">
      <header class="modal-header">
        <h2>${escapeHtml(task.title)}</h2>
        <button class="modal-close" onclick="closeTaskDetailModal()">&times;</button>
      </header>
      <div class="modal-form">
        <div style="margin-bottom: 1rem;">
          <strong>Project:</strong> ${escapeHtml(task.projectName || 'Unknown')}
        </div>
        
        <div style="margin-bottom: 1rem;">
          <strong>Status:</strong> 
          <span style="text-transform: capitalize;">${task.status || 'todo'}</span>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <strong>Priority:</strong> 
          <span style="text-transform: capitalize; color: ${getPriorityColor(task.priority)};">
            ${task.priority || 'medium'}
          </span>
        </div>
        
        ${task.description ? `
          <div style="margin-bottom: 1rem;">
            <strong>Description:</strong>
            <p style="margin-top: 0.5rem; color: var(--color-text-secondary);">${escapeHtml(task.description)}</p>
          </div>
        ` : ''}
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="closeTaskDetailModal()">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

/**
 * Close task detail modal
 */
function closeTaskDetailModal() {
  const modal = document.getElementById('taskDetailModal');
  if (modal) modal.remove();
}

/**
 * Set up task modal
 */
function setupTaskModal() {
  // Populate project select when opening modal
  const newTaskBtn = document.getElementById('newTaskBtn');
  if (newTaskBtn) {
    newTaskBtn.addEventListener('click', () => {
      populateProjectSelect();
      document.getElementById('taskModal')?.classList.add('active');
    });
  }
  
  // Close buttons
  document.getElementById('closeTaskModal')?.addEventListener('click', closeTaskModal);
  document.getElementById('cancelTask')?.addEventListener('click', closeTaskModal);
  
  // Overlay click
  const modal = document.getElementById('taskModal');
  modal?.querySelector('.modal-overlay')?.addEventListener('click', closeTaskModal);
  
  // Form submit
  document.getElementById('taskForm')?.addEventListener('submit', handleTaskSubmit);
}

/**
 * Populate project select dropdown
 */
async function populateProjectSelect() {
  const select = document.getElementById('taskProject');
  if (!select) return;
  
  // Keep first option
  select.innerHTML = '<option value="">Select a project...</option>';
  
  try {
    const { projects } = await api.getProjects();
    projects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.id;
      option.textContent = project.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load projects for task:', error);
  }
}

/**
 * Handle task form submit
 */
async function handleTaskSubmit(e) {
  e.preventDefault();
  
  const task = {
    projectId: document.getElementById('taskProject').value,
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDesc').value,
    priority: document.getElementById('taskPriority').value,
    status: document.getElementById('taskStatus').value
  };
  
  if (!task.projectId) {
    showNotification('Please select a project', 'error');
    return;
  }
  
  try {
    await api.createTask(task);
    closeTaskModal();
    showNotification('Task created successfully!', 'success');
    loadTasks();
  } catch (error) {
    console.error('Failed to create task:', error);
    showNotification('Failed to create task. Please try again.', 'error');
  }
}

/**
 * Close task modal
 */
function closeTaskModal() {
  const modal = document.getElementById('taskModal');
  if (modal) {
    modal.classList.remove('active');
    document.getElementById('taskForm')?.reset();
  }
}

/**
 * Get priority color
 */
function getPriorityColor(priority) {
  const colors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e'
  };
  return colors[priority] || colors.medium;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTasks);

// Make functions available globally
window.loadTasks = loadTasks;
window.viewTask = viewTask;
window.closeTaskModal = closeTaskModal;
window.closeTaskDetailModal = closeTaskDetailModal;
window.tasksState = tasksState;
