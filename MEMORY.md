# 📚 MEMORY SYSTEM - Multi-Layer Approach (Updated 05/02/2026)

## Layer 1: Session Start Protocol (Every Time)
1. Read `SOUL.md` — identity
2. Read `USER.md` — who you're helping
3. Read `DEV_PROCEDURE.md` — **mandatory development checklist**
4. Read `memory/DD-MM-YYYY.md` — today's + yesterday's notes
5. Read `MEMORY.md` — curated long-term memory
6. **Read `memory/pending-requests.md`** — incomplete user requests
7. Search `/Kai_Obsidian/` for project context

## Layer 2: Session Summary Protocol (End of Every Session)

**Use `memory/TEMPLATE.md` format for all session summaries:**
1. Copy template to `memory/DD-MM-YYYY.md`
2. Fill in: accomplishments, issues, decisions, current state, next steps, lessons
3. Update `MEMORY.md` with curated key points
4. Run `./sync-to-obsidian.sh` to sync all changes

**Also write immediately after:**
- Major feature completions
- Bug fixes
- Architecture decisions
- New product ideas
- User preferences learned
- Any context worth preserving

**Files to update:**
- `memory/DD-MM-YYYY.md` — daily raw log (use TEMPLATE.md format)
- `MEMORY.md` — curated long-term memory
- Relevant files in `Kai_Obsidian/` — project notes

## Layer 3: QMD Plugin (Semantic Search)
**Goal:** Enable QMD to search all local knowledge sources

**Sources to index:**
- `memory/*.md` — daily notes
- `MEMORY.md` — curated memory
- `Kai_Obsidian/**/*.md` — Obsidian vault
- Project docs in `/docs/`

**Benefits:**
- Survives crashes (reads from disk)
- Pulls only relevant context
- 60-97% token savings
- No context overflow

## Current Project Context (Auto-Loaded)

### MIND App (12-02-2026)
**Status:** AI Chat history fully implemented and working

**Recent Features:**
- ✅ **Per-note AI Chat history** — Each note has isolated conversation thread
- ✅ **Chat persistence** — Saved to `kb_ai_chat_history` in localStorage  
- ✅ **Chat selector dropdown** — Shows current note, lists other notes with history
- ✅ **Grok-style UI** — User bubbles (dark grey), AI on background, rounded input
- ✅ **Context-aware AI** — Responses include last 10 messages from note's history
- ✅ **Tab switching fix** — `switchTab()` now properly calls `switchToNoteChat()`

**Previous Fixes:**
- Pinned (Favorites) section sort dropdown now visible and working
- Folder date sorting works with proper timestamps
- Added "Custom (Manual Order)" option for manual drag-and-drop reordering
- Dropdown text no longer wraps (wider, nowrap styling)
- Right-click context menu includes "Inspect Element" for DevTools

**Data Structure:**
- Folders now have `createdAt` and `updatedAt` timestamps
- Sort preference saved in `settings.folderSort` and `settings.favoritesSort`
- Custom sort preserves manual order; other sorts persist the new order
- Chat history: `aiChatHistory[noteId] = [{role, content, timestamp}, ...]`

**Current Stable:** `STABLE-12-02-26-0004-WORKING/`

### i_am_Hicks Product Suite
**Status:** Live with monochrome redesign
**URL:** iamhicks.com

**Core Principles — NON-NEGOTIABLE:**
When evaluating new features or products, refer to these:

- **Offline-first** — Works without internet, no data leaving the machine
- **One-time purchase** — $29 and done, no subscription fatigue
- **Local AI** — Privacy, no API costs, no rate limits
- **Simplicity** — Does one thing well

*These principles keep us out of the SaaS arena and define our edge. Cloud features = competing with Notion/Obsidian = bad idea.*

**Products:**
- **Mind_ai** — AI-powered notes & knowledge ($29)
- **Flow_ai** — AI-powered task management ($29)
- **Bundle** — Both apps ($49)

**Design System:**
- Monochrome palette: #F1F1F1 (off-white), #1B1B1D (dark)
- Typography: Fraunces (headings), Inter (body)
- Flat buttons, no gradients, static waves
- No animations (prevents rendering issues)

