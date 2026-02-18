# Mission Control - Quick Start

Get up and running in 5 minutes.

## 🚀 Installation

```bash
# 1. Navigate to mission-control
cd mission-control

# 2. Install dependencies
npm install

# 3. Set up database
npx prisma generate
npx prisma db push

# 4. (Optional) Add sample data
npx prisma db seed
```

## 🔑 Configuration

Create `.env.local`:

```bash
DATABASE_URL="file:./dev.db"

# Add at least one AI API key for prompt parsing
ANTHROPIC_API_KEY=sk-ant-xxxxx
# OR
OPENAI_API_KEY=sk-xxxxx
```

Get API keys:
- **Claude:** https://console.anthropic.com/
- **OpenAI:** https://platform.openai.com/

## ▶️ Run

```bash
npm run dev
```

Open http://localhost:3000

## ✅ First Steps

### 1. Create a Task (AI-powered)

Go to **Tasks** page and try:

```
Add task: review PR #123, high priority, due tomorrow
```

The AI will parse:
- Title: "Review PR #123"
- Priority: High
- Due date: Tomorrow's date
- Tags: ["pr", "review"]

### 2. Set Up GitHub Integration (Optional)

```bash
# Install GitHub CLI
brew install gh

# Authenticate
gh auth login

# Visit Projects page - it will auto-fetch your repos!
```

### 3. Calendar Integration (Optional)

If you have `gog` skill:

```bash
# Authenticate Google Calendar
gog auth login

# Try AI event creation:
"Schedule meeting with John tomorrow 2pm for 1 hour"
```

## 📚 What's Next?

- Read the full [README.md](README.md)
- Check [docs/SETUP.md](docs/SETUP.md) for detailed config
- Browse [docs/API.md](docs/API.md) for API docs
- Customize the theme in `app/globals.css`

## 🛠️ Common Commands

```bash
npm run dev         # Development server
npm run build       # Production build
npm run start       # Production server
npx prisma studio   # Database GUI
```

## ❓ Troubleshooting

**AI prompts not working?**
- Check `.env.local` has an API key
- Verify key is valid

**GitHub repos not showing?**
- Install `gh` CLI: `brew install gh`
- Run `gh auth login`

**Build errors?**
- Delete `.next` folder
- Run `npm install` again
- Make sure Node.js 18+ is installed

**Database issues?**
- Delete `dev.db` and `prisma/dev.db`
- Run `npx prisma db push` again

---

Need help? Open an issue on GitHub!
