import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';

// Types for search functionality
export interface MemoryDocument {
  id: string;
  path: string;
  content: string;
  tags: string[];
  advisor?: string;
  date: Date;
  createdAt: Date;
  modifiedAt: Date;
}

export interface SearchFilters {
  tags?: string[];        // #decision, #ship, #blocker
  advisor?: string;       // by advisor
  dateFrom?: Date;        // by date range
  dateTo?: Date;
}

export interface SearchResult {
  document: MemoryDocument;
  score: number;
  highlights: string[];
}

export interface SearchIndex {
  version: number;
  lastUpdated: string;
  documents: MemoryDocument[];
}

const INDEX_FILE = 'memory-index.json';
const MEMORY_DIR = './memory';

/**
 * SearchService - Full-text search across markdown files
 * Works completely offline with JSON-based index
 */
export class SearchService {
  private index: SearchIndex | null = null;
  private memoryDir: string;
  private indexPath: string;

  constructor(memoryDir: string = MEMORY_DIR, indexPath: string = INDEX_FILE) {
    this.memoryDir = memoryDir;
    this.indexPath = indexPath;
  }

  /**
   * Build or rebuild the search index from markdown files
   */
  async buildIndex(): Promise<SearchIndex> {
    const documents: MemoryDocument[] = [];
    
    // Check if memory directory exists
    let dirExists = false;
    try {
      const stats = await fs.stat(this.memoryDir);
      dirExists = stats.isDirectory();
    } catch {
      dirExists = false;
    }
    
    // Create sample documents if directory doesn't exist or is empty
    if (!dirExists) {
      console.log('Memory directory not found, creating sample documents...');
      await this.createSampleDocuments();
    }
    
    const files = await glob('**/*.md', { 
      cwd: this.memoryDir,
      absolute: true 
    });

    // If no files found, create samples
    if (files.length === 0) {
      console.log('No memory files found, creating sample documents...');
      await this.createSampleDocuments();
      
      // Re-scan after creating samples
      const newFiles = await glob('**/*.md', { 
        cwd: this.memoryDir,
        absolute: true 
      });
      
      for (const filePath of newFiles) {
        const doc = await this.parseDocument(filePath);
        if (doc) {
          documents.push(doc);
        }
      }
    } else {
      for (const filePath of files) {
        const doc = await this.parseDocument(filePath);
        if (doc) {
          documents.push(doc);
        }
      }
    }

    this.index = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      documents
    };

