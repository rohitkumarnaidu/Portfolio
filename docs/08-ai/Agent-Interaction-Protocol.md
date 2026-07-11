> **Status:** 🎯 DESIGN SPEC — Not Implemented
> This document describes an aspirational future design. The features described here are NOT yet implemented in the codebase.
> For current AI implementation documentation, see:
> - [AI Strategy](../docs/ai/strategy.md)
> - [Model Decision Matrix](../docs/ai/model-decision-matrix.md)

# 🤝 Agent-Interaction Protocol — Inter-Agent Communication Standards

> **Document:** `Agent-Interaction-Protocol.md` | **Version:** 1.0 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Principal AI Architect | **Review Cadence:** Quarterly  
> **Related:** [PromptLibrary.md](./PromptLibrary.md) | [AGENT-NETWORKING.md](./AGENT-NETWORKING.md) | [Agent.md](./Agent.md) | [18-AGENTS.md](./18-AGENTS.md)

---

## Executive Summary

The Agent-Interaction Protocol defines the standard message format, intent types, response schemas, error handling, and streaming semantics for all inter-agent communication in the enterprise ecosystem. Every message — whether command, query, event, or stream — conforms to a single JSON envelope with typed headers, a correlation chain, and an idempotency key. This ensures that all agents, regardless of implementation language or runtime, can interoperate reliably and be traced through the observability stack.

---

## 1. Message Format

### 1.1 Universal Envelope

```json
{
  "protocolVersion": "1.0",
  "messageId": "msg_abc123",
  "correlationId": "corr_def456",
  "idempotencyKey": "idem_789xyz",
  "timestamp": "2026-07-11T14:30:00.000Z",
  "source": "agent.supervisor.v1",
  "destination": "agent.research.v2",
  "ttl": 30000,
  "priority": "high",
  "headers": {
    "contentType": "application/json",
    "acceptVersion": "^1.0",
    "traceFlags": ["sampled", "critical"]
  },
  "intent": "command.execute",
  "payload": {}
}
```

| Field | Type | Description |
|-------|------|-------------|
| `protocolVersion` | string | Semantic version of the protocol |
| `messageId` | string | Unique message identifier (ULID) |
| `correlationId` | string | Trace correlation across hops |
| `idempotencyKey` | string | Deduplication key for at-least-once delivery |
| `ttl` | integer | Message expiry in milliseconds |
| `priority` | enum | `low`, `medium`, `high`, `critical` |
| `intent` | string | The interaction intent type |

---

## 2. Intent Types

| Intent | Direction | Description | Response Expected |
|--------|-----------|-------------|-------------------|
| `command.execute` | Supervisor → Specialist | Execute a named command | Yes — result or error |
| `query.request` | Any → Any | Request data or knowledge | Yes — data response |
| `event.publish` | Any → All Subscribers | Broadcast an event | No — fire-and-forget |
| `stream.subscribe` | Consumer → Producer | Begin streaming data | Yes — stream of chunks |
| `heartbeat` | Any → Registry | Liveness check | Yes — ack |
| `negotiate.capabilities` | Any → Any | Capability exchange | Yes — capability manifest |

### 2.1 Command Execution

```json
{
  "intent": "command.execute",
  "payload": {
    "command": "analyze.threat",
    "args": { "source": "log-stream", "timeRange": "24h" },
    "timeout": 30000
  },
  "response": {
    "status": "success",
    "data": { "threats": [], "scanDurationMs": 1234 }
  }
}
```

---

## 3. Response Schemas and Error Handling

### 3.1 Response Envelope

| Field | Type | Description |
|-------|------|-------------|
| `status` | enum | `success`, `error`, `partial`, `pending` |
| `data` | any | Successful response payload |
| `error` | object | Error details (code, message, details) |
| `metrics` | object | Execution duration, token count, retry info |

### 3.2 Error Codes

| Code | HTTP Equivalent | Meaning |
|------|-----------------|---------|
| `TIMEOUT` | 504 | Agent did not respond within TTL |
| `CAPABILITY_MISMATCH` | 400 | Requested capability not provided |
| `RATE_LIMITED` | 429 | Destination agent overwhelmed |
| `MALFORMED_MESSAGE` | 400 | Invalid message structure |
| `AUTH_DENIED` | 403 | Source not authorized for intent |
| `NOT_FOUND` | 404 | Agent or command not found |

---

## 4. Streaming Protocol

### 4.1 Stream Lifecycle

```
Client → SUBSCRIBE (intent: stream.subscribe, topic: "logs.realtime")
Server → CHUNK (sequence: 1, data: {...})
Server → CHUNK (sequence: 2, data: {...})
Server → CHUNK (sequence: 3, data: {...})
Server → COMPLETE (sequence: -1, summary: { totalChunks: 3 })
```

| Stream Event | Description |
|-------------|-------------|
| `SUBSCRIBE` | Initiate stream with topic filter and optional cursor |
| `CHUNK` | Incremental data chunk with sequence number |
| `KEEPALIVE` | No-data heartbeat every 15s to prevent timeout |
| `COMPLETE` | Final event with summary metadata |
| `ERROR` | Stream-terminating error with diagnostics |

---

## 5. Conversation Context Passing

Agents propagate conversation context via the `headers.context` field:

| Context Key | Type | Description |
|------------|------|-------------|
| `sessionId` | string | Active conversation session |
| `visitorId` | string | End-user identifier |
| `turnCount` | integer | Number of conversation turns |
| `tokenBudget` | integer | Remaining token allowance |
| `contextualMemory` | object[] | Summarized previous interactions |

Context is immutable once set by the supervisor; specialist agents may append observations but cannot overwrite.

---

## 6. Related Documentation

| Document | Description |
|----------|-------------|
| [PromptLibrary.md](./PromptLibrary.md) | Prompt templates and agent instruction patterns |
| [AGENT-NETWORKING.md](./AGENT-NETWORKING.md) | Transport layer, discovery, and routing |
| [Agent.md](./Agent.md) | Agent base architecture and message bus |
| [18-AGENTS.md](./18-AGENTS.md) | Multi-agent orchestration and supervisor pattern |

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jul 2026 | Initial inter-agent communication protocol | Principal AI Architect |
