# Fleet Management System - Design Document

**Date:** 2026-02-18  
**Project:** Mission Control - Fleet Orchestration  
**Author:** Toshi (AI Agent)

## Overview

Build a "Fleet Management" module that allows deploying, monitoring, and coordinating multiple specialized AI agents (sub-agents) simultaneously from a single interface.

## Goals

1. **Multi-Agent Orchestration:** Deploy and monitor multiple specialized agents
2. **Visual Command Center:** Real-time grid view of all active agents
3. **Semi-Automated Delegation:** Commander proposes plans, human approves, agents execute
4. **Shared Context:** Agents collaborate through shared mission memory
5. **Security & Isolation:** Tool restrictions, workspace isolation, HITL gates

## Architecture Overview

### High-Level Structure

```
Mission Control
├── /fleet (new page)
│   ├── War Room Grid (agent cards)
│   ├── Commander Control Panel
│   └── Persona Library
├── /fleet directory (file system)
│   ├── /personas (agent blueprints as JSON)
│   ├── /state (active agents tracking)
│   ├── /missions (shared memory per mission)
│   ├── /workspaces (isolated agent workspaces)
│   └── /logs (audit trail)
└── API Routes
    ├── /api/fleet/agents (CRUD operations)
    ├── /api/fleet/personas (load/save templates)
    ├── /api/fleet/missions (mission management)
    └── /api/fleet/commander (delegation logic)
```

### Core Concepts

**1. Personas = Agent Blueprints**
- JSON files defining personality, tools, constraints
- Examples: scout.json, builder.json, reviewer.json
- Stored in `/fleet/personas/`

**2. Missions = Goals with Context**
- High-level objective assigned to Commander
- Commander proposes execution plan (which personas to spawn)
- Shared memory lives under `/missions/{mission-id}/`

**3. State Store = Central Truth**
- `active-agents.json` tracks all running agents
- Each agent: sessionKey, persona, mission, status, metrics
- Persists across restarts

**4. Commander = Orchestrator**
- Special agent that doesn't execute tasks directly
- Reads goal, proposes plan, spawns specialists, monitors progress
- Uses `sessions_spawn` to create sub-agents

### Technology Stack

- **Agent Runtime:** Clawdbot `sessions_spawn` (sub-agent sessions)
- **Storage:** File-based (JSON for state, JSONL for logs)
- **UI:** Next.js page at `/fleet` with React components
- **Real-time Updates:** Polling (5s interval)

## Memory, Context & Security

### Memory Strategy

**1. Mission Context File**
- Location: `/fleet/missions/{mission-id}/context.json`
- Contains: goal, plan, timeline, shared findings
- Append-only log of agent contributions
- Never deleted, survives restarts

**2. Agent Workspace Isolation**
- Each agent: `/fleet/workspaces/{agent-id}/`
- Can't overwrite other agents' files
- Commander has read access to all workspaces

**3. Audit Trail**
- Location: `/fleet/logs/audit.jsonl`
- Logs: timestamp, agent-id, action, result
- JSONL format (one JSON per line)

### Context Management

**1. Shared Read, Controlled Write**
- All agents can read mission context
- Writes go through Commander for validation
- Agent posts → Commander validates → Adds to context

**2. Agent Memory Persistence**
- State saved to `/fleet/state/agent-{id}.json`
- Includes: conversation history, current step, pending tasks
- Agents resume from exact point of failure

### Security Layers

**1. Persona-Level Tool Restrictions**
```json
{
  "allowed_tools": ["web_search", "web_fetch"],
  "blocked_tools": ["exec", "write", "message"]
}
```

**2. HITL Gates for High-Risk Operations**
- Commander flags risky plans
- Blocks execution until approval
- Red card indicator in War Room UI

**3. Sandbox Validation**
- File writes checked against workspace boundaries
- No path traversal (`../`) allowed
- Tool calls validated against persona permissions

## UI Components

### Fleet Dashboard (`/fleet`)

**1. Agent Cards Grid**
- 3-column responsive layout
- Each card shows:
  - Agent name + icon
  - Status badge: 🟢 Active | 🟡 Waiting | 🔴 Blocked | ⚪ Idle
  - Current action (live string)
  - Progress bar (% completion)
  - Metrics: tokens used, cost, tasks completed
- Quick actions: Pause, Resume, Terminate

**2. Commander Control Panel**
- Mission input textarea
- Proposed plan display
- Approve/Reject buttons
- Active missions list (expandable)

**3. Persona Library**
- Sidebar with available templates
- Quick-launch: Select persona → Enter task → Deploy
- "New Persona" button

**4. Activity Feed**
- Real-time agent actions (like Thought Stream)
- Color-coded by agent
- Filter by mission or agent

## Data Models

### Persona Template (`/fleet/personas/{name}.json`)