**Recent Changes (07-02-2026):**
- Complete monochrome redesign
- Removed product icons from cards
- Tightened vertical spacing
- Static wave dividers (removed animations)
- Consistent button styling across all pages
- Moved comparison section to Mind page
- Added Markdown import/paste feature description

## Key Lessons & Decisions

### 08/02/2026 — Protocol System Created
- **STANDING_ORDERS.md** — 10 non-negotiable operational rules (log everything, verify first, backup before destructive ops, etc.)
- **PROTOCOL_COST_EFFICIENCY.md** — Three-Strike (stop after 3 failures), Scalpel (use grep/head/tail, not full reads), Ask Before Dig, Terse Output
- **Session start order updated:** STANDING_ORDERS → PROTOCOL_COST_EFFICIENCY → SOUL → USER → memory
- **Gateway watchdog created:** Auto-restart monitoring with logging
- **MIND restored:** Version 501d995 (AI features + all bug fixes) after modular split failed 3 times

### February 2026
- **MIND app architecture:** Modular files (HTML/CSS/JS) prevent single-point-of-failure issues
- **GitHub Pages deployment:** Use cache-busting (`?v=2`) for static assets to avoid stale files
- **WebLLM vs Ollama:** Skip WebLLM (storage limits); use Ollama for AI features
- **Backup strategy:** Multiple backup locations (local + GitHub) prevent data loss
- **Development Procedure:** Created `DEV_PROCEDURE.md` with mandatory pre-deployment checklist. **Must follow for every code change.** No more "I'll remember next time."
- **Unified Agent Architecture:** One powerful agent (Kai) with contextual channels beats multi-agent silos. Adopted ClawVault-style structured memory with typed entries (decisions, lessons, preferences) and wiki-links for knowledge graph
- **Per-Agent API Keys:** Support global + per-agent API keys with provider selection (Kimi, OpenAI, Ollama) for cost tracking and flexibility

### Product Suite Status
| Product | Status | Priority |
|---------|--------|----------|
| MIND | ✅ Complete (AI Chat working) | Medium |
| EDGE | 🚫 Not started | High |
| FLOW | 🚫 Not started | High |
| VAULT | 🚫 **On hold** — removed from website | — |
| **Bundle** | **i_am Complete** | **$99** |

## Future Projects (Post-Launch)

### Telegram → FLOW Auto-Forwarding
**Status:** Fully implemented and working  
**Date:** 15-02-2026  
**Location:** `~/.openclaw/workspace/telegram-flow-forwarder.js`

**Components:**
1. **telegram-flow-forwarder.js** - Core forwarding logic
2. **telegram-queue.js** - Message queue management  
3. **telegram-monitor.js** - Continuous monitoring service
4. **kai-reply-forwarder.js** - AI reply forwarding with auto-channel detection

**How It Works:**
```
Telegram Message → I queue it → Monitor reads every 5s → Forwards to FLOW → WebSocket updates Chat
```

**Reply Workflow (IMPORTANT):**
```
1. Queue user's message
2. WAIT 5 seconds (let system save to messages.json)
3. Get channel from saved message (auto-detect)
4. Forward my reply to same channel
```

**To Start (Option A - Continuous Monitor):**

Step 1: Start FLOW server
```bash
cd /Users/peteroberts/Documents/Kai/Repos/flow-dev
npm start
```

Step 2: Start the monitor (new terminal)
```bash
cd ~/.openclaw/workspace
node telegram-monitor.js
```

Step 3: Messages auto-forward
- Every Telegram message I receive gets queued
- Monitor checks every 5 seconds
- Forwards to FLOW at `http://localhost:3457/api/receive`
- Saved to `~/.openclaw/workspace/memory/flow/transcripts/`

**How I Queue Messages:**
```javascript
const { queueMessage } = require('./telegram-queue.js');
queueMessage({
  id: message.id,
  text: message.text,
  sender: 'Pete',
  timestamp: new Date().toISOString()
});
```

