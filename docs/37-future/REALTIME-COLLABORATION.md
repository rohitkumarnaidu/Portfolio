# Real-Time Collaboration Platform — Multi-User Editor & Presence System

> **Document:** `docs/37-future/REALTIME-COLLABORATION.md`
> **Status:** Design Spec
> **Version:** 1.0
> **Last Updated:** July 2026
> **Owner:** Lead Platform Engineer / CMS Team
> **Audience:** Engineering team, CMS stakeholders, Infrastructure

---

## 1. Executive Summary

The Real-Time Collaboration Platform brings multi-user editing capabilities to the admin CMS, enabling concurrent editing of blog posts and portfolio content with live cursor presence, operational transform (OT)-based conflict resolution, and real-time notifications. The system is built on the existing `@tiptap/react` rich text editor (v3.27.1, installed via `apps/web/package.json:37-38`) and extends it with a WebSocket-based collaboration layer powered by NestJS Gateways and BullMQ for persistence.

The platform targets the IB-05 initiative from the Innovation Backlog (`docs/25-roadmap/INNOVATION-BACKLOG.md:26-27`): "Real-time Collaboration for Blog CMS" with an 8–10 week effort estimate. It lays the foundation for broader collaboration features including collaborative section editing, project case studies, and eventually real-time admin dashboard presence.

Current state: the CMS uses Tiptap for single-user rich text editing in the admin blog interface. The `@tiptap/pm` ProseMirror dependency is already installed, providing the underlying document model that OT algorithms operate on. The admin authentication system uses JWT tokens with role-based access (`admin`, `editor`, `viewer` roles defined in `UserRole` enum at `apps/api/prisma/schema.prisma:10-14`).

---

## 2. Purpose

Design and specify a real-time collaboration system that:

- Enables concurrent editing of blog posts and CMS content by multiple users
- Provides live cursor presence showing who is editing and where
- Implements operational transform (OT) for conflict resolution
- Delivers real-time notifications for collaboration events (join, leave, comment, save)
- Integrates with the existing Tiptap editor, JWT auth, and admin infrastructure
- Scales from 2 concurrent editors to 20+ on a single document
- Handles network interruptions gracefully with offline recovery

---

## 3. Architecture Overview

