# Nerve Center Dashboard

Real-time monitoring dashboard for AI agent activity, API costs, and system health.

## Features

1. **Live Thought Stream** - See agent messages and tool executions in real-time
2. **API Fuel Gauges** - Track token usage and estimated costs
3. **System Vitals** - Monitor CPU, RAM, and disk usage with sparklines
4. **Soul & Memory Editor** - Edit SOUL.md and MEMORY.md with hot-reload
5. **HITL Queue** - Approve/deny pending agent requests (coming soon)

## Access

Navigate to: http://localhost:3000/nerve-center

## Requirements

- OpenClaw Gateway running on localhost:18789
- Clawdbot CLI installed and configured
- macOS (for system vitals shell commands)

## API Endpoints

- GET `/api/gateway/sessions` - Fetch agent session messages
- GET `/api/gateway/status` - Fetch token usage and status
- POST `/api/gateway/restart` - Restart Gateway process
- GET `/api/system` - Fetch CPU/RAM/disk vitals
- GET/POST `/api/files` - Read/write SOUL.md and MEMORY.md

## Future Enhancements

- WebSocket support for real-time updates
- Historical data storage
- Custom alerts and notifications
- Multi-agent monitoring
- Export logs to JSON/CSV
