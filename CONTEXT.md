# Mission Control - Project Context

**Repository:** https://github.com/deepakdevp/mission-control.git  
**Local Path:** `/Users/deepak.panwar/clawd/mission-control`  
**Dev Server:** http://localhost:3000  
**Owner:** Deepak Dev Panwar (@deepakdevp)

## 🎯 Project Overview

Mission Control is an **AI-powered productivity workspace** built with Next.js 14, designed as a command center for managing tasks, approvals, calendar events, projects, and more through natural language AI prompts integrated with Clawdbot.

**Design System:** JMobbin-style light theme (professional SaaS equity/cap table management aesthetic)

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + Custom Design System (JMobbin specification)
- **Database:** Prisma + SQLite (dev.db)
- **Font:** Inter (Google Fonts)
- **Icons:** Lucide React
- **UI Components:** Custom components matching JMobbin spec
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
│   │   ├── cron/         # Cron job management (execSync Clawdbot CLI)
│   │   ├── ai/           # AI-powered features
│   │   └── github/       # GitHub integration
│   ├── tasks/page.tsx    # Task management UI
│   ├── approvals/page.tsx # Approval queue UI
│   ├── calendar/page.tsx  # Calendar with Google sync
│   ├── projects/page.tsx  # Projects dashboard
│   ├── cron/page.tsx      # Cron jobs management
│   ├── page.tsx          # Main dashboard
│   ├── layout.tsx        # Root layout with nav
│   └── globals.css       # JMobbin design system
├── components/
│   ├── navigation.tsx    # Sidebar navigation (230px, JMobbin style)
│   ├── ai-prompt-input.tsx # Natural language AI input
│   ├── tasks-table.tsx   # Task table component
│   ├── approval-card.tsx # Approval cards
│   ├── repo-card.tsx     # GitHub repo cards
│   └── ui/               # Reusable UI components
├── lib/
│   ├── ai/prompt-parser.ts # AI prompt parsing logic
│   ├── clawdbot.ts       # Clawdbot AI client (NOT for CLI commands)
│   ├── github.ts         # GitHub API client
│   └── utils.ts          # Utilities (cn, formatters)
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── dev.db           # SQLite database
└── docs/                 # Documentation
```

## 🎨 Design System - JMobbin Style

### Color Palette (Exact Hex Codes)
```css
/* Page Background */
--bg-page: #F7F7FB        /* Light gray page background */
--bg-card: #FFFFFF        /* Pure white card backgrounds */
--bg-hover: #F9FAFB       /* Subtle hover state */
--border: #EEEEEE         /* All borders */

/* Primary Colors */
--primary: #5B4EE8        /* Purple accent - buttons, active states */
--primary-light: #F0EFFE  /* Light purple - active nav bg, badges */
--primary-hover: #4A3DD7  /* Darker purple - button hover */

/* Status Colors */
--success: #10B981        /* Green - success, positive */
--warning: #F59E0B        /* Amber - warnings */
--danger: #EF4444         /* Red - errors, danger */

/* Text Colors */
--text-primary: #1A1A2E   /* Headlines, main text */
--text-secondary: #6B7280 /* Labels, secondary text */
--text-muted: #9CA3AF     /* Placeholder, disabled */

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 1px 4px rgba(0, 0, 0, 0.04)
--shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.08)
```

### Typography
- **Font Family:** Inter (Google Fonts)
- **Base Size:** 14px / line-height 1.5

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title | 28px | 700 | #1A1A2E |
| Metric Number | 24px | 700 | #1A1A2E |
| Section Heading | 16px | 600 | #1A1A2E |
| Card Label | 12px | 400 | #6B7280 |
| Body Text | 14px | 400 | #374151 |
| Nav Item | 14px | 500 | #374151 |
| Active Nav | 14px | 600 | #5B4EE8 |

### Layout Specifications

#### Sidebar Navigation
```css
width: 230px (fixed)
background: #FFFFFF
border-right: 1px solid #EEEEEE
padding: 16px 0

/* Header/Footer */
padding: 16px

/* Nav Items */
height: 40px
padding: 0 16px
active-bg: #F0EFFE
active-border-left: 3px solid #5B4EE8
```

#### Top Header
```css
height: 56px
padding: 0 24px
background: #FFFFFF
border-bottom: 1px solid #EEEEEE
```

#### Main Content
```css
padding: 32px horizontal (px-8)
padding: 24px vertical (py-6)
background: #F7F7FB
```

#### Cards
```css
/* Main Cards */
padding: 20px 24px
border: 1px solid #EEEEEE
border-radius: 12px
box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04)
gap: 20px (between cards)

/* Stat Cards */
padding: 16px 20px
display: flex
align-items: center
gap: 12px

/* Icon Container */
width: 32px
height: 32px
border-radius: 8px
background: #F0EFFE
color: #5B4EE8
```

#### Buttons
```css
/* Primary */
background: #5B4EE8
color: #FFFFFF
padding: 8px 16px
border-radius: 8px
font-size: 14px
font-weight: 600
box-shadow: 0 1px 3px rgba(91, 78, 232, 0.3)