```json
{
  "id": "scout-v1",
  "name": "Scout",
  "icon": "🔍",
  "soul": "You are a research specialist. Gather data efficiently, cite sources, and prioritize accuracy.",
  "allowed_tools": ["web_search", "web_fetch", "Read"],
  "blocked_tools": ["exec", "Write", "message", "Edit"],
  "default_model": "anthropic/claude-haiku-3-5",
  "max_tokens": 50000,
  "description": "Research specialist for data gathering"
}
```

### Active Agent State (`/fleet/state/agent-{id}.json`)

```json
{
  "id": "agent-abc123",
  "persona": "scout-v1",
  "mission_id": "flight-comparison",
  "status": "active",
  "objective": "Research flight booking APIs and document findings",
  "session_key": "agent:main:subagent:abc123",
  "created_at": 1708281600000,
  "last_activity": 1708282000000,
  "metrics": {
    "tokens_used": 12450,
    "cost_usd": 0.037,
    "tasks_completed": 3,
    "current_task": "Analyzing Kayak API documentation"
  },
  "workspace": "/fleet/workspaces/agent-abc123"
}
```

### Mission Context (`/fleet/missions/{mission-id}/context.json`)

```json
{
  "mission_id": "flight-comparison",
  "goal": "Build flight comparison feature for travel app",
  "created_at": 1708281600000,
  "commander_plan": {
    "proposed_at": 1708281605000,
    "approved_at": 1708281610000,
    "agents": [
      {
        "persona": "scout",
        "objective": "Research flight APIs",
        "estimated_duration": 600
      },
      {
        "persona": "builder",
        "objective": "Implement API integration",
        "depends_on": ["scout"]
      },
      {
        "persona": "reviewer",
        "objective": "Test and validate implementation",
        "depends_on": ["builder"]
      }
    ]
  },
  "shared_findings": {
    "scout": {
      "apis_found": ["kayak", "skyscanner", "google-flights"],
      "api_docs": {"kayak": "https://..."},
      "recommendations": "Kayak has best documentation"
    },
    "builder": {
      "status": "in_progress",
      "files_created": ["api-client.ts", "flight-types.ts"]
    }
  },
  "timeline": {
    "started": 1708281600000,
    "estimated_completion": 1708285200000,
    "actual_completion": null
  },
  "status": "in_progress"
}
```

### Active Agents Registry (`/fleet/state/active-agents.json`)

```json
{
  "agents": [
    {
      "id": "agent-abc123",
      "persona": "scout-v1",
      "mission": "flight-comparison",
      "status": "active",
      "started": 1708281600000
    }
  ],
  "last_updated": 1708282000000
}
```

## Inter-Agent Communication

### Method 1: File-based Shared Memory (Primary)

**Write Pattern:**
1. Agent writes to temp file: `/missions/{mission-id}/shared.tmp`
2. Atomic rename to `/missions/{mission-id}/shared.json`
3. Commander reads, validates, merges into mission context

**Read Pattern:**
- All agents can read mission context
- Commander provides digest of relevant findings

### Method 2: Direct Messaging (Secondary)

**Via `sessions_send`:**
- For urgent coordination between agents
- Example: "Builder to Reviewer: Code ready for testing"
- Logged in audit trail

### Commander Coordination

**Polling Loop (every 5 seconds):**
1. Check agent states (`/fleet/state/agent-{id}.json`)
2. Update mission progress
3. Handle handoffs (Agent A done → trigger Agent B)
4. Detect failures, report to UI

## Implementation Phases

### Phase 1: Foundation (MVP) ✅ Target: Day 1-2

**Directory Structure:**
```
mission-control/
├── fleet/
│   ├── personas/
│   │   ├── scout.json
│   │   └── builder.json
│   ├── state/
│   │   └── active-agents.json
│   ├── missions/
│   ├── workspaces/
│   └── logs/
│       └── audit.jsonl
```

**API Routes:**
- GET `/api/fleet/agents` - List active agents
- POST `/api/fleet/agents` - Spawn new agent
- DELETE `/api/fleet/agents/:id` - Terminate agent
- GET `/api/fleet/personas` - List available personas
- POST `/api/fleet/personas` - Create new persona

**Core Logic:**
- Agent lifecycle management (spawn, monitor, terminate)
- State persistence (save/load agent states)
- Basic metrics tracking (tokens, cost)

**Test Personas:**
- `scout.json` - Research specialist
- `builder.json` - Code writer

### Phase 2: War Room UI ✅ Target: Day 3-4

**Components:**
- `components/fleet/agent-card.tsx` - Single agent display
- `components/fleet/agent-grid.tsx` - Grid layout
- `components/fleet/persona-library.tsx` - Template selector
- `components/fleet/activity-feed.tsx` - Real-time actions

