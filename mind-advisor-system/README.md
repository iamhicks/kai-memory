# MIND Advisor System v2.0

Offline-first advisor routing engine for the MIND Accountability OS. Implements the core advisor data model, project context router, template-based custom advisors, and **4 new major features**: Memory Search, Visual Advisor Status, Project Pipeline Stages, and Shared Tasks.

## What's New in v2.0

### 🗂️ Feature 1: Memory Search (File-Based)
Full-text search across markdown files with offline JSON index.

```bash
> search MVP scope
> search #decision
> search #blocker @strategist
```

**Features:**
- Full-text search with relevance scoring
- Tag filters: `#decision`, `#ship`, `#blocker`
- Advisor filters: `@strategist`, `@product_lead`
- Works completely offline
- Auto-generated sample memory files

### 📊 Feature 2: Visual Advisor Status
Status tracking with visual indicators:

| Status | Emoji | Meaning |
|--------|-------|---------|
| Idle | 🟢 | Available |
| Reviewing | 🟡 | Actively working |
| Waiting | ⚪ | Waiting for input |
| Blocked | 🔴 | Blocked |

```bash
> status
📊 Advisor Status Board

🟡 Actively Working:
  The Strategist: Pricing strategy analysis

🔴 Blocked:
  The Product Lead: Landing page dependencies (waiting on: Design assets)

🟢 Available: The Mindset Coach
```

### 📋 Feature 3: Project Pipeline Stages
7-stage project lifecycle: **Chaos → Validate → Plan → Build → Review → Ship → Celebrate**

```bash
> pipeline
📋 Project Pipeline

○ 🌪️ Chaos
○ 🔍 Validate
○ 🗺️ Plan
▶️ 🛠️ Build (3d 2h)
○ 👀 Review
○ 🚀 Ship
○ 🎉 Celebrate

💡 Suggested Advisors: @product_lead, @mindset_coach
```

**Features:**
- Stage progression tracking
- Visit counts per stage
- Exit criteria checklists
- Auto-suggested advisors per stage

### 📋 Feature 4: Shared Tasks (AI Can Add)
AI creates tasks with 🤖 badge based on triggers:

| Trigger | When Created |
|---------|--------------|
| `blocker_detected` | New blocker appears |
| `opportunity` | Decision needs follow-up |
| `accountability_nudge` | Low shipping velocity |

```bash
> tasks
📋 Shared Task Board

📥 Open:
  🤖 🔺 Unblock: Landing page hero copy still unresolved...
  🤖 🔸 Shipping velocity check-in
  🔸 User interview follow-up

Stats: 5 total | 3 open | 2 AI-created
```

## Getting Started

```bash
cd ~/.openclaw/workspace/mind-advisor-system
npm install
npm start
```

### Interactive CLI

Commands:
- `ask <question>` — routes through the Project Context (synthesis by default)
- `search <query>` — search memory files with filters
- `status` — view advisor status board
- `pipeline` — view project pipeline stages
- `tasks` — view shared task board (AI auto-creates tasks)
- `create role=<role> focus=<focus> tone=<tone>` — create custom advisor
- `demo` — run full feature showcase
- `exit` — quit

### Quick Demo

Run the automated demo to see all 4 features:

```bash
npm start
> demo
```

Or run directly:

```bash
npm run demo
```

## Project Structure

```
src/
├── data/
│   ├── coreAdvisors.ts        # Strategist, Product Lead, Mindset Coach
│   └── sampleProject.ts       # Demo project context + decisions
├── demo/
│   └── cli.ts                 # Interactive CLI with all features
├── router/
│   ├── projectContextRouter.ts# Routing brain (mentions, synthesis)
│   └── prompts.ts             # Prompt builders
├── services/
│   ├── memorySearch.ts        # 🔍 FEATURE 1: File-based search
│   ├── advisorStatus.ts       # 📊 FEATURE 2: Visual status tracking
│   ├── pipelineStages.ts      # 📋 FEATURE 3: Pipeline management
│   ├── sharedTasks.ts         # 📋 FEATURE 4: AI task creation
│   ├── mockLLM.ts             # Lightweight response simulator
│   └── templateAdvisorFactory.ts # Template → Advisor generator
├── templates/
│   └── advisorTemplates.ts    # 12 advisor archetypes
├── types/
│   └── advisors.ts            # Interfaces + enums
├── utils/
│   ├── mentions.ts            # Unicode-safe mention parsing
│   ├── text.ts                # Keyword extraction
│   └── time.ts                # Helper formatting
└── index.ts                   # Public API exports
```

## API Usage

### Memory Search

```typescript
import { SearchService } from 'mind-advisor-system';

const search = new SearchService('./memory', 'index.json');
await search.buildIndex();

// Basic search
const results = await search.search('MVP scope');

// Filtered search
const decisions = await search.search('', { 
  tags: ['decision'], 
  advisor: 'strategist' 
});
```

### Advisor Status

```typescript
import { AdvisorStatusTracker } from 'mind-advisor-system';

const status = new AdvisorStatusTracker();
status.setStatus('strategist', 'reviewing', 'Pricing analysis');
status.setStatus('product_lead', 'blocked', 'Needs design', 'Figma files');

console.log(status.getStatusBoard(advisorNames));
```

### Pipeline Stages

```typescript
import { PipelineManager } from 'mind-advisor-system';

const pipeline = new PipelineManager('build');
console.log(pipeline.renderPipeline());

// Advance to next stage
pipeline.advance('MVP is feature complete');
```

### Shared Tasks

```typescript
import { SharedTaskManager } from 'mind-advisor-system';

const tasks = new SharedTaskManager();

// AI creates task
const task = tasks.createAITask(
  'blocker_detected',
  'Unblock: API integration',
  'External API is returning 500s'
);

// Auto-create from project context
const newTasks = tasks.autoCreateTasks({
  currentBlocker: { id: 'b1', description: '...', severity: 'high' },
  recentDecisions: [...],
  velocity: { tasksPerWeek: 4, shipsLast30Days: 1 }
});
```

## How Routing Works

1. **Mentions first** — `@strategist` or multiple mentions short-circuit to direct/roundtable prompts.
2. **Creation intents** — Messages containing "create advisor" trigger the template flow.
3. **Synthesis fallback** — Keyword scoring selects up to 3 relevant advisors for the Project Team response.
4. **Preview output** — Router returns the constructed prompt plus metadata.

## Custom Advisors

- Keyword matcher selects the closest template among 12 archetypes
- `generateAdvisorFromTemplate()` returns a fully formed `Advisor` object
- Previews include frameworks, pitfalls, signature questions, and catchphrases

## Demo Data

The CLI includes sample memory files, advisor statuses, pipeline state, and tasks to demonstrate all features without requiring real project data.

---

Made for the MIND Accountability OS on 19 Feb 2026.
