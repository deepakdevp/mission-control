# Nerve Center Dashboard - Design Document

**Date:** 2026-02-18  
**Project:** Mission Control Extension  
**Author:** Toshi (AI Agent)

## Overview

Extend Mission Control with a "Nerve Center" dashboard that allows Deepak to monitor AI agent activity, system vitals, API costs, and edit core configuration files in real-time.

## Goals

1. **Observability:** Real-time view into agent thoughts and tool executions
2. **Cost Tracking:** Monitor token usage and estimated API costs
3. **System Health:** Track local machine vitals (CPU, RAM, disk)
4. **Configuration:** Edit SOUL.md and MEMORY.md with hot-reload capability
5. **Control:** Approve/deny pending HITL (Human-in-the-Loop) requests

## Architecture

### Tech Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui (already installed), Framer Motion
- **Communication:** Fetch API polling OpenClaw Gateway (http://localhost:18789)
- **System Access:** Node.js child_process for shell commands
- **File Access:** Node.js fs for SOUL.md/MEMORY.md

### Project Structure
```
mission-control/
├── app/
│   ├── nerve-center/
│   │   └── page.tsx              # Main dashboard page
│   └── api/
│       ├── gateway/
│       │   ├── sessions/route.ts # Proxy to Gateway sessions API
│       │   ├── status/route.ts   # Proxy to Gateway status API
│       │   └── restart/route.ts  # Trigger Gateway restart
│       ├── system/route.ts       # System vitals (CPU, RAM, disk)
│       └── files/route.ts        # SOUL.md/MEMORY.md read/write
├── components/nerve-center/
│   ├── thought-stream.tsx        # Real-time activity feed
│   ├── api-fuel-gauge.tsx        # Token usage circular gauges
│   ├── system-vitals.tsx         # Sparkline charts
│   ├── soul-memory-editor.tsx    # File editor with tabs
│   └── hitl-queue.tsx            # Approval requests list
└── lib/
    └── gateway-client.ts         # OpenClaw API wrapper functions
```

### Data Flow
1. **Thought Stream:** Poll `/api/gateway/sessions` every 3s → parse messages → display with color coding
2. **API Gauges:** Fetch `/api/gateway/status` every 10s → calculate token usage & cost
3. **System Vitals:** Call `/api/system` every 5s → execute shell commands → parse output
4. **File Editor:** Load files via `/api/files?path=SOUL.md` → edit → save → manual restart button
5. **HITL Queue:** Poll `/api/gateway/hitl` every 10s (future: may need custom Gateway endpoint)

## UI/UX Design

### Theme: Dark "Command Center"
```css
--bg-primary: #0a0a0f       /* Deep slate */
--bg-secondary: #12121a     /* Cards */
--border: #27272a           /* Zinc borders */
--accent-emerald: #10b981   /* user_input */
--accent-amethyst: #a855f7  /* assistant_thought */
--accent-amber: #f59e0b     /* tool_execution */
--accent-cyan: #06b6d4      /* System vitals */
--text-primary: #f8fafc
--text-muted: #94a3b8
```

### Layout
- **Desktop:** 3-column grid (Thought Stream 40% | Gauges+Vitals 30% | Editor 30%)
- **Mobile:** Single column stack
- **Sticky header:** Refresh controls, last update timestamp

### Typography
- **Monospace:** JetBrains Mono (logs, code)
- **Sans:** Inter (UI text)
- **Sizes:** 12px logs, 14px body, 24px metrics

## Feature Specifications

### 1. Live Thought Stream
**Component:** `thought-stream.tsx`

**Functionality:**
- Poll Gateway sessions API every 3 seconds
- Display messages with timestamp, type badge, content
- Auto-scroll to bottom on new messages
- Show "Thinking..." pulse animation when waiting for assistant reply

**Color Coding:**
- User input: `bg-emerald-500/10` with emerald border
- Assistant thought: `bg-purple-500/10` with amethyst border
- Tool execution: `bg-amber-500/10` with amber border

**Layout:**
- Fixed height: 60vh
- Scroll container with hidden scrollbar
- Message cards: 12px padding, 8px margin

### 2. API Fuel Gauges
**Component:** `api-fuel-gauge.tsx`

**Functionality:**
- Two circular progress indicators (SVG)
- Left: Token usage (current session)
- Right: Estimated cost (USD)
- Formula: `tokens × $0.003 / 1000` (Claude Sonnet pricing)
- Red glow when >80% of daily budget consumed

**Visual:**
- 120px diameter circles
- Stroke width: 8px
- Background stroke: gray-700
- Progress stroke: gradient (cyan → purple)
- Center text: value + label

### 3. System Vitals (Sparklines)
**Component:** `system-vitals.tsx`

**Functionality:**
- Three mini charts: CPU Load, RAM Usage, Disk Space
- Update every 5 seconds
- Show current value + 1-hour trend (720 data points, keep last 60)

**Data Sources:**
- CPU: `top -l 1 | grep "CPU usage"` → parse percentage
- RAM: `vm_stat | awk '/Pages active/ {print $3}'` → calculate %
- Disk: `df -h / | awk 'NR==2 {print $5}'` → parse percentage

**Visual:**
- Canvas-based sparklines (60px height × 200px width)
- Cyan stroke, 2px width
- Current value overlay (24px font, top-right)

### 4. Soul & Memory Editor
**Component:** `soul-memory-editor.tsx`

**Functionality:**
- Tabbed interface: [SOUL.md] [MEMORY.md]
- Textarea with markdown syntax highlighting (react-markdown preview optional)
- Load file on mount via `/api/files?path=SOUL.md`
- "Save" button → POST to `/api/files` with content → success toast
- "Restart Gateway" button → POST to `/api/gateway/restart` → confirmation dialog → restart toast
- Dirty state tracking → warn before tab switch/page leave

**Layout:**
- Tab bar: 40px height, zinc-800 background
- Editor: Fills remaining space, monospace font
- Action bar: Fixed bottom, two buttons (Save | Restart Gateway)

**Security:**
- Whitelist only: `SOUL.md`, `MEMORY.md`
- Reject any path traversal attempts (`../`, absolute paths)

### 5. HITL Queue (Human-in-the-Loop)
**Component:** `hitl-queue.tsx`

**Functionality:**
- Card-based list of pending approval requests
- Each card: task description, timestamp, requester info
- Two action buttons: "Approve" (green) / "Deny" (red)
- Action → POST to `/api/gateway/hitl` with decision
- Auto-refresh every 10 seconds
- Empty state: "No pending approvals 🎉"

**Data Structure (future):**
```typescript
interface HITLRequest {
  id: string;
  task: string;
  requester: string;
  timestamp: number;
  context?: string;
}
```

**Note:** May require new Gateway endpoint (not yet implemented in OpenClaw)

## API Routes

### `/api/gateway/sessions` (GET)
- Proxy to `http://localhost:18789/api/sessions/list`
- Return: Recent session messages

### `/api/gateway/status` (GET)
- Proxy to `http://localhost:18789/api/status`
- Return: Token usage, model info, cost estimates

### `/api/gateway/restart` (POST)
- Execute: `clawdbot gateway restart`
- Return: Success message + restart timestamp

### `/api/system` (GET)
- Execute shell commands for CPU, RAM, disk
- Parse output, return JSON
- Example response:
```json
{
  "cpu": 45.2,
  "ram": 62.8,
  "disk": 73.1,
  "timestamp": 1708281600000
}
```

### `/api/files` (GET/POST)
- GET: Read SOUL.md or MEMORY.md
  - Query param: `?path=SOUL.md`
  - Return: File content as text
- POST: Write file content
  - Body: `{ path: "SOUL.md", content: "..." }`
  - Return: Success/error message

**Security:**
- Validate path is exactly `SOUL.md` or `MEMORY.md`
- Reject path traversal: `../`, `/etc`, `~`
- Base directory: `/Users/deepak.panwar/clawd/`

## Error Handling

### Gateway Unreachable
- Show "Gateway Offline" banner at top
- Disable interactive features
- Retry connection every 10s

### File Operations
- Write failure → toast error, preserve edits in state
- Read failure → show error message, disable editor

### System Commands
- Command fails → display "N/A" in vitals chart
- Timeout (5s) → skip update, try next interval

### API Timeouts
- Set 5s timeout on all fetch calls
- Retry once on failure
- Show error toast after 2 failures

## Performance Considerations

### Polling Strategy
- Thought stream: 3s interval (most critical)
- API gauges: 10s interval (moderate priority)
- System vitals: 5s interval (balance)
- HITL queue: 10s interval (low priority)

**Optimization:** Use `AbortController` to cancel in-flight requests on component unmount

### Data Storage
- Keep last 100 messages in thought stream (trim older)
- Store last 60 data points for sparklines
- No persistent storage needed (all in memory)

## Security

### Threat Model
- **Assumption:** Localhost environment, trusted user
- **No authentication:** Dashboard accessible to anyone on localhost
- **File access:** Restricted to SOUL.md and MEMORY.md only
- **Command execution:** No user input in shell commands

### Mitigations
- CORS: Restrict to `localhost:3000` origin
- Path validation: Whitelist approach for file operations
- No eval/exec of user input
- Rate limiting: Not needed (localhost)

## Dependencies

### New Packages to Install
```json
{
  "framer-motion": "^11.x",  // Already installed
  "lucide-react": "^0.568.0", // Already installed
  "clsx": "^2.1.1",           // Already installed
  "tailwind-merge": "^3.4.1"  // Already installed
}
```

**No new dependencies needed!** All required packages already in project.

## Development Plan

### Phase 1: Core Infrastructure
1. Create API routes (gateway proxy, system vitals, file operations)
2. Build `gateway-client.ts` helper library
3. Set up base page layout (`app/nerve-center/page.tsx`)

### Phase 2: Components
4. Build Thought Stream component
5. Build API Fuel Gauges
6. Build System Vitals sparklines
7. Build Soul/Memory Editor
8. Build HITL Queue (placeholder)

### Phase 3: Polish
9. Add animations (Framer Motion)
10. Implement error handling
11. Add loading states
12. Test all features

### Phase 4: Documentation
13. Update README with Nerve Center section
14. Add screenshots
15. Document Gateway API expectations

## Future Enhancements

1. **WebSocket Support:** Replace polling with real-time events
2. **Historical Data:** Store thought stream to database
3. **Custom Alerts:** Notify when cost exceeds threshold
4. **Multi-Agent Support:** Monitor multiple agent sessions
5. **Export Logs:** Download thought stream as JSON/CSV
6. **Search:** Full-text search across historical messages
7. **Metrics Dashboard:** Grafana-style time-series charts
8. **Mobile App:** React Native companion app

## Success Criteria

✅ Thought stream shows real-time agent activity with correct color coding  
✅ API gauges accurately track token usage and cost  
✅ System vitals display CPU, RAM, disk with smooth sparklines  
✅ SOUL.md and MEMORY.md can be edited and saved  
✅ Gateway restart button works reliably  
✅ Dark theme matches "command center" aesthetic  
✅ No performance issues (smooth 60fps animations)  
✅ All error states handled gracefully

## Open Questions

1. **HITL Implementation:** Gateway doesn't yet expose HITL endpoint - should we:
   - Create placeholder component now?
   - Design the endpoint spec for future Gateway PR?
   
   **Decision:** Build placeholder component with mock data structure

2. **Cost Calculation:** Should we:
   - Hardcode Claude Sonnet pricing?
   - Make it configurable per model?
   
   **Decision:** Hardcode for now, add config later

3. **Authentication:** Should we add basic auth?
   
   **Decision:** No - localhost trusted environment

---

**Approved by:** Deepak Dev Panwar  
**Date:** 2026-02-18  
**Status:** Ready for Implementation
