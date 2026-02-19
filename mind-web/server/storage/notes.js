// File-based storage for notes
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const NOTES_DIR = path.join(DATA_DIR, 'notes');

class NotesStorage {
  constructor() {
    this.notesDir = NOTES_DIR;
  }

  // Generate ID from title
  generateId(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50) || 'untitled';
  }

  // Get note file path
  getNotePath(id) {
    // Sanitize ID to prevent directory traversal
    const safeId = id.replace(/[^a-z0-9_-]/gi, '');
    return path.join(this.notesDir, `${safeId}.json`);
  }

  // Save a note
  async save(note) {
    const id = note.id || this.generateId(note.title);
    const filePath = this.getNotePath(id);
    
    const noteData = {
      id,
      title: note.title,
      content: note.content || '',
      tags: note.tags || [],
      createdAt: note.createdAt || new Date().toISOString(),
      updatedAt: note.updatedAt || new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(noteData, null, 2));
    return noteData;
  }

  // Get a note by ID
  async get(id) {
    try {
      const filePath = this.getNotePath(id);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  // List all notes
  async list() {
    try {
      const files = await fs.readdir(this.notesDir);
      const notes = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const data = await fs.readFile(path.join(this.notesDir, file), 'utf8');
            const note = JSON.parse(data);
            notes.push({
              id: note.id,
              title: note.title,
              tags: note.tags,
              updatedAt: note.updatedAt
            });
          } catch (e) {
            console.error(`Error reading note ${file}:`, e.message);
          }
        }
      }
      
      // Sort by updated date (newest first)
      return notes.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  // Search notes
  async search(query) {
    const notes = await this.list();
    const fullNotes = [];
    
    // Get full content for all notes
    for (const note of notes) {
      const full = await this.get(note.id);
      if (full) fullNotes.push(full);
    }

    const lowerQuery = query.toLowerCase();
    return fullNotes.filter(note => {
      const inTitle = note.title?.toLowerCase().includes(lowerQuery);
      const inContent = note.content?.toLowerCase().includes(lowerQuery);
      const inTags = note.tags?.some(tag => 
        tag.toLowerCase().includes(lowerQuery)
      );
      return inTitle || inContent || inTags;
    });
  }

  // Delete a note
  async delete(id) {
    try {
      const filePath = this.getNotePath(id);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  }
}

module.exports = new NotesStorage();