    await this.saveIndex();
    return this.index;
  }

  /**
   * Parse a markdown file into a MemoryDocument
   */
  private async parseDocument(filePath: string): Promise<MemoryDocument | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);
      const relativePath = path.relative(this.memoryDir, filePath);
      
      // Extract metadata from frontmatter or inline tags
      const tags = this.extractTags(content);
      const advisor = this.extractAdvisor(content);
      const date = this.extractDate(content) || stats.mtime;

      return {
        id: relativePath.replace(/\.md$/, ''),
        path: relativePath,
        content,
        tags,
        advisor,
        date,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extract tags like #decision, #ship, #blocker from content
   */
  private extractTags(content: string): string[] {
    const tagRegex = /#([a-zA-Z_-]+)/g;
    const tags: string[] = [];
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1].toLowerCase());
    }
    return [...new Set(tags)];
  }

  /**
   * Extract advisor mentions from content
   */
  private extractAdvisor(content: string): string | undefined {
    const advisorMatch = content.match(/@?advisor[:\s]+([a-zA-Z_]+)/i) ||
                         content.match(/consulted[:\s]+([a-zA-Z_]+)/i);
    return advisorMatch?.[1].toLowerCase();
  }

  /**
   * Extract date from content (YYYY-MM-DD format)
   */
  private extractDate(content: string): Date | undefined {
    const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/);
    return dateMatch ? new Date(dateMatch[0]) : undefined;
  }

  /**
   * Load index from disk
   */
  async loadIndex(): Promise<SearchIndex | null> {
    try {
      const data = await fs.readFile(this.indexPath, 'utf-8');
      this.index = JSON.parse(data);
      return this.index;
    } catch {
      return null;
    }
  }

  /**
   * Save index to disk
   */
  private async saveIndex(): Promise<void> {
    await fs.writeFile(this.indexPath, JSON.stringify(this.index, null, 2));
  }

  /**
   * Search across memory documents with optional filters
   */
  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    if (!this.index) {
      await this.loadIndex() || await this.buildIndex();
    }

    if (!this.index) {
      return [];
    }

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const results: SearchResult[] = [];

    for (const doc of this.index.documents) {
      // Apply filters first
      if (filters && !this.matchesFilters(doc, filters)) {
        continue;
      }

      // Calculate search score
      const contentLower = doc.content.toLowerCase();
      let score = 0;
      const highlights: string[] = [];

      for (const term of terms) {
        const regex = new RegExp(`[^.]*${term}[^.]*\.`, 'gi');
        const matches = contentLower.match(new RegExp(term, 'g'));
        
        if (matches) {
          score += matches.length;
          
          // Get context snippets
          const contextMatches = doc.content.match(regex);
          if (contextMatches && highlights.length < 3) {
            highlights.push(...contextMatches.slice(0, 3 - highlights.length));
          }
        }

        // Boost score for title matches
        if (doc.id.toLowerCase().includes(term)) {
          score += 5;
        }

        // Boost score for tag matches
        if (doc.tags.some(t => t.includes(term))) {
          score += 10;
        }
      }

      if (score > 0) {
        results.push({
          document: doc,
          score,
          highlights: highlights.slice(0, 3)
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Check if document matches filters
   */
  private matchesFilters(doc: MemoryDocument, filters: SearchFilters): boolean {
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => 
        doc.tags.includes(tag.toLowerCase())
      );
      if (!hasTag) return false;
    }

    if (filters.advisor) {
      if (doc.advisor !== filters.advisor.toLowerCase()) {
        return false;
      }
    }

    if (filters.dateFrom && doc.date < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && doc.date > filters.dateTo) {
      return false;
    }

    return true;
  }

  /**
   * Get documents by tag
   */
  async getByTag(tag: string): Promise<MemoryDocument[]> {
    if (!this.index) {
      await this.loadIndex() || await this.buildIndex();
    }
    return this.index?.documents.filter(d => d.tags.includes(tag.toLowerCase())) || [];
  }

  /**
   * Create sample memory documents for demo
   */
  private async createSampleDocuments(): Promise<void> {
    await fs.mkdir(this.memoryDir, { recursive: true });

    const samples = [
      {
        name: '2026-02-10-strategic-decision.md',
        content: `# Strategic Decision: MVP Scope

Date: 2026-02-10
Tags: #decision #mvp #scope
Advisors: @strategist, @product_lead

## Decision
Launch with advisor chat + accountability cadence only

## Reasoning
Faster validation of positioning. We can add features later based on user feedback.

## Key Points
- Focus on core value prop
- Avoid feature creep
- Ship fast, iterate faster
`
      },
      {
        name: '2026-02-12-ship-milestone.md',
        content: `# Ship Milestone: Core Router Complete

Date: 2026-02-12
Tags: #ship #milestone #routing
Advisors: @product_lead

## What Shipped
- Project context router with @mentions
- Advisor synthesis engine
- Template-based advisor creation

## Velocity Impact
Tasks per week increased from 4 to 6.
`
      },
      {
        name: '2026-02-15-blocker-landing-page.md',
        content: `# Blocker: Landing Page Copy

Date: 2026-02-15
Tags: #blocker #landing-page #copy
Advisors: @strategist

## Issue
Landing page hero copy still unresolved after 3 iterations.

## Severity: Medium

## Next Steps
- Get user feedback on current version
- Consider hiring a copywriter
- A/B test two versions
`
      },
      {
        name: '2026-02-17-pricing-decision.md',
        content: `# Pricing Decision

Date: 2026-02-17
Tags: #decision #pricing #revenue
Advisors: @strategist

## Decision
$299 standalone, upsell to OpenClaw for $29/mo

## Reasoning
Matches offline-first promise with premium tier.
`
      }
    ];

    for (const sample of samples) {
      const filePath = path.join(this.memoryDir, sample.name);
      await fs.writeFile(filePath, sample.content);
    }
  }
}

export default SearchService;