```
                          WebSocket Connections
┌─────────────────────────────────────────────────────────────────────────┐
│  Admin Browser A          Admin Browser B          Admin Browser C     │
│  (JWT: editor@...)        (JWT: admin@...)         (JWT: editor@...)   │
│                                                                         │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐  │
│  │ Tiptap Editor   │     │ Tiptap Editor   │     │ Tiptap Editor   │  │
│  │ + Collab Ext    │     │ + Collab Ext    │     │ + Collab Ext    │  │
│  │ + Presence SDK  │     │ + Presence SDK  │     │ + Presence SDK  │  │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘  │
│           │ WebSocket            │ WebSocket            │ WebSocket   │
│           │ (wss://api/admin/     │ (wss://api/admin/     │ (wss://api/ │
│           │  collab/blog/post-1) │  collab/blog/post-1) │  admin/...)  │
└───────────┼──────────────────────┼──────────────────────┼──────────────┘
            │                      │                      │
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Vercel Edge Network                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Vercel WebSocket Proxy (upgrade to server)                     │  │
│  │  • Upgrades HTTP to WS connection to NestJS instance            │  │
│  │  • Handles CORS and JWT cookie forwarding                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ WebSocket (ws://)
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  NestJS WebSocket Gateway (apps/api)                                    │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  CollaborationGateway (@WebSocketGateway)                        │  │
│  │  Namespace: /collab                                              │  │
│  │  Path: /api/ws                                                   │  │
│  │                                                                  │  │
│  │  ┌──────────────────────┐  ┌──────────────────────┐             │  │
│  │  │  Room Manager        │  │  Auth Guard          │             │  │
│  │  │  • Document rooms    │  │  • JWT validation    │             │  │
│  │  │  • User roster       │  │  • Role check per    │             │  │
│  │  │  • Room lifecycle    │  │    document action   │             │  │
│  │  └──────────────────────┘  └──────────────────────┘             │  │
│  │                                                                  │  │
│  │  ┌──────────────────────┐  ┌──────────────────────┐             │  │
│  │  │  OT Engine           │  │  Presence Tracker    │             │  │
│  │  │  • Transform ops     │  │  • Cursor positions  │             │  │
│  │  │  • Version control   │  │  • Selection ranges  │             │  │
│  │  │  • Acknowledge ops   │  │  • User status       │             │  │
│  │  └──────────────────────┘  └──────────────────────┘             │  │
│  │                                                                  │  │
│  │  ┌──────────────────────┐  ┌──────────────────────┐             │  │
│  │  │  History Buffer      │  │  Persistence Queue   │             │  │
│  │  │  • Recent ops buffer │  │  • BullMQ producer   │             │  │
│  │  │  • Snapshot interval │  │  • Write-through     │             │  │
│  │  └──────────────────────┘  └──────────────────────┘             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ Redis (BullMQ + Presence)
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Redis Instance                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  BullMQ Queues       │  │  Pub/Sub Channels    │                    │
│  │  • collab.persist    │  │  • collab:ops:roomId  │                    │
│  │  • collab.snapshot   │  │  • collab:presence    │                    │
│  │  • collab.notify     │  │  • collab:notify      │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  Presence Store      │  │  Ops Buffer          │                    │
│  │  • User status per   │  │  • Last N operations │                    │
│  │    document room     │  │    per document      │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PostgreSQL (Primary Data Store)                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  BlogPost (existing) │  │  CollabSession (new) │                    │
│  │  • id, content, etc. │  │  • active sessions   │                    │
│  │                      │  │    per document      │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  DocumentOp (new)    │  │  CollabSnapshot (new)│                    │
│  │  • OT operation log  │  │  • Periodic document │                    │
│  │  • Version history   │  │    snapshots         │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. WebSocket Architecture

### 4.1 Gateway Configuration

The collaboration WebSocket gateway runs within the NestJS API (`apps/api`), sharing the same HTTP server:

```typescript
@WebSocketGateway({
  namespace: '/collab',
  path: '/api/ws',
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  transports: ['websocket', 'polling'], // polling as fallback
})
export class CollaborationGateway {
  // ...
}
```

**Decision rationale:** Running the WebSocket gateway inside the existing NestJS HTTP server avoids the operational complexity of a separate WebSocket service. The NestJS platform-agnostic `@nestjs/platform-socket.io` adapter handles transport fallback and room management natively. For horizontal scaling, Redis `socket.io` adapter distributes events across instances.

### 4.2 Connection Lifecycle

```
Client                      NestJS Gateway              Redis              PostgreSQL
  │                              │                       │                    │
  │── CONNECT (wss://) ──────────>                       │                    │
  │                              │── Auth Check ────────>│                    │
  │                              │<─── Token Valid ──────│                    │
  │<── CONNECTED (socket.id) ────│                       │                    │
  │                              │                       │                    │
  │── JOIN_ROOM {                │                       │                    │
  │     documentId,              │                       │                    │
  │     documentType             │                       │                    │
  │   } ────────────────────────>│                       │                    │
  │                              │── Add to room ───────>│                    │
  │                              │── Check permissions ──>────────────────────>│
  │                              │<── Permission OK ─────│<───────────────────│
  │                              │── Load document ─────>│<───────────────────>│
  │<── ROOM_JOINED {             │                       │                    │
  │       document,              │                       │                    │
  │       version,               │                       │                    │
  │       activeUsers,           │                       │                    │
  │       recentOps              │                       │                    │
  │     } ───────────────────────│                       │                    │
  │                              │                       │                    │
  │══ User types ════════════════│                       │                    │
  │                              │                       │                    │
  │── OPERATION {                │                       │                    │
  │     ops: Step[],             │                       │                    │
  │     version: number,         │                       │                    │
  │     documentId               │                       │                    │
  │   } ────────────────────────>│                       │                    │
  │                              │── Transform ops ─────>│                    │
  │                              │── Broadcast to room   │                    │
  │                              │   (excl. sender) ────>│                    │
  │<── ACK { version: n+1 } ─────│<─── Persist ─────────>│<───────────────────>│
  │                              │                       │                    │
  │── CURSOR_UPDATE {            │                       │                    │
  │     position, selection,     │                       │                    │
  │     documentId               │                       │                    │
  │   } ────────────────────────>│                       │                    │
  │                              │── Broadcast to room   │                    │
  │                              │   (excl. sender) ────>│                    │
  │<── CURSOR_UPDATE (from B) ───│                       │                    │
  │                              │                       │                    │
  │── LEAVE_ROOM {               │                       │                    │
  │     documentId               │                       │                    │
  │   } ────────────────────────>│                       │                    │
  │                              │── Remove from room ──>│                    │
  │                              │── Broadcast leave ───>│                    │
  │<── ROOM_LEFT ────────────────│                       │                    │
```

### 4.3 WebSocket Events Protocol

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `JOIN_ROOM` | `{ documentId, documentType }` | Request to join a collaboration room |
| `LEAVE_ROOM` | `{ documentId }` | Leave a collaboration room |
| `OPERATION` | `{ ops: Step[], version, documentId }` | Submit operational transforms |
| `CURSOR_UPDATE` | `{ position: { anchor, head }, selection: { from, to }, documentId }` | Broadcast cursor position |
| `REQUEST_SAVE` | `{ documentId }` | Request a forced save of current state |
| `COMMENT_ADD` | `{ documentId, selection, text }` | Add a comment on a text selection |
| `COMMENT_RESOLVE` | `{ documentId, commentId }` | Mark a comment as resolved |
| `HEARTBEAT` | `{ timestamp }` | Connection keepalive (every 30s) |
| `RECONNECT` | `{ documentId, lastVersion, sessionId }` | Reconnect after disconnect |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ROOM_JOINED` | `{ document, version, activeUsers, recentOps }` | Room join confirmation with initial state |
| `ROOM_LEFT` | `{ documentId }` | Room leave confirmation |
| `OPERATION` | `{ ops, version, userId }` | Transformed operations from other users |
| `ACK` | `{ version }` | Acknowledgment of submitted operation |
| `SAVE_ACK` | `{ documentId, savedAt }` | Save confirmation |
| `CURSOR_UPDATE` | `{ userId, userName, avatarUrl, position, selection }` | Cursor position from other user |
| `USER_JOINED` | `{ userId, userName, avatarUrl, role }` | A user joined the room |
| `USER_LEFT` | `{ userId, userName }` | A user left the room |
| `COMMENT_ADDED` | `{ commentId, userId, selection, text }` | New comment added |
| `COMMENT_RESOLVED` | `{ commentId, userId }` | Comment resolved |
| `VERSION_MISMATCH` | `{ serverVersion, clientVersion }` | Client version is behind; trigger full sync |
| `ERROR` | `{ code, message }` | Error notification |
| `PONG` | `{ timestamp }` | Heartbeat response |
| `FORCE_SAVE` | `{ documentId }` | Server requests client to save (idle timeout) |

---

## 5. Operational Transform (OT) Engine

### 5.1 Algorithm Selection

The system uses a **client-server OT** model (not peer-to-peer) with the server as the authority:

| Characteristic | Design Choice | Rationale |
|----------------|---------------|-----------|
| OT Model | Client-Server | Server is single source of truth; simplifies conflict resolution |
| OT Type | JSON OT (ProseMirror native) | Tiptap/ProseMirror's document model produces JSON operations natively |
| Versioning | Monotonic per-document version | Every operation increments the document version |
| Acknowledgment | Server ACK before next op | Prevents client from getting ahead of server state |
| Retry | Exponential backoff (3 max) | Handles transient network failures |
| Snapshot Interval | Every 25 operations or 5 minutes | Provides recovery points for late-joining clients |

### 5.2 OT Operation Format (ProseMirror Step)

Operations are ProseMirror `Step` JSON objects, which the existing `@tiptap/pm` dependency already understands:

```json
{
  "ops": [
    {
      "stepType": "replace",
      "from": 42,
      "to": 47,
      "slice": {
        "content": [
          {
            "type": "text",
            "text": "world"
          }
        ]
      }
    }
  ],
  "version": 14,
  "origin": "user-abc-123",
  "timestamp": "2026-07-12T14:30:00.000Z"
}
```

### 5.3 Transformation Rules

The server maintains a stack of recent operations per document. When a new operation arrives at version `v`, it is transformed against all operations after `v` before being applied:

```
Incoming Op at version v
         │
         ▼
  ┌───────────────┐
  │ Transform     │──→ Transform against ops[v+1..n]
  │ Against       │──→ Ops may be split, merged, or adjusted
  │ History       │
  └───────┬───────┘
          │
          ▼
  ┌───────────────┐
  │ Apply to      │──→ Apply transformed op to server document
  │ Document      │
  └───────┬───────┘
          │
          ▼
  ┌───────────────┐
  │ Broadcast     │──→ Send transformed op to all room members
  │ & Persist     │──→ Enqueue for BullMQ persistence
  └───────────────┘
```

ProseMirror's built-in OT support handles most cases natively. Custom transformation logic is only required for:

- **Comment anchors**: When an operation changes text near a comment, the comment's `from`/`to` positions must be adjusted
- **Cursor positions**: Remote cursors are adjusted when text is inserted before them
- **Formatting conflicts**: When two users apply different formatting to the same selection, server wins as tiebreaker

### 5.4 History Buffer

The Gateway maintains an in-memory buffer of the last 50 operations per document (configurable via `COLLAB_HISTORY_BUFFER_SIZE` env var). This buffer:

- Enables recovery for late-joining clients without a full document load
- Provides the transformation context for new operations
- Is backed by Redis for resilience across gateway restarts

When the buffer exceeds 50 ops, the oldest ops are collapsed into a snapshot:

```
Op 1  → Op 2  → ... → Op 50  → Snapshot v50
Op 51 → Op 52 → ... → Op 100 → Snapshot v100
```

---

## 6. Presence System

### 6.1 Cursor Presence

Each user's cursor position and text selection are broadcast to the room at a throttled rate:

| Setting | Value | Rationale |
|---------|-------|-----------|
| Broadcast throttle | 50ms (20 updates/sec) | Smooth cursor movement without network flood |
| Debounce on idle | 500ms | Stop broadcasting when user pauses typing |
| Max users tracked | 20 per document | Practical limit for CMS editing |
| Cursor retention | 30s after disconnect | Show "disconnected" state before removing cursor |

### 6.2 User Presence States

```
State Machine:
  OFFLINE ──> CONNECTING ──> ONLINE ──> IDLE ──> OFFLINE
                  │             │         │
                  └─────────────┴─────────┘
                             │
                          AWAY (tab hidden for > 5 min)
```

| State | Visual | Description |
|-------|--------|-------------|
| ONLINE | Green dot | Connected and actively editing |
| IDLE | Yellow dot | Connected but no activity for 2 min |
| AWAY | Gray dot | Tab hidden or system idle (>5 min) |
| DISCONNECTED | Red dot (faded after 30s) | Connection lost, waiting for reconnect |
| OFFLINE | No indicator | Not connected |

### 6.3 Avatar System

User avatars shown in the editor margin display:

- The user's `avatar_url` from the `User` model (if available)
- Fallback: a colored circle with initials derived from `display_name`
- Each user is assigned a consistent color from a 12-color palette, hashed from their `user_id`

---

## 7. Data Model Changes

### 7.1 New Prisma Models

```prisma
// —── Document Operation Log —─────────────────────────
model DocumentOperation {
  id           String   @id @default(uuid())
  documentType String   @map("document_type") // "blog" | "section" | "project"
  documentId   String   @map("document_id")
  version      Int
  steps        Json     // Array of ProseMirror Step objects
  userId       String   @map("user_id")
  userAgent    String?  @map("user_agent")
  ipAddress    String?  @map("ip_address")
  createdAt    DateTime @default(now()) @map("created_at")

  @@unique([documentType, documentId, version])
  @@index([documentType, documentId, createdAt(sort: Desc)])
  @@index([createdAt])
  @@map("document_operations")
}

// —── Collaboration Snapshot —─────────────────────────
model CollaborationSnapshot {
  id           String   @id @default(uuid())
  documentType String   @map("document_type")
  documentId   String   @map("document_id")
  version      Int
  documentState Json    // Complete ProseMirror document JSON
  createdAt    DateTime @default(now()) @map("created_at")

  @@unique([documentType, documentId, version])
  @@index([documentType, documentId, createdAt(sort: Desc)])
  @@map("collaboration_snapshots")
}

// —── Collaboration Comment —──────────────────────────
model CollaborationComment {
  id           String    @id @default(uuid())
  documentType String    @map("document_type")
  documentId   String    @map("document_id")
  userId       String    @map("user_id")
  fromPos      Int       @map("from_pos")
  toPos        Int       @map("to_pos")
  text         String
  isResolved   Boolean   @default(false) @map("is_resolved")
  resolvedBy   String?   @map("resolved_by")
  resolvedAt   DateTime? @map("resolved_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  user         User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([documentType, documentId])
  @@index([documentType, documentId, isResolved])
  @@map("collaboration_comments")
}

// —── Active Session (for presence tracking) —─────────
model CollaborationSession {
  id           String   @id @default(uuid())
  documentType String   @map("document_type")
  documentId   String   @map("document_id")
  userId       String   @map("user_id")
  socketId     String?  @map("socket_id")
  joinedAt     DateTime @default(now()) @map("joined_at")
  lastActiveAt DateTime @default(now()) @map("last_active_at")
  leftAt       DateTime? @map("left_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([documentType, documentId])
  @@index([userId])
  @@map("collaboration_sessions")
}
```

### 7.2 Extensions to Existing Models

```prisma
// Add to BlogPost model:
model BlogPost {
  // ... existing fields ...
  currentVersion   Int      @default(0) @map("current_version")
  isCurrentlyEdited Boolean @default(false) @map("is_currently_edited")
  editorLockId     String?  @map("editor_lock_id")
}

// Add to Section model:
model Section {
  // ... existing fields ...
  currentVersion   Int      @default(0) @map("current_version")
}
```

### 7.3 Migration Strategy

```
Phase 1: ──→ Add `document_operations` table
              Add `collaboration_snapshots` table
              Add `collaboration_comments` table
              Add `collaboration_sessions` table

Phase 2: ──→ Add `current_version` and `is_currently_edited` to BlogPost
              Add `current_version` to Section
              
Phase 3: ──→ Add TTL indexes on `collaboration_sessions.leftAt`
              Add cleanup job for stale sessions (>24h)
              Add archive job for old operations (>90 days)
```

---

## 8. Frontend Integration

### 8.1 Tiptap Collaboration Extension

The collaboration hooks into Tiptap via a custom `CollaborationExtension` that wraps ProseMirror's collaboration plugin:

```typescript
// apps/web/src/lib/collaboration/extension.ts
import { Extension } from '@tiptap/core';
import { collaborationPlugin } from './plugin';

export const CollaborationExtension = Extension.create({
  name: 'collaboration',

  addOptions() {
    return {
      client: null as CollaborationClient | null,
      documentId: '',
      userId: '',
      debounce: 50,
    };
  },

  addProseMirrorPlugins() {
    if (!this.options.client) return [];
    return [
      collaborationPlugin({
        client: this.options.client,
        documentId: this.options.documentId,
        userId: this.options.userId,
        debounce: this.options.debounce,
      }),
    ];
  },
});
```

### 8.2 Collaboration Client SDK

A lightweight WebSocket client abstracts the real-time connection:

```typescript
// apps/web/src/lib/collaboration/client.ts
class CollaborationClient {
  private socket: Socket | null = null;
  private documentId: string;
  private userId: string;
  private token: string;
  private pendingOps: Step[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor(config: {
    documentId: string;
    userId: string;
    token: string;
    wsEndpoint?: string;
  }) {
    this.documentId = config.documentId;
    this.userId = config.userId;
    this.token = config.token;
    this.reconnectAttempts = 0;
  }

  // Connect to collaboration room
  async connect(documentType: string): Promise<void> { /* ... */ }

  // Disconnect from room
  disconnect(): void { /* ... */ }

  // Submit an operation
  submitOperation(ops: Step[], version: number): void { /* ... */ }

  // Update cursor position
  updateCursor(position: { anchor: number; head: number }): void { /* ... */ }

  // Add a comment
  addComment(selection: { from: number; to: number }, text: string): void { /* ... */ }

  // Listen for events
  onOperation(callback: (op: RemoteOperation) => void): void { /* ... */ }
  onCursorUpdate(callback: (cursor: RemoteCursor) => void): void { /* ... */ }
  onUserJoined(callback: (user: RoomUser) => void): void { /* ... */ }
  onUserLeft(callback: (userId: string) => void): void { /* ... */ }

  // Reconnect handler
  private handleReconnect(): void { /* ... */ }

  // Heartbeat
  private startHeartbeat(): void { /* ... */ }
}
```

### 8.3 Cursor Overlay Component

The remote cursor rendering is handled by a React component:

```typescript
// apps/web/src/components/admin/collab/CursorOverlay.tsx
interface RemoteCursor {
  userId: string;
  userName: string;
  avatarUrl?: string;
  color: string;
  position: { anchor: number; head: number };
  lastActive: number;
  state: 'online' | 'idle' | 'away';
}

// Renders colored cursor indicators and selection highlights
// Positioned absolutely over the editor using ProseMirror's coordinate mapping
```

### 8.4 User Presence Bar

A presence indicator bar renders above the editor:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📝 Editing: "My Blog Post"                                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  ● Alice (editing...)    ● Bob (idle)    ○ Charlie (viewing)    │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  [Editor toolbar]                                       │   │  │
│  │  │                                                          │   │  │
│  │  │  Alice's cursor ▶ The quick brown fox jumps over the     │   │  │
│  │  │  lazy dog. The quick brown■Bob's cursor                  │   │  │
│  │  │                                                          │   │  │
│  │  │  ┌──────────────────────────────────────────────────┐    │   │  │
│  │  │  │  💬 Bob: This paragraph should link to case study│    │   │  │
│  │  │  │  ✅ Resolved by Alice                             │    │   │  │
│  │  │  └──────────────────────────────────────────────────┘    │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Persistence Strategy

### 9.1 Write-Through Persistence

Operations are persisted to PostgreSQL via a BullMQ queue to avoid blocking the WebSocket event loop:

```
WebSocket Gateway                  BullMQ                        PostgreSQL
      │                              │                              │
      │── broadcast op to room ──────>                              │
      │── enqueue persist job ───────>                              │
      │                              │── Write to                    │
      │                              │   document_operations ───────>│
      │                              │                              │
      │                              │── If mod 25:                  │
      │                              │   Apply ops to document ─────>│
      │                              │   Create snapshot ───────────>│
      │                              │─                              │
      │<── persist complete ─────────│                               │
```

### 9.2 Snapshot Schedule

| Trigger | Action | Frequency |
|---------|--------|-----------|
| Every 25 operations | Create snapshot | ~25 ops / burst |
| Every 5 minutes of editing | Create snapshot | Time-based |
| On last user leave | Create final snapshot | Session end |
| On explicit save | Create snapshot | User action |

### 9.3 Document Loading

When a client joins a room:

1. Load latest `CollaborationSnapshot` for the document
2. Apply any operations after that snapshot's version from `DocumentOperation`
3. Send the reconstructed document + current version to the client

This avoids loading the entire operation history for each new client.

---

## 10. Real-Time Notifications

### 10.1 Notification Events

The collaboration system emits real-time notifications for these events:

| Event | Channel | Recipients | Message |
|-------|---------|------------|---------|
| User joined document | Room broadcast | All users in room | "Alice started editing" |
| User left document | Room broadcast | All users in room | "Alice left" |
| Comment added | Room broadcast + DM | Room users + @mentioned users | "Bob commented on 'My Blog Post'" |
| Comment resolved | Room broadcast | All users in room | "Alice resolved Bob's comment" |
| Document saved | Room broadcast | All users in room | "Document saved (v42)" |
| Document published | Admin notification | All admin users | "Charlie published 'My Blog Post'" |
| Conflict detected | DM to affected user | Conflicting users | "Conflict resolved by server" |

### 10.2 Notification Infrastructure

Notifications reuse the existing `Notification` model (`apps/api/prisma/schema.prisma:458-472`) with `channel: "websocket"`:

```typescript
// Realtime notifications are stored in the Notification model
// and also broadcast via WebSocket for instant delivery
{
  type: 'collab.comment_added',
  title: 'New comment on "My Blog Post"',
  body: 'Bob: This paragraph needs a source link',
  channel: 'websocket',
  payload: {
    documentId: 'post-123',
    documentType: 'blog',
    commentId: 'comment-456',
    selection: { from: 120, to: 180 },
    actorId: 'user-789',
    actorName: 'Bob',
    avatarUrl: '...',
  },
}
```

---

## 11. Security Considerations

### 11.1 Authentication & Authorization

| Layer | Mechanism | Implementation |
|-------|-----------|----------------|
| WebSocket connection | JWT token in `auth` handshake param | `socket.handshake.auth.token` validated by `JwtAuthGuard` |
| Room access | Document-level permission check | Check user role against document access level |
| Read-only viewers | `viewer` role assigned to room with read-only flag | `Socket#emit` only cursor events, never operations |
| Rate limiting | Per-socket operation rate limiter | Max 20 ops/sec; excess triggers `ERROR` event |
| Reconnection | Session token + reconnect handshake | Re-validate JWT on reconnect |

### 11.2 Input Validation

All operations are validated server-side before transformation:

1. **Operation format validation**: Must be valid ProseMirror Step JSON (via Zod schema)
2. **Size limits**: Single operation payload < 64 KB; batch < 512 KB
3. **Rate limits**: Per-socket, per-document, and global rate limits
4. **Content sanitization**: Existing HTML sanitization pipeline applied on save

### 11.3 Document Locking

To prevent excessive merge conflicts, a soft locking mechanism is used:

- **Paragraph-level lock**: When a user starts typing in a paragraph, a soft lock is acquired
- **Lock duration**: 30s idle timeout, or released on cursor move to another paragraph
- **Override**: Editors can override locks; admins can force-release locks
- **Visual indication**: Locked paragraphs show a colored left border + user avatar

### 11.4 Data Retention

| Data | Retention | Cleanup |
|------|-----------|---------|
| Document operations | 90 days | Cron job archives to cold storage |
| Collaboration snapshots | 365 days | Oldest kept weekly, monthly, yearly |
| Collaboration comments | Indefinite | Kept as part of document history |
| Collaboration sessions | 24h after last activity | Cron cleanup of `leftAt` rows |
| Active session presence | Real-time, Redis-backed | TTL of 60s on Redis keys |

---

## 12. Performance Considerations

### 12.1 Scaling Strategy

| Scale Level | Concurrent Editors per Document | Approach |
|-------------|-------------------------------|----------|
| Level 1 | 2–5 | Single gateway instance, in-memory OT buffer |
| Level 2 | 5–20 | Redis-backed OT buffer, horizontal gateway scaling |
| Level 3 | 20–50 | Sharded document rooms across gateway instances |
| Level 4 | 50+ | Dedicated collaboration service (migrate from gateway) |

### 12.2 Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| Operation broadcast latency | < 30ms P95 (within same region) | Server timing + client-side measurement |
| Operation transformation latency | < 5ms P95 | NestJS OT engine timing |
| Document load time (first join) | < 2s for 100KB document | Client-side timing |
| Cursor update broadcast latency | < 50ms P95 | Server broadcast timing |
| WebSocket connection time | < 500ms | Client-side timing |
| Maximum concurrent WebSocket connections | 500 per instance | Load test |
| Redis memory per active document | ~2 KB per user + ~50 KB per doc | Redis INFO memory |
| BullMQ persist queue backlog | < 1000 jobs | BullMQ dashboard |
| API overhead with collab active | < 10% increased response time | Sentry tracing |

### 12.3 Impact on Existing Stack

- **API memory**: Each WebSocket connection uses ~5 KB overhead; 500 concurrent users = ~2.5 MB
- **Database writes**: Operation persistence adds ~1 write/editor/sec; 20 editors = ~1.7M writes/day
- **Database reads**: Document loading is infrequent (on join); snapshots reduce read amplification
- **Redis**: Pub/Sub for gateway scaling + BullMQ queues for persistence

---

## 13. Phased Rollout Plan

### Phase 1: Core Infrastructure (Weeks 1-3)

**Dependencies:** BullMQ operational, Redis available, Tiptap integrated (already done)

| Task | Est. Effort | Owner | Deliverable |
|------|-------------|-------|-------------|
| Create collaboration Prisma models | 1 day | Backend | Migration + seed |
| Build WebSocket Gateway with auth | 3 days | Backend | `CollaborationGateway` |
| Implement OT engine (ProseMirror wrapper) | 3 days | Backend | OT service |
| Build presence tracking system | 2 days | Backend | Presence service |
| Create BullMQ persistence queue | 2 days | Backend | Queue + worker |
| Write WebSocket event protocol | 1 day | All | Protocol spec + types |

**Phase 1 Gate:** Two browser tabs can connect, authenticate, and exchange cursor positions.

### Phase 2: Editor Integration (Weeks 4-6)

**Dependencies:** Phase 1 complete, admin blog editor refactored

| Task | Est. Effort | Owner | Deliverable |
|------|-------------|-------|-------------|
| Build Tiptap Collaboration Extension | 3 days | Frontend | Extension |
| Build Collaboration Client SDK | 3 days | Frontend | `client.ts` |
| Build Cursor Overlay component | 2 days | Frontend | `CursorOverlay.tsx` |
| Build User Presence Bar | 2 days | Frontend | `PresenceBar.tsx` |
| Integrate with admin blog editor | 2 days | Frontend | Editor integration |
| Handle offline/reconnect flow | 2 days | Frontend | Reconnection logic |
| Write snapshot/load logic | 2 days | Backend | Snapshot service |
| Write integration tests | 3 days | QA | Playwright tests |

**Phase 2 Gate:** Two users can edit the same blog post simultaneously with live cursor presence. Operations are persisted and recoverable on refresh.

### Phase 3: Comments & Notifications (Weeks 7-8)

**Dependencies:** Phase 2 complete, Notification model usable

| Task | Est. Effort | Owner | Deliverable |
|------|-------------|-------|-------------|
| Build inline comment system | 3 days | Frontend | Comment UI |
| Build comment API endpoints | 2 days | Backend | Comment CRUD |
| Integrate real-time notifications | 2 days | Both | Notification pipeline |
| Build comment notification preferences | 1 day | Frontend | Notification settings |
| Write E2E tests for comments | 2 days | QA | Test suite |

**Phase 3 Gate:** Inline commenting with real-time delivery works end-to-end. Notifications appear in admin notification center.

### Phase 4: Hardening & Scaling (Weeks 9-10)

**Dependencies:** Phase 3 complete, sufficient usage data

| Task | Est. Effort | Owner | Deliverable |
|------|-------------|-------|-------------|
| Load test with 20 concurrent editors | 2 days | Infrastructure | Load test report |
| Implement Redis adapter for gateway scaling | 2 days | Backend | Horizontal scaling |
| Add rate limiting and abuse prevention | 1 day | Backend | Rate limits |
| Add admin monitoring dashboard for collab | 2 days | Frontend | Dashboard |
| Security audit | 2 days | Security | Audit report |
| Documentation finalization | 1 day | All | Updated docs |
| Production rollout (10% → 50% → 100%) | 2 days | DevOps | Gradual rollout |

**Phase 4 Gate:** Production rollout complete. Zero data loss in 30 days of operation. P95 operation latency < 30ms.

---

## 14. Rollback & Recovery

### 14.1 Version History

The `DocumentOperation` table serves as an append-only operation log that enables:

- **Time travel**: Reconstruct document at any version
- **Undo for admins**: Revert to any snapshot
- **Conflict audit**: Review who made what change when
- **Data recovery**: Rebuild corrupted documents from operation log

### 14.2 Emergency Procedures

| Scenario | Recovery Action | RTO |
|----------|----------------|-----|
| Corrupted document state | Load latest snapshot + replay ops from that version | < 5 min |
| OT engine crash mid-operation | Ops are BullMQ-queued; replay on restart | < 30s |
| WebSocket gateway crash | Redis-backed presence restores state; clients reconnect | < 10s |
| Redis failure | Fall back to in-memory buffer; DB-backed presence | Immediate |
| Database failure | Cached snapshots in Redis; writes queued in BullMQ | < 60s |

---

## 15. Decision Log

| ID | Decision | Rationale |
|----|----------|-----------|
| RC-D001 | Client-server OT (not peer-to-peer) | Server as authority simplifies conflict resolution; client-server model is well-supported by ProseMirror |
| RC-D002 | BullMQ for persistence (not direct DB writes) | Prevents WebSocket event loop blocking; enables backpressure handling |
| RC-D003 | Socket.IO (not raw WebSocket) | Transport fallback, room management, and Redis adapter built-in; NestJS first-class support |
| RC-D004 | 50-op history buffer before snapshot | Balances memory usage with recovery speed; 50 ops is typically < 1 minute of collaborative editing |
| RC-D005 | Paragraph-level soft locking | Prevents excessive merge conflicts without blocking collaboration |
| RC-D006 | Operations retained for 90 days | Matches existing analytics data retention policy; sufficient for conflict audit |
| RC-D007 | Snapshots every 25 ops or 5 minutes | Predictable storage cost; snapshot load time < 2s for typical blog post |

---

## 16. Open Questions

| Question | Status | Owner | Target Resolution |
|----------|--------|-------|-------------------|
| Should collaboration extend to Section content (portfolio sections, not just blog)? | Pending | Product | Phase 2 |
| What is the max supported concurrent editors per document? | TBD | Engineering | Phase 4 load test |
| Should we support rich media collaboration (images, embeds)? | Pending | Product | Phase 3 |
| How do we handle anonymous/guest editors? | TBD | Security | Phase 2 |
| What is the storage cost of 90 days of operations? | TBD | Infrastructure | Phase 1 |

---

## 17. Cross-References

### Internal Documents

| Document | Path | Relevance |
|----------|------|-----------|
| Innovation Backlog | `docs/25-roadmap/INNOVATION-BACKLOG.md` | IB-05 (Real-time Collaboration for Blog CMS) |
| Tiptap ADR | `docs/adr/ADR-008-tiptap-editor.md` | Tiptap ProseMirror foundation for collaboration |
| BullMQ ADR | `docs/adr/ADR-017-bullmq-queue.md` | Persistence queue infrastructure |
| JWT ADR | `docs/adr/ADR-011-jwt-auth.md` | WebSocket authentication mechanism |
| Auth Architecture | `docs/security/15-AUTHORIZATION.md` | Role-based access for collaboration |
| Notification Model | `apps/api/prisma/schema.prisma:458-472` | Real-time notification storage |
| Admin Architecture | `docs/design/AdminArchitecture.md` | Admin panel integration points |
| CMS Architecture | `docs/20-cms/CMS-ARCHITECTURE.md` | CMS content model and workflows |
| Frontend Architecture | `docs/07-frontend/FRONTEND-ARCHITECTURE.md` | Frontend integration patterns |
| Security Architecture | `docs/security/SecurityArchitecture.md` | Overall security model |
| Scalability Strategy | `docs/15-performance/SCALABILITY-STRATEGY.md` | Horizontal scaling for WebSocket gateways |
| DevOps Architecture | `docs/operations/DevOpsArchitecture.md` | Infrastructure for WebSocket deployment |
| SOC 2 Readiness | `docs/36-enterprise/SOC2-READINESS.md` | SOC 2 control mapping for real-time features |

### ADR References

| ADR | Title | Relevance |
|-----|-------|-----------|
| ADR-008 | Tiptap Editor | ProseMirror OT foundation |
| ADR-011 | JWT Auth | WebSocket auth mechanism |
| ADR-017 | BullMQ Queue | Persistence async processing |
| ADR-016 | Sentry Error Tracking | Error monitoring for collab ops |
| ADR-003 | NestJS API | Gat eway platform (Socket.IO) |

### External References

- **ProseMirror Collaboration:** https://prosemirror.net/docs/guide/#collab — OT engine reference
- **Socket.IO:** https://socket.io/docs/v4/ — WebSocket transport library
- **Tiptap Collaboration:** https://tiptap.dev/docs/collaboration/getting-started — Official extension docs
- **OT Explained:** https://en.wikipedia.org/wiki/Operational_transformation — Algorithm reference

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jul 2026 | Initial design specification — Real-Time Collaboration Platform | Lead Platform Engineer |

---

*End of Document — Real-Time Collaboration Platform v1.0*
