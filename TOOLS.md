# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## AI Models & Cost Routing (Muscles)

### Model Inventory

| Model | Provider | Cost | Use For | Notes |
|-------|----------|------|---------|-------|
| **Kimi K2.5** | kimi-coding | $40/month | Everything | Primary model, all tasks |
| **Ollama (local)** | Localhost | $0 | MIND app AI | External to OpenClaw, no system integration |

**Rule:** No Ollama integration with OpenClaw system. Previous attempt corrupted config files.

### Cost Routing

| Task Type | Route | Reason |
|-----------|-------|--------|
| Complex reasoning | Kimi K2.5 | Full capability needed |
| Code generation | Kimi K2.5 | Quality matters |
| Daily tasks | Kimi K2.5 | Already paying, use it |
| Heartbeats/monitoring | Kimi K2.5 | Low thinking mode |
| MIND AI features | Ollama (external) | Zero cost, private, offline |

### Budget Guardrails

- **Current spend:** $40/month (Kimi K2.5 plan)
- **Monthly target:** $40-50 (stay within plan)
- **Hard limit:** $50 (circuit breaker — stop and alert)
- **Tracking:** Daily token estimates, monthly projection
- **Alert threshold:** 80% of monthly budget ($40)

### Cost Monitoring

Check daily:
- Token usage estimate
- Cost trajectory vs budget
- Alert if approaching $50 limit

**No automatic model switching** — only tracking and alerts. Manual override if needed.

---

## Obsidian Vault Structure

**Vault Name:** Kai  
**Vault Root:** `/Users/peteroberts/Documents/Kai/Kai_Obsidian/`

### Active Folders (visible in Obsidian sidebar):
- **Business**
- **Family**
- **Kai** → *Can be deleted, not used*
- **Kai Memory** ← **SYNC TARGET FOR MEMORY FILES**
- **Personal**
- **Trading**
- **Trading-Journal-App**

### Sync Rules:
- Memory files (.md) → `Kai_Obsidian/Kai Memory/` (root level)
- NOT `Kai_Obsidian/Kai/Kai Memory/` (wrong location, inside unused folder)
- Daily session files → `Kai Memory/Daily Sessions/`
- Skills → `Kai Memory/skills/`

### Check Before Syncing:
```bash
ls ~/Documents/Kai/Kai_Obsidian/Kai\ Memory/  # Correct
ls ~/Documents/Kai/Kai_Obsidian/Kai/Kai\ Memory/  # Wrong (old location)
```

---

Add whatever helps you do your job. This is your cheat sheet.