**Page:**
- `app/fleet/page.tsx` - Main fleet dashboard

**Features:**
- Real-time status updates (5s polling)
- Manual agent launch (select persona + objective)
- Agent metrics display
- Kill switch (terminate all agents)

### Phase 3: Commander Intelligence ✅ Target: Day 5-6

**Components:**
- `components/fleet/commander-panel.tsx` - Mission input + plan display

**API Routes:**
- POST `/api/fleet/missions` - Create new mission
- GET `/api/fleet/missions/:id` - Get mission status
- POST `/api/fleet/commander/propose` - Generate plan

**Commander Logic:**
- Goal analysis (break down into subtasks)
- Plan generation (which personas, in what order)
- Dependency management (sequential vs parallel)
- Progress monitoring

**Features:**
- Mission input
- Plan proposal UI (show agents + objectives)
- Approve/Reject workflow
- Mission tracking

### Phase 4: Polish & Advanced Features ✅ Target: Day 7+

**Security:**
- HITL gate implementation
- Tool call validation
- Workspace sandboxing

**Monitoring:**
- Audit log viewer
- Mission history
- Agent performance analytics

**Advanced:**
- Persona editor UI
- Custom tool restrictions
- Cost budgets per mission
- Alert notifications (agent stuck, high cost)

## API Endpoints Specification

### Agents

**GET `/api/fleet/agents`**
- Returns: List of active agents
- Response: `{ agents: [AgentState] }`

**POST `/api/fleet/agents`**
- Body: `{ persona_id, objective, mission_id? }`
- Action: Spawns new agent using `sessions_spawn`
- Returns: `{ agent_id, session_key }`

**GET `/api/fleet/agents/:id`**
- Returns: Agent state with full metrics

**DELETE `/api/fleet/agents/:id`**
- Action: Terminates agent, saves final state
- Returns: `{ success: true }`

### Personas

**GET `/api/fleet/personas`**
- Returns: List of available persona templates
- Response: `{ personas: [Persona] }`

**POST `/api/fleet/personas`**
- Body: Persona JSON
- Action: Creates new persona template file
- Returns: `{ persona_id }`

**GET `/api/fleet/personas/:id`**
- Returns: Persona template

**PUT `/api/fleet/personas/:id`**
- Body: Updated persona JSON
- Action: Updates persona file

### Missions

**POST `/api/fleet/missions`**
- Body: `{ goal, auto_approve? }`
- Action: Creates mission, invokes Commander
- Returns: `{ mission_id, proposed_plan }`

**GET `/api/fleet/missions/:id`**
- Returns: Mission context and progress

**POST `/api/fleet/missions/:id/approve`**
- Action: Commander spawns agents according to plan
- Returns: `{ started: true, agent_ids: [...] }`

**POST `/api/fleet/missions/:id/reject`**
- Action: Cancels mission
- Returns: `{ cancelled: true }`

### Commander

**POST `/api/fleet/commander/propose`**
- Body: `{ goal }`
- Action: Commander analyzes goal, generates plan
- Returns: `{ plan: { agents: [...], dependencies: [...] } }`

## File System Operations

### Directory Creation

```bash
mkdir -p fleet/personas
mkdir -p fleet/state
mkdir -p fleet/missions
mkdir -p fleet/workspaces
mkdir -p fleet/logs
```

### Initial Personas

**scout.json:**
```json
{
  "id": "scout-v1",
  "name": "Scout",
  "icon": "🔍",
  "soul": "You are a research specialist. Your mission is to gather high-quality data from the web. Always cite sources and prioritize accuracy over speed. When you find relevant information, save it to your workspace with proper citations.",
  "allowed_tools": ["web_search", "web_fetch", "Read", "memory_search"],
  "blocked_tools": ["exec", "Write", "Edit", "message"],
  "default_model": "anthropic/claude-haiku-3-5",
  "max_tokens": 50000,
  "description": "Web research specialist for data gathering"
}
```

**builder.json:**
```json
{
  "id": "builder-v1",
  "name": "Builder",
  "icon": "🔨",
  "soul": "You are a code builder. Your mission is to write clean, production-ready code based on specifications. Always follow best practices, add proper error handling, and include comments. Test your code before marking tasks complete.",
  "allowed_tools": ["Read", "Write", "Edit", "exec"],
  "blocked_tools": ["message", "web_search"],
  "default_model": "anthropic/claude-sonnet-4-5",
  "max_tokens": 100000,
  "description": "Code writer and implementation specialist"
}
```

### State Store Template

**active-agents.json:**
```json
{
  "agents": [],
  "last_updated": null
}
```

### Audit Log Format