**How I Forward Replies:**
```javascript
const { getReplyForwarder } = require('./kai-reply-forwarder.js');

// Step 1: Queue message
queueMessage({ id: 'msg_123', text: '...', sender: 'Pete', ... });

// Step 2: Wait 5 seconds, then reply (auto-detects channel)
setTimeout(() => {
  getReplyForwarder().forwardReply({
    text: 'My reply here',
    inReplyTo: 'msg_123'  // Auto-detects channel from this message
  });
}, 5000);
```

**Viewing in FLOW:**
- Open FLOW dashboard → Chat tab
- Messages appear in correct channels (general, code, marketing, etc.)
- My replies appear in same channel as your message
- Full conversation history preserved
**Source:** Alex Finn recommendation (via X/Twitter, 07-02-2026)  
**Status:** Deferred — revisit after i_am_Hicks product suite complete  
**Priority:** After EDGE/FLOW/VAULT launched  

**Purpose:** Monitor and manage OpenClaw activity  

**Components:**
1. **Activity feed** — Track every action OpenClaw takes (token visibility)
2. **Calendar view** — Visual weekly view of all scheduled cron tasks
3. **Global search** — Unified search across memories, tasks, documents, conversations

**Tech Stack Options:**
- Full version: NextJS + Convex + Codex (~22-32 hours)
- Quick version: File-based logs + formatted cron list (~1-2 hours)

**Decision:** Build quick version first, then full dashboard after products launched

**Reference:** See `memory/07-02-2026.md` for full context

---

## Critical Lessons

### 15/02/2026 — Unified Agent Architecture
**What we learned:** After building multi-agent system (CodeDev, Tester, Designer, etc.), discovered through ClawVault/Claw Control research that one powerful agent with contextual channels is superior to siloed specialist agents.

**Why multi-agent was wrong:**
- Artificial separation of expertise that should be unified
- Memory silos prevent cross-domain insights
- Forces user to "choose" before asking a question
- More complex without benefit

**The better approach:**
- One Kai with contextual channels (General, Code, Design, Strategy, Debug)
- Same intelligence, different hats
- Shared memory vault across all contexts
- User just asks; I adapt automatically

**Implementation:**
- Replaced agent selection with channel selection in sidebar
- Each channel has color-coded header and role indicator
- Unified ClawVault memory with typed entries (decisions, lessons, preferences)
- Wiki-links create knowledge graph across all memories

### 15/02/2026 — No Performative Solutions
**What went wrong:** User called out inconsistency in my response about CodeDev agent. I offered to create one AFTER being corrected, as a way to "make it right" rather than simply acknowledging the mistake.

**The rule:**
- **Only offer solutions if practical and correct** — not to sound helpful or make the user feel good
- **Acknowledge mistakes directly** — don't pivot to "but here's what we could do instead"
- **No solution theater** — If I'm the right tool for the job, don't suggest creating an agent just because it sounds productive
- **Correct > Comfortable** — Better to admit I'm wrong than offer a distraction

**When to offer solutions:**
- User explicitly asks for one
- Problem is outside my capability (e.g., need human review)
- Solution genuinely solves the stated problem

**When NOT to offer solutions:**
- After being corrected (just acknowledge and move on)
- To soften criticism of my mistake
- Because it sounds proactive
- To fill silence
**What went wrong:** Pete asked for MIND styling on FLOW/EDGE 3+ times over 2 days. I kept getting distracted by technical issues (cache problems, modular split) and asking "what style?" instead of acting on the clear request.

**The fix:**
1. **Stop and confirm** — When user mentions styling/UI/visual changes, stop everything and write it down
2. **Log immediately** — Every feature request goes to `memory/pending-requests.md` right away
3. **Self-check** — Before coding, ask: "Is this what Pete actually asked for?"
4. **Prioritize user intent** — What they asked for > what I think needs fixing

**System changes made:**
- Created `memory/pending-requests.md` tracking file
- Added pending requests check to Session Start Protocol
- New DEV_PROCEDURE.md rule: "User Intent Capture" — confirm understanding before coding
