# Clawdbot Integration Architecture

**Mission Control as a UI Extension of Clawdbot**

## Overview

Mission Control is designed as a **visual frontend for Clawdbot**, not a standalone application with its own AI. All AI-powered features (task parsing, event creation, approval decisions) are handled by calling the Clawdbot CLI, which provides:

- ✅ **No API keys needed** - Clawdbot handles authentication
- ✅ **Shared context** - Access to Clawdbot's memory and skills
- ✅ **Session history** - All interactions logged in `mission-control` session
- ✅ **Unified AI backend** - Single source of truth for AI processing

## Architecture

### Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│ User types in Mission Control:                               │
│ "Add task: review PR #123, high priority, due tomorrow"      │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ Mission Control Frontend (React/Next.js)                     │
│ components/ai-prompt-input.tsx                               │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ Mission Control API Route                                     │
│ POST /api/tasks/parse                                        │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ Clawdbot Helper Functions                                    │
│ lib/clawdbot.ts                                              │
│ - parseTaskWithClawdbot(prompt)                              │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ Execute CLI Command                                           │
│ clawdbot agent --message "Parse task: ..."                  │
│   --json                                                      │
│   --session-id mission-control                               │
│   --timeout 30                                               │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ Clawdbot Gateway & Agent                                      │
│ - Uses configured AI model (Claude, etc.)                    │
│ - Has access to memory, skills, context                      │
│ - Returns structured JSON response                           │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ Mission Control receives JSON:                                │
│ {                                                             │
│   "title": "Review PR #123",                                 │
│   "priority": "high",                                        │
│   "dueDate": "2026-02-18"                                    │
│ }                                                             │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ Mission Control stores in database & files                    │
│ - SQLite: prisma/dev.db                                      │
│ - Files: clawd/tasks/*.json                                  │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ UI updates with new task                                      │
│ Shows success toast                                           │
└──────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Clawdbot Helper Functions

**File:** `lib/clawdbot.ts`

Key functions:
- `callClawdbot(instruction, options)` - Execute clawdbot agent command
- `extractJSON(content)` - Parse JSON from Clawdbot response
- `handleClawdbotError(error)` - Classify and handle errors
- `parseTaskWithClawdbot(prompt)` - Task-specific parsing
- `parseEventWithClawdbot(prompt)` - Event-specific parsing
- `checkApprovalRequired(action, context)` - Approval checking

### 2. API Routes

Mission Control has three main AI API routes that call Clawdbot:

#### `/api/tasks/parse` - Parse task creation prompts
```typescript
POST /api/tasks/parse
Body: { prompt: "Add task: review PR, high priority" }
Response: { 
  title: "Review PR",
  priority: "high",
  dueDate: "2026-02-18",
  tags: [],
  ...
}
```

#### `/api/calendar/parse` - Parse event creation prompts
```typescript
POST /api/calendar/parse
Body: { prompt: "Schedule meeting tomorrow 2pm" }
Response: {
  title: "Meeting",
  startTime: "2026-02-18T14:00:00",
  endTime: "2026-02-18T15:00:00",
  ...
}
```

#### `/api/ai/check-approval` - Check if action requires approval
```typescript
POST /api/ai/check-approval
Body: { 
  action: "Delete file mission-control/data.db",
  context: { file: "data.db", size: 1024 }
}
Response: {
  requiresApproval: true,
  reason: "File deletion is irreversible",
  riskLevel: "high",
  category: "file_delete"
}
```

### 3. Session Management

**Dedicated Session:**
- Mission Control uses `--session-id mission-control` for all requests
- Creates a persistent session in Clawdbot
- Session history available via `clawdbot sessions list`
- Can view full conversation: `clawdbot sessions history --session-key mission-control`

**Benefits:**
- Context continuity across requests
- Can reference previous interactions
- Debugging and transparency
- All Mission Control activity visible in Clawdbot

### 4. Error Handling

The integration gracefully handles Clawdbot errors:

**Clawdbot not running:**
```json
{
  "type": "not_running",
  "message": "Clawdbot gateway is not running. Start it with: clawdbot gateway start"
}
```

**Timeout:**
```json
{
  "type": "timeout",
  "message": "Request to Clawdbot timed out. Try again or simplify your request."
}
```

**Parse error:**
```json
{
  "type": "parse_error",
  "message": "Could not parse Clawdbot response. Please try again."
}
```

**Fallback behavior:**
- If Clawdbot fails, Mission Control still creates basic entries
- Title extracted from raw prompt
- Default values used (priority: medium, no due date)
- User can manually edit after creation

## Setup & Configuration

### Prerequisites

1. **Clawdbot installed and configured**
   ```bash
   npm install -g clawdbot
   clawdbot gateway start
   ```

2. **No API keys needed** - Clawdbot handles authentication

### Verification

Check that Clawdbot is accessible:
```bash
# Check gateway status
clawdbot gateway status

# Test a simple agent call
clawdbot agent --message "Hello" --json
```

### Development

When developing Mission Control:
1. Start Clawdbot gateway: `clawdbot gateway start`
2. Start Mission Control: `npm run dev`
3. Test AI features (task creation, event scheduling)
4. Check session: `clawdbot sessions list`

## Debugging

### View Mission Control Session

```bash
# List all sessions
clawdbot sessions list

# View mission-control session history
clawdbot sessions history --session-key mission-control

# View last 10 messages
clawdbot sessions history --session-key mission-control --limit 10
```

### Common Issues

**Error: "command not found: clawdbot"**
- Clawdbot not installed
- Solution: `npm install -g clawdbot`

**Error: "ECONNREFUSED"**
- Gateway not running
- Solution: `clawdbot gateway start`

**Error: "No valid JSON found in response"**
- Clawdbot returned unexpected format
- Check session history to see raw response
- May need to adjust prompt templates

**Error: "Request timed out"**
- Prompt too complex or Clawdbot overloaded
- Increase timeout in `lib/clawdbot.ts`
- Simplify the prompt

## Benefits of Clawdbot Integration

### 1. No API Key Management
- Users don't need separate Anthropic/OpenAI keys
- One authentication point (Clawdbot)
- Simpler setup

### 2. Shared Context
- Clawdbot has access to:
  - `MEMORY.md` - Long-term memory
  - `memory/*.md` - Daily logs
  - Skills (task-creator, approval-rules, etc.)
  - Previous conversations
- Richer, more context-aware responses

### 3. Unified History
- All Mission Control interactions logged
- Can review what was parsed and how
- Debugging made easier

### 4. Skills Integration
- Can leverage Clawdbot's skills:
  - `task-creator` - Task parsing logic
  - `approval-rules` - Approval decision making
  - `calendar-sync` - Calendar event handling
- Skills can evolve independently

### 5. Transparency
- User can see exactly what Mission Control asked Clawdbot
- Can verify AI decisions
- Can manually invoke same commands

## Future Enhancements

### Planned Features

1. **Real-time updates** - Use WebSocket/SSE for live updates from Clawdbot
2. **Approval workflow** - Clawdbot requests approval via Mission Control UI
3. **Bulk operations** - "Archive all completed tasks from last week"
4. **Smart suggestions** - Clawdbot proactively suggests tasks based on calendar/emails
5. **Voice input** - Speak tasks/events, processed by Clawdbot

### Extensibility

Mission Control can be extended to use other Clawdbot capabilities:
- **File operations** - "Create a doc from this task's notes"
- **Web search** - "Find relevant resources for this project"
- **Code execution** - "Run the test suite for this PR"
- **Notifications** - "Remind me about this task tomorrow"

## Testing

### Manual Testing

1. **Start Clawdbot:**
   ```bash
   clawdbot gateway start
   ```

2. **Test task parsing:**
   ```bash
   # In Mission Control UI
   "Add task: test task, high priority, due tomorrow"
   
   # Or via CLI
   clawdbot agent --message "Parse task: test task, high priority, due tomorrow" --json --session-id mission-control
   ```

3. **Verify session:**
   ```bash
   clawdbot sessions list
   # Should show: mission-control
   
   clawdbot sessions history --session-key mission-control
   # Should show the task parsing request
   ```

### Automated Testing

**Mock Clawdbot responses:**
```typescript
// In tests
jest.mock('child_process', () => ({
  execSync: jest.fn(() => JSON.stringify({
    role: 'assistant',
    content: '{"title": "Test Task", "priority": "high"}'
  }))
}))
```

## Conclusion

By integrating directly with Clawdbot, Mission Control becomes a **visual extension** rather than a separate system. This architecture provides:

- ✅ Simpler setup (no API keys)
- ✅ Richer context (access to Clawdbot's memory)
- ✅ Better transparency (session history)
- ✅ Unified experience (one AI backend)

Mission Control handles the **presentation layer** (UI, database, file sync), while Clawdbot handles the **intelligence layer** (parsing, reasoning, decision making).

---

**For more information:**
- Design doc: `docs/plans/2026-02-17-mission-control-clawdbot-integration.md`
- Setup guide: `SETUP.md`
- Main README: `README.md`