**audit.jsonl:**
```jsonl
{"timestamp":1708281600000,"agent_id":"agent-abc123","action":"spawned","persona":"scout-v1","mission":"flight-comparison"}
{"timestamp":1708281605000,"agent_id":"agent-abc123","action":"tool_call","tool":"web_search","args":{"query":"flight booking APIs"}}
{"timestamp":1708281610000,"agent_id":"agent-abc123","action":"file_write","path":"/fleet/workspaces/agent-abc123/findings.md"}
```

## Implementation Strategy

### Tech Stack Reuse

**Existing Mission Control:**
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + SQLite (optional for fleet DB)
- Framer Motion (animations)

**New Dependencies:**
- None required (use existing stack)

### Code Organization

```
mission-control/
├── app/
│   ├── fleet/
│   │   └── page.tsx
│   └── api/fleet/
│       ├── agents/route.ts
│       ├── personas/route.ts
│       ├── missions/route.ts
│       └── commander/route.ts
├── components/fleet/
│   ├── agent-card.tsx
│   ├── agent-grid.tsx
│   ├── commander-panel.tsx
│   ├── persona-library.tsx
│   └── activity-feed.tsx
├── lib/fleet/
│   ├── agent-manager.ts
│   ├── state-store.ts
│   ├── mission-coordinator.ts
│   └── commander.ts
└── fleet/ (file system)
    ├── personas/
    ├── state/
    ├── missions/
    ├── workspaces/
    └── logs/
```

## Success Criteria

### Phase 1 Complete When:
- ✅ Directory structure created
- ✅ 2 test personas (scout, builder) created
- ✅ API routes functional
- ✅ Can spawn/terminate agents via API
- ✅ State persists to files

### Phase 2 Complete When:
- ✅ Fleet page accessible at `/fleet`
- ✅ Agent cards display in grid
- ✅ Real-time status updates
- ✅ Manual agent launch works
- ✅ Kill switch terminates all agents

### Phase 3 Complete When:
- ✅ Commander can analyze goals
- ✅ Plan proposal displays in UI
- ✅ Approve/Reject workflow functional
- ✅ Agents spawn according to plan
- ✅ Mission progress tracked

### Phase 4 Complete When:
- ✅ HITL gates block risky operations
- ✅ Audit log records all actions
- ✅ Workspace isolation enforced
- ✅ Tool restrictions validated

## Open Questions & Future Enhancements

### Resolved Design Decisions

1. **Agent Runtime:** Sub-agents via `sessions_spawn` (lightweight, scalable)
2. **Storage:** File-based (Git-friendly, hackable, simple)
3. **UI Location:** Dedicated `/fleet` page (focused, not cluttered)
4. **Commander Mode:** Semi-auto (proposes, human approves)
5. **Collaboration Pattern:** Both sequential and parallel (flexible)

### Future Enhancements

1. **Advanced Monitoring:**
   - Real-time token burn visualization
   - Cost alerts and budgets
   - Performance analytics per persona

2. **Enhanced Commander:**
   - Learn from past missions
   - Suggest persona improvements
   - Auto-optimize agent assignments

3. **Collaboration Features:**
   - Agent-to-agent chat UI
   - Shared whiteboard/canvas
   - Code review workflow

4. **Integration:**
   - Export missions to GitHub issues
   - Slack notifications for mission status
   - Calendar scheduling for missions

5. **Persona Marketplace:**
   - Share personas community-wide
   - Import from ClawdHub
   - Rate and review templates

## Security Considerations

### Threat Model

**Risks:**
1. Agent spawns infinite sub-agents (resource exhaustion)
2. Agent escapes workspace (file access violation)
3. Agent calls blocked tool (permission bypass)
4. Malicious persona template (code injection)

### Mitigations

1. **Resource Limits:**
   - Max 10 concurrent agents per user
   - Token budgets per agent
   - Automatic termination after 1 hour

2. **Workspace Isolation:**
   - Strict path validation
   - Whitelist approach for file access
   - Read-only access to shared mission context

3. **Tool Validation:**
   - Check tool against persona's `allowed_tools`
   - Block execution if not allowed
   - Log violation attempts

4. **Persona Sandboxing:**
   - Validate JSON schema
   - Sanitize `soul` field (no eval)
   - Review template before activation

## Testing Strategy

### Unit Tests

- Agent state serialization/deserialization
- Tool permission validation
- Workspace path sanitization
- Mission plan parsing

### Integration Tests

- Spawn agent → verify session created
- Terminate agent → verify state saved
- Commander proposes plan → verify structure
- Agent writes to workspace → verify isolation

### E2E Tests

- Full mission flow: Goal → Plan → Approve → Execute → Complete
- Agent handoff: Scout completes → Builder starts
- HITL gate: Risky operation → blocks → user approves → proceeds

---

**Design Status:** Complete and ready for implementation  
**Next Step:** Create implementation plan with tasks
