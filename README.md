# Mission Control 🚀

**Your AI-powered command center for productivity**

Mission Control is a glass-morphism themed productivity dashboard that helps you organize tasks, approve high-risk actions, manage your calendar, and track GitHub projects—all with natural language AI assistance.

## ✨ Features

### 🎯 Tasks
- **AI-powered task creation** - Just type "Add task: review PR #123, high priority, due tomorrow"
- **Full-width table layout** with inline editing
- **Smart filtering** by status, priority, project, assignee
- **Batch operations** - Select multiple tasks and bulk update or delete
- **Quick status toggle** on hover
- Columns: Title | Description | Status | Priority | Tags | Due Date | Assignee | Actions

### 🛡️ Approvals
- **High-risk action detection** - Clawdbot requests approval before executing dangerous operations
- **Self-evolving approval rules** - Learns from your patterns (after 10+ approvals)
- **Detailed context** for every request (files affected, reversibility, AI reasoning)
- **Approve/deny with notes**
- Real-time updates via SSE

### 📅 Calendar
- **Google Calendar sync** via `gog` skill
- **AI event creation** - "Schedule meeting with John tomorrow 2pm for 1 hour"
- **Week/month/day views** with react-big-calendar
- **Today's agenda sidebar**
- Two-way sync (Google ↔ local DB ↔ files)

### 📦 Projects (GitHub Integration)
- **GitHub repository dashboard** via `gh` CLI
- **Expandable repo cards** showing:
  - Open issues and PRs
  - Recent commits
  - Contributors
  - Activity graphs
- **5-minute cache** for fast performance
- Search and filter repositories

### 👥 People, 📝 Docs, 🕐 Cron, 🧠 Memory
- Full CRUD for contacts, documents, scheduled jobs, and memory files
- Glass-morphism theme applied throughout
- Search and filtering

### 🎨 Design System
- **Glass-morphism theme** inspired by Linear and Arc browser
- **Inter font** for clean typography
- **Reusable components** (GlassCard, Button, Input, Badge, etc.)
- **Dark mode optimized** with subtle depth
- **Smooth animations** and transitions

## 📸 Screenshots

> *Add screenshots/demo GIFs here after deployment*

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Git**
- **Clawdbot** - Must be installed and gateway running (for AI features)
- **GitHub CLI** (`gh`) for Projects page integration
- **Optional:** Google Calendar CLI (`gog`) for calendar sync

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/mission-control.git
cd mission-control
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create `.env.local`:

```bash
# Database (SQLite by default)
DATABASE_URL="file:./dev.db"

# Clawdbot Integration
# Mission Control uses Clawdbot for AI features - no API keys needed!
# Just ensure Clawdbot gateway is running: clawdbot gateway start

# Optional: Google Calendar integration
# Configure via gog CLI setup
```

4. **Initialize database**

```bash
npx prisma generate
npx prisma db push
npx prisma db seed  # Optional: add sample data
```

5. **Start Clawdbot gateway**

```bash
clawdbot gateway start
```

6. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Setup & Configuration

### GitHub Integration

Install and authenticate GitHub CLI:

```bash
# Install gh CLI
brew install gh  # macOS
# or follow: https://cli.github.com/

# Authenticate
gh auth login
```

Verify it works:

```bash
gh repo list
```

### Google Calendar Integration (Optional)

Install `gog` skill (if available in your Clawdbot setup):

```bash
# Follow gog skill installation instructions
# Authenticate with Google Calendar
gog calendar auth
```

### Clawdbot Integration

Mission Control integrates directly with Clawdbot for all AI features:

**Setup:**
```bash
# Start Clawdbot gateway
clawdbot gateway start

# Check status
clawdbot gateway status

# View Mission Control session
clawdbot sessions list
```

**How it works:**
- All AI prompts (task parsing, event creation) go through Clawdbot
- No separate API keys needed
- Mission Control uses a dedicated `mission-control` session
- Full context awareness from Clawdbot's memory and skills
- All interactions visible in Clawdbot session history

**Troubleshooting:**
If you see "Clawdbot gateway is not running" errors:
```bash
clawdbot gateway start
```

## 📖 Usage

### Creating Tasks with AI

Navigate to **Tasks** page and use the AI prompt input:

**Examples:**
```
Add task: review PR #245, high priority, due tomorrow
Create urgent task to fix calendar sync bug by end of week, assign to me
New task for mission-control project: add dark mode toggle, low priority
```

The AI will parse:
- ✅ Title and description
- ✅ Priority (low/medium/high/urgent)
- ✅ Due date (relative or absolute)
- ✅ Tags
- ✅ Assignee
- ✅ Project

