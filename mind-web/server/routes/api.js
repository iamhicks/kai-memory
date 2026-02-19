const express = require('express');
const router = express.Router();

const engine = require('../agents/engine');
const notes = require('../storage/notes');
const projects = require('../storage/projects');
const decisions = require('../storage/decisions');
const ollama = require('../llm/ollama');

// GET /api/agents - List available agents
router.get('/agents', (req, res) => {
  const agents = engine.listAgents();
  res.json({ agents });
});

// GET /api/status - Get system status including Ollama
router.get('/status', async (req, res) => {
  try {
    const ollamaStatus = await ollama.getStatus();
    res.json({
      status: 'ok',
      ollama: ollamaStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/chat - Chat with an agent
router.post('/chat', async (req, res) => {
  try {
    const { message, agent, context = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check Ollama availability first
    const ollamaStatus = await ollama.getStatus();
    if (!ollamaStatus.available) {
      return res.status(503).json({
        error: 'Ollama is not available. Please make sure Ollama is running on localhost:11434',
        ollamaStatus,
        timestamp: new Date().toISOString()
      });
    }

    const response = await engine.chat(message, agent, context);
    res.json({
      response,
      agent: agent || 'engine',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/projects - List all projects
router.get('/projects', async (req, res) => {
  try {
    const projectList = await projects.list();
    res.json({ projects: projectList });
  } catch (error) {
    console.error('Projects list error:', error);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

// POST /api/projects - Create or update a project
router.post('/projects', async (req, res) => {
  try {
    const { id, name, description, status, metadata = {} } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await projects.save({
      id,
      name,
      description,
      status: status || 'active',
      metadata,
      updatedAt: new Date().toISOString()
    });

    res.json({ project });
  } catch (error) {
    console.error('Project save error:', error);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// GET /api/projects/:id - Get a specific project
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await projects.get(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ project });
  } catch (error) {
    console.error('Project get error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// POST /api/tasks - Create a task
router.post('/tasks', async (req, res) => {
  try {
    const { projectId, title, description, status, priority, assignee } = req.body;
    
    if (!projectId || !title) {
      return res.status(400).json({ error: 'Project ID and title are required' });
    }

    const task = await projects.addTask(projectId, {
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      assignee,
      createdAt: new Date().toISOString()
    });

    res.json({ task });
  } catch (error) {
    console.error('Task create error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// GET /api/search - Search knowledge base
router.get('/search', async (req, res) => {
  try {
    const { q, type } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const results = [];
    
    // Search notes
    const noteResults = await notes.search(q);
    results.push(...noteResults.map(n => ({ ...n, resultType: 'note' })));
    
    // Search projects
    const projectResults = await projects.search(q);
    results.push(...projectResults.map(p => ({ ...p, resultType: 'project' })));
    
    // Search decisions
    const decisionResults = await decisions.search(q);
    results.push(...decisionResults.map(d => ({ ...d, resultType: 'decision' })));

    // Filter by type if specified
    const filtered = type ? results.filter(r => r.resultType === type) : results;

    res.json({ 
      query: q,
      results: filtered.slice(0, 20),
      total: filtered.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

// Notes endpoints
router.get('/notes', async (req, res) => {
  try {
    const noteList = await notes.list();
    res.json({ notes: noteList });
  } catch (error) {
    console.error('Notes list error:', error);
    res.status(500).json({ error: 'Failed to list notes' });
  }
});

router.post('/notes', async (req, res) => {
  try {
    const { id, title, content, tags = [] } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const note = await notes.save({
      id,
      title,
      content,
      tags,
      updatedAt: new Date().toISOString()
    });

    res.json({ note });
  } catch (error) {
    console.error('Note save error:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// GET /api/ollama/status - Check Ollama status
router.get('/ollama/status', async (req, res) => {
  try {
    const status = await ollama.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ 
      available: false, 
      error: error.message 
    });
  }
});

// POST /api/ollama/generate - Proxy to Ollama generate
router.post('/ollama/generate', async (req, res) => {
  try {
    const { prompt, model, options } = req.body;
    const response = await ollama.generate(prompt, { model, ...options });
    res.json({ response });
  } catch (error) {
    console.error('Ollama generate error:', error);
    res.status(500).json({ 
      error: 'Failed to generate: ' + error.message 
    });
  }
});

// POST /api/ollama/chat - Proxy to Ollama chat
router.post('/ollama/chat', async (req, res) => {
  try {
    const { messages, model, options } = req.body;
    const response = await ollama.chat(messages, { model, ...options });
    res.json({ response });
  } catch (error) {
    console.error('Ollama chat error:', error);
    res.status(500).json({ 
      error: 'Failed to chat: ' + error.message 
    });
  }
});

module.exports = router;