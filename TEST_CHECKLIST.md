# Mission Control Test Checklist

Use this checklist to verify all features are working correctly.

## Prerequisites

- [ ] Node.js 20+ installed
- [ ] `npm install` completed successfully
- [ ] `.env` file created with `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
- [ ] Database initialized: `npx prisma db push`
- [ ] `gh` CLI installed and authenticated (`gh auth status`)
- [ ] `gog` CLI installed and authenticated (optional)

## Build & Development Server

### Build Test
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] Only minor warnings allowed (e.g., CSS import order)

### Dev Server Test
```bash
npm run dev
```
- [ ] Server starts on http://localhost:3000
- [ ] No console errors on homepage load

## Theme & UI

### Glass-Morphism Theme
- [ ] Background is dark (#0a0a0a)
- [ ] Cards have blur effect (backdrop-blur visible)
- [ ] Cards have soft shadows
- [ ] Cards have semi-transparent backgrounds
- [ ] Hover effects work on cards
- [ ] Inter font is loaded and applied

## Tasks Page

### Navigation
- [ ] Navigate to `/tasks`
- [ ] Page loads without errors
- [ ] Empty state shows if no tasks

### AI Prompt Input
Test prompt: "Add task: review PR #123, high priority, due tomorrow"

- [ ] Input field visible at top
- [ ] Enter key submits prompt
- [ ] Loading spinner shows while processing
- [ ] Success toast appears
- [ ] New task appears in table

Verify parsed fields:
- [ ] Title: "Review PR #123"
- [ ] Priority: high (orange badge)
- [ ] Due date: tomorrow's date
- [ ] Tags: ["pr", "review"]

### Table Features

#### Inline Editing
- [ ] Click on task title → input field appears
- [ ] Edit title and press Enter → saves
- [ ] Edit title and click away → saves

#### Status Changes
- [ ] Click on status badge → dropdown appears
- [ ] Select different status → updates immediately
- [ ] Badge color changes correctly

#### Filters
- [ ] Search box filters tasks in real-time
- [ ] Status dropdown filters correctly
- [ ] Priority dropdown filters correctly
- [ ] Multiple filters work together

#### Batch Selection
- [ ] Click checkbox to select task
- [ ] Click header checkbox to select all
- [ ] Batch actions bar appears when tasks selected
- [ ] "Mark Done" button works
- [ ] "Delete" button works (with confirmation)

#### Sorting
- [ ] Click "Title" header → sorts alphabetically
- [ ] Click "Priority" header → sorts by priority
- [ ] Click "Due Date" header → sorts by date
- [ ] Click again → reverses sort order

#### Actions Menu
- [ ] Hover row → more options button visible
- [ ] Click more options → dropdown shows
- [ ] Edit action works
- [ ] Delete action works (with confirmation)

## Calendar Page

### Navigation
- [ ] Navigate to `/calendar`
- [ ] Calendar view loads (week view default)
- [ ] Today's date is highlighted

### AI Prompt Input
Test prompt: "Schedule team meeting tomorrow 2pm for 1 hour"

- [ ] Input field visible at top
- [ ] Submit prompt
- [ ] Success toast appears
- [ ] Event appears in calendar

Verify parsed fields:
- [ ] Title: "Team meeting"
- [ ] Date: tomorrow
- [ ] Time: 2:00 PM
- [ ] Duration: 1 hour (ends 3:00 PM)

### Calendar Views
- [ ] Switch to Month view → works
- [ ] Switch to Day view → works
- [ ] Switch to Agenda view → works
- [ ] Navigate to next/previous → works

### Today's Agenda Sidebar
- [ ] Sidebar shows today's events
- [ ] Events sorted by time
- [ ] Shows time, title, location

### Google Calendar Sync (Optional - requires gog)
- [ ] Sync button triggers sync
- [ ] Events from Google Calendar appear
- [ ] Creating event syncs to Google
- [ ] Success message shows sync count

## Projects Page

### Navigation
- [ ] Navigate to `/projects`
- [ ] Page loads without errors

### GitHub Integration
- [ ] Repos from `gh repo list` appear
- [ ] Each repo card shows:
  - [ ] Repo name
  - [ ] Description
  - [ ] Language
  - [ ] Star count
  - [ ] Fork count
  - [ ] Open issues count
  - [ ] Open PRs count
  - [ ] Last updated time

### Repo Expansion
- [ ] Click repo card → expands
- [ ] Shows open issues (if any)
- [ ] Shows open PRs (if any)
- [ ] Shows recent commits
- [ ] Shows contributors with avatars
- [ ] "View on GitHub" link works

### Search
- [ ] Search box filters repos by name
- [ ] Filters by description
- [ ] Filters by language

### Refresh
- [ ] Refresh button shows loading spinner
- [ ] Fetches latest data from GitHub
- [ ] Success toast appears

## Approvals Page

### Navigation
- [ ] Navigate to `/approvals`
- [ ] Page loads without errors
- [ ] Empty state shows if no approvals

### Create Test Approval (via API)
```bash
curl -X POST http://localhost:3000/api/approvals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test File Deletion",
    "description": "Delete 3 backup files",
    "status": "pending",
    "requestedBy": "agent",
    "metadata": "{\"action\":\"delete\",\"files\":[\"file1.db\",\"file2.db\"],\"totalSize\":\"100MB\",\"reasoning\":\"Test approval request\"}"
  }'
