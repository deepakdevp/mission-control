# Mission Control - Project Context

**Repository:** https://github.com/deepakdevp/mission-control.git  
**Local Path:** `/Users/deepak.panwar/clawd/mission-control`  
**Dev Server:** http://localhost:3000  
**Owner:** Deepak Dev Panwar (@deepakdevp)

## 🎯 Project Overview

Mission Control is an **AI-powered productivity workspace** built with Next.js 14, designed to be a command center for managing tasks, approvals, calendar events, projects, and more through natural language AI prompts integrated with Clawdbot.

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + Custom Design System
- **Database:** Prisma + SQLite (dev.db)
- **Fonts:** Space Grotesk (headings), Plus Jakarta Sans (body), JetBrains Mono (code)
- **Icons:** Lucide React
- **Animations:** CSS + Framer Motion principles
- **AI Integration:** Clawdbot CLI
- **External APIs:** Google Calendar, GitHub

## 📁 Project Structure

```
mission-control/
├── app/
│   ├── api/              # API routes for all features
│   │   ├── tasks/        # Task CRUD + AI parsing
│   │   ├── approvals/    # Approval workflows
│   │   ├── calendar/     # Event management + Google sync
│   │   ├── projects/     # Project management
│   │   ├── people/       # Contact management
│   │   ├── cron/         # Cron job management
│   │   ├── ai/           # AI-powered features
│   │   └── github/       # GitHub integration
│   ├── tasks/page.tsx    # Task management UI
│   ├── approvals/page.tsx # Approval queue UI
│   ├── calendar/page.tsx  # Calendar with Google sync
│   ├── projects/page.tsx  # Projects dashboard
│   ├── cron/page.tsx      # Cron jobs management
│   ├── page.tsx          # Main dashboard
│   ├── layout.tsx        # Root layout with nav
│   └── globals.css       # Design system + animations
├── components/
│   ├── navigation.tsx    # Sidebar navigation
│   ├── ai-prompt-input.tsx # Natural language AI input
│   ├── tasks-table.tsx   # Task table component
│   ├── approval-card.tsx # Approval cards
│   ├── repo-card.tsx     # GitHub repo cards
│   └── ui/               # Reusable UI components
├── lib/
│   ├── ai/prompt-parser.ts # AI prompt parsing logic
│   ├── clawdbot.ts       # Clawdbot CLI integration
│   ├── github.ts         # GitHub API client
│   └── utils.ts          # Utilities (cn, formatters)
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── dev.db           # SQLite database
└── docs/                 # Documentation
```

## 🎨 Design System

### Color Palette
```css
--bg-base: #0a0a0f          /* Deep blue-black background */
--bg-elevated: #12121a      /* Slightly elevated surfaces */
--bg-card: #1a1a24          /* Card backgrounds */
--bg-hover: #22222e         /* Hover states */

--primary: #5b7cff          /* Vibrant blue */
--success: #00d084          /* Mint green */
--warning: #ffb84d          /* Warm orange */
--danger: #ff5757           /* Coral red */

--text-primary: #f5f5f7     /* Main text */
--text-secondary: #b4b4bb   /* Secondary text */
--text-tertiary: #7a7a85    /* Tertiary text */
```

### Typography
- **Display/Headings:** Space Grotesk (700 weight, -0.03em tracking)
- **Body Text:** Plus Jakarta Sans (400-600 weights)
- **Monospace:** JetBrains Mono (code, version numbers)

### Key Design Features
- ✨ **Glass morphism** navigation with backdrop blur
- ✨ **Gradient backgrounds** on cards and buttons
- ✨ **Shimmer effects** on stat cards
- ✨ **Staggered animations** for list reveals
- ✨ **Subtle grain texture** overlay
- ✨ **Cursor-following glow** on interactive elements
- ✨ **Active state indicators** (left border on nav items)

## 🗄️ Database Schema

### Core Models
- **Task** - title, description, status, priority, dueDate, createdAt, updatedAt
- **Approval** - title, description, type, status, metadata, createdAt
- **Event** - title, description, startTime, endTime, location, googleEventId
- **Project** - name, description, status, githubRepo, createdAt
- **Person** - name, email, role, githubUsername, createdAt

## 🔌 Integrations

### Clawdbot CLI
- Natural language task creation
- AI-powered approval checking
- Command execution from UI

### Google Calendar
- Two-way sync of events
- Real-time updates
- Timezone handling