### Scheduling Events with AI

Navigate to **Calendar** page:

**Examples:**
```
Schedule meeting with John tomorrow 2pm for 1 hour
Block Friday afternoon for deep work
Add recurring standup Mon/Wed/Fri 10am
```

### Approvals Workflow

When Clawdbot detects a high-risk action (file deletion, git force push, sending emails, etc.):

1. Approval request appears on **Approvals** page
2. Review context, AI reasoning, and recommendation
3. Approve or deny with optional notes
4. Action executes or cancels based on your decision

After 10+ approvals of the same pattern, the system suggests adding an auto-approval rule.

### GitHub Projects

Navigate to **Projects** page to:
- View all your GitHub repositories
- Click a repo to expand and see issues, PRs, commits, contributors
- Search repositories by name or language
- Click "Refresh" to fetch latest data

## 🏗️ Architecture

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** SQLite + Prisma ORM
- **UI:** React + Tailwind CSS
- **AI:** Clawdbot integration (no API keys needed!)
- **Calendar:** react-big-calendar + Google Calendar API (via gog)
- **GitHub:** GitHub CLI (`gh`)
- **State:** React hooks + Zustand (for complex state)
- **Notifications:** Sonner (toast library)

### Data Storage

**100% local storage** - no cloud databases.

**Dual storage strategy:**
1. **Primary:** SQLite database (`prisma/dev.db`)
   - Fast queries
   - ACID compliance
   - Easy backup

2. **Secondary:** File system (`clawd/`)
   - Clawdbot integration
   - Version control friendly
   - Human-readable

**Sync flow:**
- DB write → File write (automatic)
- File change → DB update (via watcher)
- Conflicts: Database wins

### Project Structure

```
mission-control/
├── app/
│   ├── api/               # API routes
│   │   ├── tasks/
│   │   ├── approvals/
│   │   ├── calendar/
│   │   └── github/
│   ├── tasks/             # Tasks page
│   ├── approvals/         # Approvals page
│   ├── calendar/          # Calendar page
│   ├── projects/          # GitHub projects page
│   └── page.tsx           # Dashboard
├── components/
│   ├── ui/                # Reusable UI components
│   ├── navigation.tsx
│   ├── tasks-table.tsx
│   ├── approval-card.tsx
│   ├── repo-card.tsx
│   └── ai-prompt-input.tsx
├── lib/
│   ├── ai/
│   │   └── prompt-parser.ts  # AI prompt parsing
│   ├── utils.ts
│   └── github.ts          # GitHub integration
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts
└── skills/
    ├── task-creator/      # Task parsing skill
    └── approval-rules/    # Approval rules skill
```

## 🔧 Development

### Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open database GUI
npx prisma migrate   # Create migration
```

### Adding New Features

1. **Database changes:** Update `prisma/schema.prisma`, run `npx prisma db push`
2. **API routes:** Add to `app/api/`
3. **Pages:** Add to `app/`
4. **Components:** Add to `components/`
5. **Skills:** Add to `skills/` with `SKILL.md` documentation

### Git Strategy

**Main branch (public):**
- All UI components
- API routes (with placeholder auth)
- Generic database schema
- Documentation

**Personal branch (local only):**
- Real API keys
- Personal data
- `clawd/` directory

**Workflow:**
```bash
git checkout main
# ... implement feature
git commit -m "feat: add new feature"
git push origin main

git checkout personal
git merge main  # Get latest features
# ... add personal configs
git commit -m "chore: update configs"
# NEVER push personal branch
```

## 🤝 Contributing

Contributions welcome! This is a boilerplate for personal productivity, so fork it and make it yours.

### Guidelines

1. Follow the glass-morphism design system
2. Keep components small and reusable
3. Add JSDoc comments for complex functions
4. Test your changes before committing
5. Update documentation for new features

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

- Design inspired by [Linear](https://linear.app) and [Arc Browser](https://arc.net)
- Built with [Next.js](https://nextjs.org), [Prisma](https://prisma.io), [Tailwind CSS](https://tailwindcss.com)
- AI powered by [Anthropic Claude](https://anthropic.com) and [OpenAI](https://openai.com)

## 🚧 Roadmap

- [ ] Mobile responsive design
- [ ] Drag-and-drop task ordering
- [ ] Custom themes (color picker)
- [ ] Export data (JSON, CSV)
- [ ] Keyboard shortcuts panel
- [ ] Offline mode (PWA)
- [ ] Activity timeline
- [ ] Task dependencies
- [ ] Recurring tasks
- [ ] Email notifications

---

**Built with ❤️ for productive humans and their AI assistants**

For questions or issues, open a GitHub issue or reach out to the maintainer.