/* Secondary */
background: transparent
color: #374151
border: 1px solid #E5E7EB
padding: 8px 16px
border-radius: 8px

/* Ghost */
background: transparent
color: #6B7280
hover:background: #F9FAFB
```

#### Badges
```css
padding: 2px 8px
border-radius: 999px
font-size: 12px
font-weight: 500

/* Status Colors */
in_progress: #F0EFFE bg, #5B4EE8 text
done: #D1FAE5 bg, #10B981 text
blocked: #FEE2E2 bg, #EF4444 text
```

### Spacing System
```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
```

## 🗄️ Database Schema

### Core Models
- **Task** - title, description, status, priority, dueDate, createdAt, updatedAt
- **Approval** - title, description, type, status, metadata, createdAt
- **Event** - title, description, startTime, endTime, location, googleEventId
- **Project** - name, description, status, githubRepo, createdAt
- **Person** - name, email, role, githubUsername, createdAt

## 🔌 Integrations

### Clawdbot CLI
**Important:** Cron API routes use `execSync()` to call Clawdbot CLI directly, NOT `callClawdbot()` (which is for AI instructions).

```typescript
// CORRECT - For cron operations
execSync('clawdbot cron list --json', { encoding: 'utf-8' })

// WRONG - Do NOT use for CLI commands
await callClawdbot('cron list') // This is for AI chat, not CLI
```

### Google Calendar
- Two-way sync of events
- Real-time updates
- Timezone handling

### GitHub
- Repository listing (19 repos)
- Issue tracking
- PR tracking
- Recent commits
- Contributors
- **Note:** `primaryLanguage` normalized from object to string

## 🚀 Recent Changes (Feb 18, 2026)

### Complete JMobbin Redesign
**Commits:**
1. `6879a97` - feat: initial commit with redesigned UI
2. `2faff8d` - docs: add comprehensive project context document
3. `ea45549` - fix: replace execClawdbot with callClawdbot
4. `25cebdd` - fix: update cron API routes to use execSync
5. `0de9841` - fix: normalize primaryLanguage from GitHub API
6. `79aa505` - feat: redesign dashboard to match JMobbin spec
7. `55fcebf` - fix: correct padding and margins per spec

### What Changed
**Removed (Dark Theme):**
- ❌ Dark backgrounds (#0a0a0f, #12121a)
- ❌ Space Grotesk / Plus Jakarta Sans fonts
- ❌ Gradient backgrounds
- ❌ Grain texture overlay
- ❌ Shimmer effects
- ❌ Cursor-following glows
- ❌ Complex animations
- ❌ Glass morphism

**Added (Light Theme):**
- ✅ Light backgrounds (#F7F7FB, #FFFFFF)
- ✅ Inter font
- ✅ Clean card shadows
- ✅ Exact spacing system (4/8/16/24/32px)
- ✅ Professional sidebar (230px)
- ✅ Stat cards with icons
- ✅ Simplified activity rows
- ✅ JMobbin color palette

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
- [ ] Add loading skeletons
- [ ] Improve empty state illustrations
- [ ] Add keyboard shortcuts (⌘K command palette)
- [ ] Implement dark/light theme toggle (optional)

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
- `app/globals.css` - All CSS variables, components, JMobbin styles
- `components/navigation.tsx` - Sidebar with exact 230px width
- `app/layout.tsx` - Root layout with Inter font, 230px body padding

### Core Features
- `app/page.tsx` - Main dashboard with stats
- `app/tasks/page.tsx` - Task management
- `app/calendar/page.tsx` - Calendar with Google sync
- `app/cron/page.tsx` - Cron jobs (synced with Clawdbot)
- `lib/github.ts` - GitHub integration with primaryLanguage normalization

### Documentation
- `README.md` - Project overview
- `QUICKSTART.md` - 5-minute setup guide
- `CLAWDBOT_INTEGRATION.md` - Clawdbot integration details
- `CONTEXT.md` - This file (comprehensive context)

## 🎯 Design Philosophy

Mission Control follows these principles:

1. **Professional & Clean** - JMobbin-style SaaS aesthetic
2. **Exact Specifications** - All measurements from technical spec
3. **Consistent Spacing** - 4/8/16/24/32px system strictly enforced
4. **Proper Hierarchy** - Typography scale with clear weights
5. **Accessible** - WCAG AA compliant color contrast
6. **Performant** - Minimal animations, optimized rendering

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
- [JMobbin Design Spec](./TECHNICAL_SPEC.md) - if needed

---

**Last Updated:** 2026-02-18  
**Current Version:** 0.1.0  
**Status:** ✅ Production-Ready Boilerplate

**Repository:** https://github.com/deepakdevp/mission-control.git  
**Latest Commit:** 55fcebf - fix: correct padding and margins per spec
