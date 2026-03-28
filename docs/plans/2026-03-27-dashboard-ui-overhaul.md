# Mission Control — Dashboard & UI Overhaul Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix bugs, remove dead pages, connect real data, and rebuild the dashboard into a useful at-a-glance command center

**Architecture:** Fix CSS variable inconsistencies → remove dead nav links → rebuild dashboard with real data widgets → polish each page

**Tech Stack:** Next.js 16 App Router, Tailwind v4, shadcn/ui (Radix), Prisma/SQLite, Recharts, react-grid-layout

---

## PHASE 1 — Bug Fixes & Cleanup (High Priority, ~2 hours)

---

### Task 1: Fix Undefined CSS Variables

**Files:**
- Modify: `app/globals.css`

**Problem:** These variables are referenced but never defined, causing silent failures:
- `--bg-base`, `--bg-elevated` (used in scrollbar CSS)
- `--accent-primary`, `--border-primary`, `--border-secondary`
- `--text-tertiary`, `--text-quaternary`

**Fix:** Add to `:root` block in globals.css:
```css
/* Missing variables — add to :root */
--bg-base: #F7F7FB;
--bg-elevated: #EEEEEE;
--accent-primary: #5B4EE8;
--border-primary: #EEEEEE;
--border-secondary: #F3F4F6;
--text-tertiary: #9CA3AF;
--text-quaternary: #D1D5DB;
```

**Verify:** Scrollbars, focus rings, dividers all render correctly

---

### Task 2: Fix Inter Font — Remove Double Load

**Files:**
- Modify: `app/globals.css` — remove Google Fonts `@import` at top
- Modify: `app/layout.tsx` — ensure `inter.variable` is used properly

**Problem:** Google Fonts CDN import + next/font both loading Inter = flash + wasted bandwidth

**Fix:**
```css
/* REMOVE this line from globals.css: */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Use the CSS variable from next/font instead: */
body {
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

In `layout.tsx`:
```tsx
// Already has: inter.variable → '--font-sans'
// body className should use: `${inter.variable} font-sans`
```

---

### Task 3: Remove Dead Nav Links + Add Missing Pages

**Files:**
- Modify: `components/navigation.tsx`
- Create: `app/memory/page.tsx` (simple read-only view of memory files)
- Create: `app/docs/page.tsx` (simple markdown doc viewer)
- Decision: Remove `/people` link (not needed for personal use)

**Remove from navItems array:**
```tsx
// REMOVE:
{ href: '/people', icon: Users, label: 'People' },

// KEEP but add pages for:
{ href: '/memory', icon: Brain, label: 'Memory' },
{ href: '/docs', icon: FileText, label: 'Docs' },
```

**Group nav items visually with section separators:**
```
⚡ Mission Control
────────────────
🏠 Dashboard
🧠 Nerve Center
────────────────
✅ Tasks
💡 Ideas
🛡️ Approvals
────────────────
📈 Portfolio
📅 Calendar
🐙 Projects
────────────────
🧠 Memory
📝 Docs
⏱️ Cron
```

---

### Task 4: Fix react-grid-layout CSS

**Files:**
- Modify: `app/layout.tsx` or `app/page.tsx`

**Fix:** Import grid layout CSS:
```tsx
import 'react-grid-layout/css/styles.css';
import 'react-resize-detector'; // if needed
```

---

### Task 5: Fix Mobile Layout

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/navigation.tsx`

**Fix:** Make sidebar collapsible on mobile:
```tsx
// layout.tsx — replace hardcoded paddingLeft
<body className={`${inter.variable} font-sans md:pl-[230px]`}>
```

Add hamburger toggle in nav for mobile (simple state toggle, sidebar slides in/out)

---

## PHASE 2 — Dashboard Rebuild (Most Impactful, ~3 hours)

---

### Task 6: Connect Real Portfolio Data to Dashboard

**Files:**
- Create: `app/api/portfolio-summary/route.ts`
- Modify: `app/page.tsx`

**Problem:** Dashboard shows hardcoded fake numbers. Real data is at:
- `/Users/deepak.panwar/clawd/portfolio/binance-portfolio.json`
- `/Users/deepak.panwar/clawd/portfolio/zerodha-portfolio.json`

**API route** reads files from `process.env.PORTFOLIO_PATH` (set in .env):
```ts
// app/api/portfolio-summary/route.ts
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const portfolioDir = process.env.PORTFOLIO_DIR || '/Users/deepak.panwar/clawd/portfolio'
  
  try {
    const binance = JSON.parse(readFileSync(join(portfolioDir, 'binance-portfolio.json'), 'utf8'))
    const zerodha = JSON.parse(readFileSync(join(portfolioDir, 'zerodha-portfolio.json'), 'utf8'))
    // etc.
    return Response.json({ binance, zerodha, ... })
  } catch {
    return Response.json({ error: 'Portfolio data unavailable' }, { status: 503 })
  }
}
```

