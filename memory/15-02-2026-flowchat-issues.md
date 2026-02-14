# FlowChat Issues - 15-02-2026

## Problems Found

### 1. Missing `/api/channels` Endpoint ❌ FIXED
**Issue:** Dashboard called `/api/channels` but server didn't have this endpoint. Channels list on left was empty.

**Fix:** Added endpoint in `server.js` that returns Telegram and FlowChat as connected channels.

### 2. Telegram Messages Not Showing in FlowChat ⚠️ ARCHITECTURAL
**Issue:** One-way sync only. FlowChat messages go TO OpenClaw (via webhook), but Telegram messages don't come BACK to FlowChat.

**Why:** 
- OpenClaw receives Telegram messages via Gateway
- FlowChat has no mechanism to receive those messages
- Would need OpenClaw to push messages to FLOW server, or FLOW to poll OpenClaw

**Potential Fixes:**

**Option A: OpenClaw Plugin (Recommended)**
- Create OpenClaw plugin that forwards all messages to FLOW server
- Messages appear in FlowChat instantly
- Clean architecture, minimal polling

**Option B: FLOW Polls OpenClaw**
- FLOW server polls OpenClaw `/sessions` or messages endpoint
- Higher latency, more complexity
- Need to handle authentication

**Option C: Shared Message Store**
- Both OpenClaw and FLOW read/write to same database
- Most robust but requires data layer changes

## What I Documented

From `memory/13-02-2026.md` and `memory/14-02-2026.md`:

### SSE Implementation for Instant Display
- **Problem:** 3-second polling delay for messages to appear
- **Tried:** WebSocket vs SSE research
- **Fix:** SSE (Server-Sent Events) — messages now display in ~500ms
- **Bug fixed:** Message duplication from SSE + polling race condition

### Key Code Change
```javascript
// BEFORE - caused duplicates:
eventSource.onmessage = (event) => {
    const message = JSON.parse(event.data);
    // Direct DOM manipulation - raced with polling
    chatMessages.appendChild(messageDiv);
}

// AFTER - clean:
eventSource.onmessage = (event) => {
    const message = JSON.parse(event.data);
    // Reload from server - single source of truth
    loadChat();
}
```

## Current State

| Feature | Status |
|---------|--------|
| FlowChat → OpenClaw | ✅ Working (via webhook) |
| Instant display in dashboard | ✅ Working (SSE) |
| Channel list display | ✅ Fixed (added endpoint) |
| Telegram → FlowChat | ❌ Not implemented |

## Next Steps

1. Restart FLOW server to pick up channels endpoint fix
2. Decide on Telegram sync architecture (Option A recommended)
3. Implement bidirectional message sync if desired
