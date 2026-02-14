# FLOW Chat Bug Report - 14-02-2026

## Issues Identified

### 1. Telegram Messages Not Showing in FLOW
**Status:** Root cause found

**Problem:** 
- FLOW server has `notifyOpenClawWebhook()` to send FlowChat messages TO Telegram
- But there's NO endpoint to RECEIVE Telegram messages and save them to messages.json

**Result:** Telegram messages never appear in FLOW dashboard

**Fix Required:**
Add `/api/receive` POST endpoint to handle incoming messages from OpenClaw webhook

---

### 2. Connected Channels List Empty
**Status:** Root cause found

**Problem:**
- `/api/messages` returns `"channels": []` (empty array)
- No code populates the channels list from actual connected channels

**Current code (server.js ~line 351):**
```javascript
// Hardcoded demo channels - never populated with real data
{ id: 'telegram', name: 'Telegram', type: 'telegram', status: 'connected', icon: 'telegram-logo' }
```

**Fix Required:**
Query OpenClaw Gateway for actual connected channels or maintain channel list when messages arrive

---

## Architecture Gap

```
Current (broken):
┌──────────┐    POST /hooks/wake     ┌──────────┐
│  FLOW    │ ───────────────────────→│ OpenClaw │
│  Server  │                         │ Gateway  │
│          │                         │          │
│          │   X No endpoint X       │          │
│          │ ←───────────────────────│          │
└──────────┘                         └──────────┘
         Telegram messages never saved
```

```
Fixed:
┌──────────┐    POST /hooks/wake     ┌──────────┐
│  FLOW    │ ───────────────────────→│ OpenClaw │
│  Server  │                         │ Gateway  │
│          │  POST /api/receive      │          │
│          │ ←───────────────────────│          │
└──────────┘                         └──────────┘
         Telegram messages saved to messages.json
```

---

## Next Steps

1. Add `/api/receive` endpoint to server.js
2. Configure OpenClaw webhook to call FLOW when Telegram messages arrive
3. Update channel list population from actual message sources
4. Test bidirectional message flow
