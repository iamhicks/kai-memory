"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const glob_1 = require("glob");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const INDEX_FILE = 'memory-index.json';
const MEMORY_DIR = './memory';
/**
 * SearchService - Full-text search across markdown files
 * Works completely offline with JSON-based index
 */
class SearchService {
    constructor(memoryDir = MEMORY_DIR, indexPath = INDEX_FILE) {
        this.index = null;
        this.memoryDir = memoryDir;
        this.indexPath = indexPath;
    }
    /**
     * Build or rebuild the search index from markdown files
     */
    async buildIndex() {
        const documents = [];
        // Check if memory directory exists
        let dirExists = false;
        try {
            const stats = await fs.stat(this.memoryDir);
            dirExists = stats.isDirectory();
        }
        catch {
            dirExists = false;
        }
        // Create sample documents if directory doesn't exist or is empty
        if (!dirExists) {
            console.log('Memory directory not found, creating sample documents...');
            await this.createSampleDocuments();
        }
        const files = await (0, glob_1.glob)('**/*.md', {
            cwd: this.memoryDir,
            absolute: true
        });
        // If no files found, create samples
        if (files.length === 0) {
            console.log('No memory files found, creating sample documents...');
            await this.createSampleDocuments();
            // Re-scan after creating samples
            const newFiles = await (0, glob_1.glob)('**/*.md', {
                cwd: this.memoryDir,
                absolute: true
            });
            for (const filePath of newFiles) {
                const doc = await this.parseDocument(filePath);
                if (doc) {
                    documents.push(doc);
                }
            }
        }
        else {
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
    async parseDocument(filePath) {
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
        }
        catch (error) {
            console.error(`Error parsing ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Extract tags like #decision, #ship, #blocker from content
     */
    extractTags(content) {
        const tagRegex = /#([a-zA-Z_-]+)/g;
        const tags = [];
        let match;
        while ((match = tagRegex.exec(content)) !== null) {
            tags.push(match[1].toLowerCase());
        }
        return [...new Set(tags)];
    }
    /**
     * Extract advisor mentions from content
     */
    extractAdvisor(content) {
        const advisorMatch = content.match(/@?advisor[:\s]+([a-zA-Z_]+)/i) ||
            content.match(/consulted[:\s]+([a-zA-Z_]+)/i);
        return advisorMatch?.[1].toLowerCase();
    }
    /**
     * Extract date from content (YYYY-MM-DD format)
     */
    extractDate(content) {
        const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/);
        return dateMatch ? new Date(dateMatch[0]) : undefined;
    }
    /**
     * Load index from disk
     */
    async loadIndex() {
        try {
            const data = await fs.readFile(this.indexPath, 'utf-8');
            this.index = JSON.parse(data);
            return this.index;
        }
        catch {
            return null;
        }
    }
    /**
     * Save index to disk
     */
    async saveIndex() {
        await fs.writeFile(this.indexPath, JSON.stringify(this.index, null, 2));
    }
    /**
     * Search across memory documents with optional filters
     */
    async search(query, filters) {
        if (!this.index) {
            await this.loadIndex() || await this.buildIndex();
        }
        if (!this.index) {
            return [];
        }
        const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
        const results = [];
        for (const doc of this.index.documents) {
            // Apply filters first
            if (filters && !this.matchesFilters(doc, filters)) {
                continue;
            }
            // Calculate search score
            const contentLower = doc.content.toLowerCase();
            let score = 0;
            const highlights = [];
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
    matchesFilters(doc, filters) {
        if (filters.tags && filters.tags.length > 0) {
            const hasTag = filters.tags.some(tag => doc.tags.includes(tag.toLowerCase()));
            if (!hasTag)
                return false;
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
    async getByTag(tag) {
        if (!this.index) {
            await this.loadIndex() || await this.buildIndex();
        }
        return this.index?.documents.filter(d => d.tags.includes(tag.toLowerCase())) || [];
    }
    /**
     * Create sample memory documents for demo
     */
    async createSampleDocuments() {
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
exports.SearchService = SearchService;
exports.default = SearchService;