### GitHub (planned)
- Repository listing
- Issue sync
- PR tracking

## 🚀 Recent Changes (Feb 18, 2026)

### UI/UX Redesign
1. **Typography overhaul** - Replaced Inter with Space Grotesk + Plus Jakarta Sans
2. **Enhanced color system** - Deeper backgrounds (#0a0a0f), distinctive accents
3. **Stat cards redesign** - Gradient backgrounds, shimmer effects, progress bars
4. **Navigation upgrade** - Glass morphism, active indicators, logo with emoji
5. **Animation system** - Staggered fade-ins, gradient shifts, hover glows
6. **Button improvements** - Gradient backgrounds, layered shadows, lift effects
7. **Layout fix** - Proper padding-left on body for sidebar alignment
8. **Grain texture** - Subtle SVG noise overlay for depth

### Git Setup
- ✅ Initialized separate git repo for mission-control
- ✅ Connected to https://github.com/deepakdevp/mission-control.git
- ✅ Force pushed latest with all UI improvements

## 🛠️ Development Workflow

### Running Dev Server
```bash
cd mission-control
npm run dev
# Runs on http://localhost:3000
```

### Database Commands
```bash
npx prisma migrate dev    # Run migrations
npx prisma studio         # Open database GUI
npx prisma generate       # Generate Prisma client
```

### Git Workflow
```bash
git add .
git commit -m "feat: your message"  # Follow Conventional Commits
git push origin main
```

## 📝 Active Tasks & Future Work

### Immediate Priorities
- [ ] Add mobile menu (sidebar hidden on <640px)
- [ ] Implement GitHub integration
- [ ] Add user authentication
- [ ] Build Memory page (knowledge base)
- [ ] Build People page (contacts)
- [ ] Build Docs page (documentation hub)

### Design Enhancements
- [ ] Add more micro-interactions
- [ ] Implement dark/light theme toggle
- [ ] Add keyboard shortcuts (⌘K command palette)
- [ ] Improve loading states
- [ ] Add empty state illustrations

### Feature Additions
- [ ] Real-time updates (WebSockets)
- [ ] Export/import data
- [ ] Custom themes
- [ ] Plugin system
- [ ] Mobile app (React Native)

## 🔑 Environment Variables

Required in `.env`:
```env
GOOGLE_CALENDAR_API_KEY=your_key_here
GITHUB_TOKEN=your_token_here
OPENAI_API_KEY=your_key_here  # For AI features
```

## 📚 Key Files to Know

### Design System
- `app/globals.css` - All CSS variables, components, animations
- `components/navigation.tsx` - Sidebar navigation with glass effect
- `app/layout.tsx` - Root layout with font configuration

### Core Features
- `app/page.tsx` - Main dashboard with stats
- `app/tasks/page.tsx` - Task management
- `app/calendar/page.tsx` - Calendar with Google sync
- `lib/ai/prompt-parser.ts` - AI prompt parsing logic

### Documentation
- `README.md` - Project overview
- `QUICKSTART.md` - 5-minute setup guide
- `CLAWDBOT_INTEGRATION.md` - Clawdbot integration details
- `IMPLEMENTATION_SUMMARY.md` - Technical summary

## 🎯 Design Philosophy

Mission Control follows these principles:

1. **Distinctive, not generic** - No Inter/Roboto/Arial fonts, no default blue gradients
2. **Bold visual moments** - Gradient text, shimmer effects, glows that surprise
3. **Orchestrated animations** - Staggered reveals, not scattered micro-interactions
4. **High contrast CTAs** - Buttons and actions should pop dramatically
5. **Atmosphere over flatness** - Grain, gradients, depth layers
6. **Mobile-first responsive** - Adapts gracefully to all screen sizes

## 🔄 Daily Workflow

When making changes:
1. Start dev server: `npm run dev`
2. Make changes
3. Test in browser (http://localhost:3000)
4. Commit with conventional format: `git commit -m "feat/fix: description"`
5. Push to GitHub: `git push origin main`

## 📖 Learning Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Frontend Design Ultimate Skill](/Users/deepak.panwar/clawd/skills/frontend-design-ultimate/SKILL.md)
- [UI Audit Skill](/Users/deepak.panwar/clawd/skills/ui-audit/SKILL.md)

---

**Last Updated:** 2026-02-18  
**Current Version:** 0.1.0  
**Status:** ✅ Active Development
