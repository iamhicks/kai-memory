// File-based storage for projects and tasks
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');

class ProjectsStorage {
  constructor() {
    this.projectsDir = PROJECTS_DIR;
  }

  // Generate ID from name
  generateId(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50) || 'project';
  }

  // Get project file path
  getProjectPath(id) {
    const safeId = id.replace(/[^a-z0-9_-]/gi, '');
    return path.join(this.projectsDir, `${safeId}.json`);
  }

  // Save a project
  async save(project) {
    const id = project.id || this.generateId(project.name);
    const filePath = this.getProjectPath(id);
    
    // Get existing data to preserve tasks
    let existing = { tasks: [] };
    try {
      existing = await this.get(id) || { tasks: [] };
    } catch (e) {}

    const projectData = {
      id,
      name: project.name,
      description: project.description || '',
      status: project.status || 'active',
      metadata: project.metadata || {},
      tasks: existing.tasks || [],
      createdAt: project.createdAt || existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(projectData, null, 2));
    return projectData;
  }

  // Get a project by ID
  async get(id) {
    try {
      const filePath = this.getProjectPath(id);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  // List all projects
  async list() {
    try {
      const files = await fs.readdir(this.projectsDir);
      const projects = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const data = await fs.readFile(path.join(this.projectsDir, file), 'utf8');
            const project = JSON.parse(data);
            projects.push({
              id: project.id,
              name: project.name,
              description: project.description,
              status: project.status,
              taskCount: project.tasks?.length || 0,
              updatedAt: project.updatedAt
            });
          } catch (e) {
            console.error(`Error reading project ${file}:`, e.message);
          }
        }
      }
      
      return projects.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  // Add a task to a project
  async addTask(projectId, task) {
    const project = await this.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const taskData = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: task.title,
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      assignee: task.assignee || null,
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    project.tasks = project.tasks || [];
    project.tasks.push(taskData);
    project.updatedAt = new Date().toISOString();

    await fs.writeFile(this.getProjectPath(projectId), JSON.stringify(project, null, 2));
    return taskData;
  }

  // Update a task
  async updateTask(projectId, taskId, updates) {
    const project = await this.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const taskIndex = project.tasks?.findIndex(t => t.id === taskId);
    if (taskIndex === -1 || taskIndex === undefined) {
      throw new Error(`Task ${taskId} not found`);
    }

    project.tasks[taskIndex] = {
      ...project.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    project.updatedAt = new Date().toISOString();
    await fs.writeFile(this.getProjectPath(projectId), JSON.stringify(project, null, 2));
    return project.tasks[taskIndex];
  }

  // Search projects
  async search(query) {
    const projects = await this.list();
    const lowerQuery = query.toLowerCase();
    
    const results = [];
    for (const proj of projects) {
      const full = await this.get(proj.id);
      if (!full) continue;
      
      const inName = full.name?.toLowerCase().includes(lowerQuery);
      const inDesc = full.description?.toLowerCase().includes(lowerQuery);
      const inTasks = full.tasks?.some(t => 
        t.title?.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery)
      );
      
      if (inName || inDesc || inTasks) {
        results.push(full);
      }
    }
    
    return results;
  }

  // Delete a project
  async delete(id) {
    try {
      const filePath = this.getProjectPath(id);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  }
}

module.exports = new ProjectsStorage();