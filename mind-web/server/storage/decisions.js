// File-based storage for decisions log
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const DECISIONS_DIR = path.join(DATA_DIR, 'decisions');

class DecisionsStorage {
  constructor() {
    this.decisionsDir = DECISIONS_DIR;
  }

  // Generate ID
  generateId() {
    return `dec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get decision file path
  getDecisionPath(id) {
    const safeId = id.replace(/[^a-z0-9_-]/gi, '');
    return path.join(this.decisionsDir, `${safeId}.json`);
  }

  // Save a decision
  async save(decision) {
    const id = decision.id || this.generateId();
    const filePath = this.getDecisionPath(id);
    
    const decisionData = {
      id,
      title: decision.title,
      context: decision.context || '',
      options: decision.options || [],
      decision: decision.decision || '',
      reasoning: decision.reasoning || '',
      tags: decision.tags || [],
      projectId: decision.projectId || null,
      madeBy: decision.madeBy || 'user',
      createdAt: decision.createdAt || new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(decisionData, null, 2));
    return decisionData;
  }

  // Get a decision by ID
  async get(id) {
    try {
      const filePath = this.getDecisionPath(id);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  // List all decisions
  async list(limit = 100) {
    try {
      const files = await fs.readdir(this.decisionsDir);
      const decisions = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const data = await fs.readFile(path.join(this.decisionsDir, file), 'utf8');
            const decision = JSON.parse(data);
            decisions.push({
              id: decision.id,
              title: decision.title,
              tags: decision.tags,
              projectId: decision.projectId,
              madeBy: decision.madeBy,
              createdAt: decision.createdAt
            });
          } catch (e) {
            console.error(`Error reading decision ${file}:`, e.message);
          }
        }
      }
      
      return decisions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  // Search decisions
  async search(query) {
    const decisions = await this.list(1000);
    const fullDecisions = [];
    
    for (const dec of decisions) {
      const full = await this.get(dec.id);
      if (full) fullDecisions.push(full);
    }

    const lowerQuery = query.toLowerCase();
    return fullDecisions.filter(d => {
      const inTitle = d.title?.toLowerCase().includes(lowerQuery);
      const inContext = d.context?.toLowerCase().includes(lowerQuery);
      const inDecision = d.decision?.toLowerCase().includes(lowerQuery);
      const inReasoning = d.reasoning?.toLowerCase().includes(lowerQuery);
      const inTags = d.tags?.some(tag => 
        tag.toLowerCase().includes(lowerQuery)
      );
      return inTitle || inContext || inDecision || inReasoning || inTags;
    });
  }

  // Get decisions for a project
  async getByProject(projectId) {
    const all = await this.list(1000);
    const decisions = [];
    
    for (const dec of all) {
      if (dec.projectId === projectId) {
        const full = await this.get(dec.id);
        if (full) decisions.push(full);
      }
    }
    
    return decisions.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  // Delete a decision
  async delete(id) {
    try {
      const filePath = this.getDecisionPath(id);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  }
}

module.exports = new DecisionsStorage();