---

### Task 7: Add Task Summary Widget to Dashboard

**Files:**
- Create: `components/dashboard/tasks-widget.tsx`
- Modify: `app/page.tsx`

**Widget shows:**
- Count of todo / in_progress / done tasks
- 3 most recent in-progress tasks with title + priority badge
- Link to Tasks page

---

### Task 8: Add Today's Calendar Widget to Dashboard

**Files:**
- Create: `components/dashboard/calendar-widget.tsx`
- Modify: `app/page.tsx`

**Widget shows:**
- Today's date + day
- Next 3 upcoming events (title, time)
- "No events today" empty state
- Link to Calendar page

---

### Task 9: Add Recent GitHub Activity Widget

**Files:**
- Create: `components/dashboard/github-widget.tsx`
- Modify: `app/page.tsx`

**Widget shows:**
- 5 most recent commits across all repos
- Repo name + commit message + time ago
- Link to Projects page

---

### Task 10: Redesign Dashboard Layout

**Files:**
- Modify: `app/page.tsx`

**New layout (Bento Grid style, replaces current):**
```
┌─────────────────┬──────────┬──────────┐
│   Portfolio     │  Tasks   │ Calendar │
│   Summary       │ Summary  │  Today   │
│   (wide)        │          │          │
├──────────┬──────┴──────────┴──────────┤
│  GitHub  │     Quick Actions           │
│ Activity │  [+ Task] [+ Idea] [Cron]  │
└──────────┴────────────────────────────┘
```

**Design rules (ui-ux-pro-max):**
- Row height: 200px min (not 150px)
- Cards with visible shadow: `0 2px 8px rgba(0,0,0,0.08)`
- Widget titles: 13px uppercase tracking-wide text-muted
- Numbers: 28px/700 weight
- Persist layout to localStorage

---

## PHASE 3 — Visual Polish (~2 hours)

---

### Task 11: Loading Skeletons (replace spinners)

**Files:**
- Create: `components/ui/skeleton.tsx`
- Modify: `app/tasks/page.tsx`, `app/portfolio/page.tsx`, `app/projects/page.tsx`

**Pattern:**
```tsx
// Skeleton block:
<div className="animate-pulse bg-gray-100 rounded-lg h-10 w-full" />
```

---

### Task 12: Card Shadow & Visual Depth Fix

**Files:**
- Modify: `app/globals.css`

**Fix shadow values to be actually visible:**
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12);
```

---

### Task 13: Nav Visual Grouping

**Files:**
- Modify: `components/navigation.tsx`

Add section dividers between nav groups (see Task 3 layout above). Just a `<div className="mx-4 my-2 border-t border-[#F3F4F6]" />` between groups.

---

### Task 14: Page Header Consistency

**Files:**
- Audit all `app/*/page.tsx` files

Every page should follow the same header pattern:
```tsx
<div className="bg-white border-b border-[#EEEEEE] sticky top-0 z-40">
  <div className="h-14 px-6 flex items-center justify-between">
    <h1 className="text-[28px] font-bold text-[#1A1A2E]">Page Title</h1>
    <div className="flex gap-2">
      {/* page-level actions */}
    </div>
  </div>
</div>
```

Currently `portfolio/page.tsx` and `nerve-center/page.tsx` don't have actions. `ideas/page.tsx` has inline form instead of consistent header CTA.

---

## PHASE 4 — New Features (~3 hours)

---

### Task 15: Simple Memory Viewer Page

**Files:**
- Create: `app/memory/page.tsx`
- Create: `app/api/memory/route.ts`

**Shows:** List of `memory/*.md` files from your clawd workspace, rendered as markdown cards. Read-only. Click to expand.

---

### Task 16: Quick Add Floating Button

**Files:**
- Create: `components/quick-add.tsx`
- Modify: `app/layout.tsx`

**FAB (floating action button) fixed bottom-right:**
- Click → popover with options: + Task | + Idea | + Event
- Each option opens a mini inline form (title only, quick save)
- Most common action you'd do daily

---

## Summary

| Phase | Tasks | Time | Impact |
|---|---|---|---|
| 1 — Bug Fixes | 1-5 | ~2h | Fixes broken things |
| 2 — Dashboard | 6-10 | ~3h | Makes it actually useful |
| 3 — Polish | 11-14 | ~2h | Looks professional |
| 4 — Features | 15-16 | ~3h | Adds daily value |
| **Total** | **16 tasks** | **~10h** | |

---

**Execution options:**
1. **Subagent-Driven (this session)** — spawn one sub-agent per task, review between each
2. **Parallel Session** — open new Claude Code session with this plan

Which approach do you want?
