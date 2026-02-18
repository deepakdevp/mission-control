# Mission Control Setup Guide

## Prerequisites

Before you begin, make sure you have:

1. **Node.js 20+** installed
2. **Clawdbot** - Must be installed and gateway running
3. **GitHub CLI (`gh`)** - [Install here](https://cli.github.com/)
4. **Google CLI (`gog`)** - Optional, for Google Calendar sync

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` if needed (default settings work for most cases):

```env
DATABASE_URL="file:./dev.db"
```

**Note:** No API keys needed! Mission Control uses Clawdbot for all AI features.

### 3. Initialize Database

```bash
npx prisma db push
npx prisma generate
```

Optional: Seed with example data:

```bash
npm run seed
```

### 4. Start Clawdbot Gateway

**Mission Control requires Clawdbot to be running for AI features:**

```bash
clawdbot gateway start
```

Check status:

```bash
clawdbot gateway status
```

### 5. Authenticate External Services

#### GitHub (Required for Projects page)

```bash
gh auth login
```

Follow the prompts to authenticate.

#### Google Calendar (Optional)

```bash
gog auth login
```

This enables two-way sync with Google Calendar.

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

### ✅ Tasks

- **Natural language input**: "Add task: review PR #123, high priority, due tomorrow"
- Table view with sorting, filtering, search
- Inline editing
- Batch operations
- AI-powered parsing

### ✅ Calendar

- Week/month/day views
- **Natural language input**: "Schedule meeting tomorrow 2pm for 1 hour"
- Google Calendar two-way sync (requires `gog` CLI)
- Today's agenda sidebar

### ✅ Projects

- Auto-fetches GitHub repositories (requires `gh` CLI)
- Shows issues, PRs, commits, contributors
- Expandable cards with full details

### ✅ Approvals

- Review high-risk actions before execution
- Approve/deny workflow
- Context and AI reasoning included

## Testing

### Test AI Parsing

1. Go to Tasks page
2. Type: "Add task: finish report by Friday, high priority"
3. Task should be created with correct fields

### Test GitHub Integration

1. Make sure `gh auth login` is complete
2. Go to Projects page
3. Your repos should appear automatically

### Test Calendar Sync

1. Make sure `gog auth login` is complete
2. Go to Calendar page
3. Type: "Schedule team meeting tomorrow 3pm"
4. Event should appear in both Mission Control and Google Calendar

## Troubleshooting

### "Clawdbot gateway is not running"

Mission Control requires Clawdbot for AI features:

```bash
# Start the gateway
clawdbot gateway start

# Check if it's running
clawdbot gateway status

# View Mission Control's session
clawdbot sessions list
```

If Clawdbot is not installed:
```bash
# Install Clawdbot (if needed)
npm install -g clawdbot
```

### "Failed to fetch repositories"

1. Install GitHub CLI: `brew install gh`
2. Authenticate: `gh auth login`

### "Failed to sync calendar"

1. Install gog: [Install instructions](https://github.com/gsuitedevs/go-samples)
2. Authenticate: `gog auth login`

### Database errors

Reset the database:

```bash
rm dev.db
npx prisma db push
```

## Production Build

```bash
npm run build
npm start
```

## Data Storage

Mission Control uses **100% local storage**:

- **Database**: SQLite file at `./dev.db`
- **Files**: Synced to `../clawd/` directory (if exists)
  - Tasks: `clawd/tasks/*.json`
  - Calendar: `clawd/calendar/*.ics`
  - Approvals: `clawd/approvals/*.json`

## Architecture

```
┌─────────────────┐
│   Next.js App   │
│   (Frontend)    │
└────────┬────────┘
         │
┌────────┴────────┐
│  API Routes     │
│  (Backend)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───┴──┐  ┌──┴────┐
│SQLite│  │ Files │
│  DB  │  │System │
└──────┘  └───────┘
    │         │
    └────┬────┘
         │
    ┌────┴─────┐
    │ External │
    │ Services │
    ├──────────┤
    │ Anthropic│
    │  GitHub  │
    │  Google  │
    └──────────┘
```

## Next Steps

1. Customize glass-morphism theme in `app/globals.css`
2. Add your own approval rules in `../skills/approval-rules/SKILL.md`
3. Explore task creator prompts in `../skills/task-creator/SKILL.md`
4. Set up Clawdbot integration for approvals

## Support

- Issues: File on GitHub
- Documentation: See `README.md`
- Design Doc: `docs/plans/2026-02-17-mission-control-redesign.md`
