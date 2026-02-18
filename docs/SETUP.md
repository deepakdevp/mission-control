# Mission Control Setup Guide

Detailed configuration instructions for all integrations.

## Database Setup

Mission Control uses SQLite with Prisma ORM.

### Initial Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

### Database Location

Default: `mission-control/dev.db`

To change location, update `.env.local`:

```
DATABASE_URL="file:./path/to/your/database.db"
```

### Viewing Data

Use Prisma Studio (database GUI):

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

### Backup

Simply copy the `dev.db` file:

```bash
cp dev.db backups/dev-$(date +%Y%m%d).db
```

## AI API Configuration

### Anthropic Claude (Recommended)

1. Sign up at https://console.anthropic.com/
2. Create an API key
3. Add to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Pricing:** ~$3 per 1M input tokens, $15 per 1M output tokens

**Model used:** `claude-3-5-sonnet-20241022`

### OpenAI (Alternative)

1. Sign up at https://platform.openai.com/
2. Create an API key
3. Add to `.env.local`:

```
OPENAI_API_KEY=sk-xxxxx
```

**Pricing:** ~$2.50 per 1M input tokens, $10 per 1M output tokens

**Model used:** `gpt-4-turbo-preview`

### Fallback Behavior

- If Claude API key exists → uses Claude
- Else if OpenAI API key exists → uses OpenAI
- Else → uses basic fallback parsing (no AI)

## GitHub CLI Setup

### Installation

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
# Debian/Ubuntu
sudo apt install gh

# Fedora
sudo dnf install gh
```

**Windows:**
```bash
winget install GitHub.cli
```

### Authentication

```bash
# Interactive login
gh auth login

# Choose:
# - GitHub.com
# - HTTPS
# - Login via browser
```

### Verification

```bash
# List your repositories
gh repo list

# View repo details
gh repo view owner/repo
```

### Permissions

Scopes needed:
- `repo` (full control of repositories)
- `read:org` (read organization data)
- `workflow` (update GitHub Actions workflows)

## Google Calendar Integration

### Prerequisites

- `gog` skill installed in Clawdbot
- Google account with Calendar enabled

### Setup

1. **Authenticate gog:**

```bash
gog auth login
```

2. **Test calendar access:**

```bash
# List today's events
gog calendar list

# Add test event
gog calendar add "Test Event" --date "2026-02-18" --time "14:00"
```

3. **Configure sync interval:**

Edit `mission-control/.env.local`:

```
CALENDAR_SYNC_INTERVAL_MS=300000  # 5 minutes
```

### Sync Behavior

- **On page load:** Fetches events from Google Calendar
- **On create/edit:** Updates both Google Calendar and local DB
- **Background sync:** Polls Google every 5 minutes for external changes
- **Conflict resolution:** Google Calendar is source of truth

### Troubleshooting

**Issue:** "gog command not found"

**Solution:** Install gog skill:
```bash
# Navigate to Clawdbot skills directory
cd ~/clawd/skills
git clone https://github.com/clawdbot/gog
cd gog
npm install
```

**Issue:** "Authentication failed"

**Solution:** Re-authenticate:
```bash
gog auth logout
gog auth login
```

## Environment Variables Reference

Create `.env.local` in mission-control directory:

```bash
# Database
DATABASE_URL="file:./dev.db"

# AI APIs (at least one required)
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx

# Calendar Sync (optional)
CALENDAR_SYNC_INTERVAL_MS=300000

# GitHub Integration (uses gh CLI, no env vars needed)

# Node Environment
NODE_ENV=development
```

## File System Integration

Mission Control stores data in both database and files for Clawdbot integration.

### Directory Structure

```
clawd/
├── tasks/
│   └── {task-id}.json
├── approvals/
│   └── {approval-id}.json
├── calendar/
│   └── {event-id}.ics
├── memory/
│   └── YYYY-MM-DD.md
└── docs/
    └── **/*.md
```

### File Sync

**DB → File (on write):**

When you create/update via UI → writes to both DB and file

**File → DB (on change):**

Chokidar watches `clawd/` directory → syncs changes to DB

**Conflict Resolution:**

- Database wins on conflicts
- File changes only update DB if record doesn't exist
- Conflicts logged to `clawd/sync-conflicts.log`

### Disable File Sync

If you only want database storage:

Comment out file watcher in `lib/file-sync.ts` (if implemented)

## Performance Optimization

### Database Indexing

Already configured in `prisma/schema.prisma`:

- Task: status, projectId, priority
- Approval: status, requestedAt
- CalendarEvent: startTime, googleEventId

### GitHub API Caching

Repo data cached for 5 minutes. To adjust:

Edit `app/api/github/repos/route.ts` and add cache headers.

### Bundle Size

To analyze:

```bash
npm run build
npx @next/bundle-analyzer
```

## Security

### API Keys

- Never commit `.env.local` to git (already in `.gitignore`)
- Use different keys for dev/production
- Rotate keys regularly

### Database Access

- SQLite file permissions: `chmod 600 dev.db`
- No external access by default (local file)
- For multi-user: switch to PostgreSQL

### CORS

API routes are same-origin only. To allow external access:

Add to API route:

```typescript
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

headers: {
  'Access-Control-Allow-Origin': 'https://yourdomain.com'
}
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

**Note:** SQLite doesn't persist on serverless. Use PostgreSQL:

```bash
# Update schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# Update .env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

### Self-Hosted

```bash
# Build
npm run build

# Start
npm run start

# Or use PM2
npm i -g pm2
pm2 start npm --name "mission-control" -- start
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

## Troubleshooting

### Build Errors

**Error:** "Module not found: @/components/..."

**Solution:** Check `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Error:** "Prisma Client not generated"

**Solution:**

```bash
npx prisma generate
```

### Runtime Errors

**Error:** "fetch failed" when parsing prompts

**Solution:** Check AI API keys are set in `.env.local`

**Error:** "gh command not found"

**Solution:** Install GitHub CLI (see above)

### Performance Issues

**Issue:** Slow page loads

**Solutions:**
- Enable caching for GitHub API
- Reduce GitHub repo limit (edit `lib/github.ts`)
- Use database indexes (already configured)

**Issue:** Large bundle size

**Solutions:**
- Use dynamic imports for heavy components
- Tree-shake unused libraries
- Lazy load pages

## Support

For issues:
1. Check this guide
2. Review `README.md`
3. Check GitHub issues
4. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment (OS, Node version)
