# Pending Tasks

## FLOW v1 Development (Active)

### New Modules to Build (Priority Order)

#### 1. Kai Profile / Soul Editor 🌊
**Status:** Not started  
**Priority:** HIGH  

A visual editor for my identity files:
- **SOUL.md** — personality, rules, vibe
- **IDENTITY.md** — name, emoji, avatar, role
- **USER.md** — Pete's profile (timezone, preferences)
- **AGENTS.md** — operational rules

**UI Design:**
- Tabbed markdown editor (like MIND's notes)
- Syntax highlighting
- "Save back to workspace" button
- Live preview of changes
- File tree sidebar for navigation

**Data:** Read/write from `~/.openclaw/workspace/`

---

#### 2. Skills Browser / Manager 🛠️
**Status:** Not started  
**Priority:** HIGH  

Browse and manage my 46 installed skills:
- Grid/list view of all skills
- Search/filter by category
- Skill details: name, description, usage
- Source indicator (clawhub.com vs local)

**Current Skills:** github, weather, mind, healthcheck, obsidian, video-frames, etc. (46 total)

**UI Design:**
- Card grid with icons
- Category tags (Development, Media, System, etc.)
- Click to view SKILL.md content
- "Install new" button (future: with confirmation)

**Data:** Scan `/usr/local/lib/node_modules/openclaw/skills/`

---

#### 3. System Dashboard 📊
**Status:** Not started  
**Priority:** MEDIUM  

OpenClaw gateway integration:
- **Sessions** — active conversations list
- **Usage** — token/cost estimates
- **Crons** — scheduled jobs, next run times
- **Channels** — Telegram status
- **Config** — read-only view of openclaw.json

**UI Design:**
- Widget-style cards
- Real-time status indicators
- Simple JSON viewer for config
- Cron job calendar view

**Data:** Via OpenClaw API (`gateway:18789`)

---

### Integration into FLOW Kanban

Add these as cards to the **"Kai Modules"** board:

| Column | Cards |
|--------|-------|
| **Backlog** | System Dashboard, Install new skills |
| **To Do** | — |
| **In Progress** | — |
| **Review** | — |
| **Done** | — |

**New Board Template:** `kai-system`

---

## End of Week Reminders (Feb 13, 2026)

### 1. Cleanup Deprecated Website Folders
**Priority:** Medium  
**Why:** Website repo has old demo folders that should be removed now that new structure exists

**Folders to remove from `~/Documents/Kai/Repos/website/`:**
- `mind-demo/` → Now lives in `~/Documents/Kai/Repos/mind/demo/`
- `mind/` → Empty folder
- `mind-tauri/` → Now lives in `~/Documents/Kai/Repos/mind/app/`
- `flow-demo/` → Now lives in `~/Documents/Kai/Repos/flow/demo/`
- `flow/` → Empty folder

**Keep in website/:**
- `index.html` (homepage)
- `about/` (about page)
- `mission-control/` (dashboard)
- `CNAME` (domain config)
- `edge-demo/` (until EDGE gets proper repo)

**Note:** Only remove after verifying new structure works and backups are current.

---

## Reminder Schedule

| Task | When | Channel |
|------|------|---------|
| Cleanup deprecated folders | Friday 09:00 | Telegram |

---

*Created: 09-02-2026*