```

### Approval Card
- [ ] Card appears in list
- [ ] Shows title and description
- [ ] Shows "Pending" badge
- [ ] Shows requester and time
- [ ] Expand button works

### Expanded View
- [ ] Context section shows metadata
- [ ] AI reasoning displays
- [ ] Notes textarea visible
- [ ] Approve button visible
- [ ] Deny button visible

### Approve Action
- [ ] Click Approve
- [ ] Optional notes can be added
- [ ] Success toast appears
- [ ] Badge changes to "Approved"
- [ ] Buttons disappear

### Deny Action
- [ ] Create another test approval
- [ ] Click Deny
- [ ] Success toast appears
- [ ] Badge changes to "Denied"

### Filter
- [ ] Status filter dropdown works
- [ ] "Pending" shows only pending
- [ ] "Approved" shows only approved
- [ ] "Denied" shows only denied

## API Routes

### Tasks API
```bash
# List tasks
curl http://localhost:3000/api/tasks

# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","priority":"high"}'

# Update task
curl -X PUT http://localhost:3000/api/tasks/{id} \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'

# Delete task
curl -X DELETE http://localhost:3000/api/tasks/{id}

# Parse prompt
curl -X POST http://localhost:3000/api/tasks/parse \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Add task: test, high priority"}'
```

- [ ] All endpoints return valid JSON
- [ ] No 500 errors

### Calendar API
```bash
# List events
curl http://localhost:3000/api/calendar

# Create event
curl -X POST http://localhost:3000/api/calendar \
  -H "Content-Type: application/json" \
  -d '{"title":"Test event","startTime":"2026-02-20T14:00:00","endTime":"2026-02-20T15:00:00"}'

# Parse prompt
curl -X POST http://localhost:3000/api/calendar/parse \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Schedule meeting tomorrow 2pm"}'

# Sync with Google (requires gog)
curl -X POST http://localhost:3000/api/calendar/sync \
  -H "Content-Type: application/json" \
  -d '{"action":"sync"}'
```

- [ ] All endpoints return valid JSON
- [ ] No 500 errors

### GitHub API
```bash
# List repos
curl http://localhost:3000/api/github/repos

# List repos with details
curl "http://localhost:3000/api/github/repos?detailed=true"
```

- [ ] Returns repo list
- [ ] Detailed view includes issues/PRs

### Approvals API
```bash
# List approvals
curl http://localhost:3000/api/approvals

# Approve
curl -X PUT http://localhost:3000/api/approvals/{id} \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","response":"approved"}'
```

- [ ] CRUD operations work

## Error Handling

### Missing API Key
- [ ] Remove `ANTHROPIC_API_KEY` from `.env`
- [ ] Try creating task with AI prompt
- [ ] Should show error toast
- [ ] Should fall back to basic parsing

### GitHub Not Authenticated
- [ ] `gh auth logout`
- [ ] Projects page should show error message
- [ ] Should suggest running `gh auth login`

### Invalid Input
- [ ] Try creating task with empty title
- [ ] Should show validation error
- [ ] Try creating event with invalid date
- [ ] Should show error toast

## Performance

- [ ] Initial page load < 2 seconds
- [ ] Task list with 100+ tasks renders smoothly
- [ ] Filters update in real-time (< 100ms)
- [ ] GitHub repo fetch completes in reasonable time
- [ ] No memory leaks (check browser DevTools)

## Responsive Design

### Desktop (1920x1080)
- [ ] All pages look good
- [ ] Tables are readable
- [ ] Sidebars visible

### Tablet (768x1024)
- [ ] Layout adjusts correctly
- [ ] Tables remain usable
- [ ] Navigation accessible

### Mobile (375x667)
- [ ] Cards stack vertically
- [ ] Tables scroll horizontally
- [ ] Touch targets are large enough

## Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

## Production Build

```bash
npm run build
npm start
```

- [ ] Production build starts successfully
- [ ] All features work in production mode
- [ ] Static pages pre-rendered
- [ ] No hydration errors

## Final Checks

- [ ] No console errors in browser
- [ ] No console warnings (or only minor ones)
- [ ] Database file created (`dev.db`)
- [ ] All pages accessible via navigation
- [ ] Glass-morphism theme consistent across all pages

## Issues Found

Document any issues here:

1. 
2. 
3. 

---

**Testing Date:** _____________  
**Tester:** _____________  
**Version:** _____________  
**Pass/Fail:** _____________
