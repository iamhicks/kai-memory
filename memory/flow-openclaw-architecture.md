# FLOW + OpenClaw Integration Architecture

## Problem Statement

For FLOW to be a viable product, messages must sync bidirectionally:
- **FlowChat → Telegram**: ✅ Working (via webhook)
- **Telegram → FlowChat**: ❌ No native OpenClaw support
- **AI Replies → Both**: ❌ Manual only

## Current Workaround (MVP)

Manual POST to `/api/receive`:
```bash
curl -X POST http://localhost:3456/api/receive \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Message from Telegram",
    "sender": "Pete",
    "channel": "telegram",
    "channelName": "Telegram"
  }'
```

## Product-Quality Solution

### Option A: OpenClaw Plugin (Recommended)

Build a custom OpenClaw plugin that:
1. Hooks into `message:received` events
2. Forwards to FLOW's `/api/receive` endpoint
3. Runs as a background service

**Pros:** Native integration, no polling
**Cons:** Requires Node.js plugin development

### Option B: Message Proxy Service

Standalone Node.js service that:
1. Polls OpenClaw Gateway for new messages
2. Forwards to FLOW
3. Also forwards FLOW messages to Telegram (replaces webhook)

**Pros:** Works with existing OpenClaw
**Cons:** Polling introduces latency

### Option C: WebSocket Bridge

FLOW connects to OpenClaw Gateway WebSocket:
```javascript
// FLOW server connects to Gateway
const ws = new WebSocket('ws://127.0.0.1:18789');
ws.on('message', (data) => {
  // Forward Telegram messages to FLOW database
});
```

**Pros:** Real-time, no polling
**Cons:** Requires authentication, complex error handling

## Recommended Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Telegram  │────────▶│  OpenClaw    │────────▶│    FLOW     │
│   (User)    │         │  Gateway     │         │  Dashboard  │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               │ WebSocket
                               ▼
                        ┌──────────────┐
                        │  Message     │
                        │  Bridge      │
                        │  (Plugin)    │
                        └──────────────┘
```

## Implementation Priority

1. **Immediate**: Use Option B (polling proxy) for demo
2. **Short-term**: Build Option A (native plugin)
3. **Long-term**: Option C (WebSocket) for enterprise

## Open Questions

- Should FLOW be an OpenClaw plugin itself?
- Should we fork OpenClaw to add native forwarding?
- What's the latency requirement for end users?
