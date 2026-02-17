# Mission Control - Quick Start Guide

## Installation & Setup

```bash
cd ~/mission-control
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

```bash
npm run build
npm start
```

## First Steps

1. **Create Your First Task**
   - Navigate to Tasks page (default page)
   - Click "Add Task" button
   - Fill in title, description, priority
   - Add tags
   - Click "Create"
   - Drag the task between columns to change status

2. **Try the Command Palette**
   - Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
   - Type to search
   - Navigate quickly between pages
   - Press `Escape` to close

3. **Add a Calendar Event**
   - Go to Calendar page
   - Click on a time slot or click "Add Event"
   - Fill in event details
   - Click "Create Event"
   - See it appear on the calendar

4. **Create a Memory Entry**
   - Navigate to Memory page
   - Click "Add Memory"
   - Write content in Markdown
   - Select a category
   - Add tags
   - Click "Create Memory"
   - Search for it using the search box

5. **Add a Contact**
   - Go to People page
   - Click "Add Contact"
   - Enter name, email, phone
   - Add social links (LinkedIn, Twitter, GitHub)
   - Add tags
   - Click "Add Contact"

6. **Create a Project**
   - Navigate to Projects page
   - Click "New Project"
   - Enter project details
   - Set start/end dates
   - Click "Create Project"
   - Create tasks with the projectId to link them

## Features to Explore

### Real-time Updates
- Open two browser windows side by side
- Edit a file in `clawd/tasks/` directory manually
- Watch the UI update automatically in both windows
- Toast notifications appear for changes

### Drag & Drop
- Go to Tasks page
- Drag tasks between columns
- Status updates automatically
- SSE broadcasts the change

### Markdown Support
- Memory and Documents support full Markdown
- Try headers, lists, code blocks
- Live preview in view mode

### Search & Filters
- Use search boxes on each page
- Filter tasks by priority, project
- Filter memories by category
- Search people by name, email, tags

### Command Palette
- Quick navigation: Type page name
- Quick actions: "Create Task", "Add Contact"
- Keyboard-friendly

## Keyboard Shortcuts

- `Cmd+K` / `Ctrl+K` - Open command palette
- `Escape` - Close modals/command palette
- `Enter` - Submit forms
- `Tab` - Navigate form fields

## File Structure

All data is stored in `clawd/` directory as JSON files:

```
clawd/
├── tasks/
│   └── task-123456789.json
├── approvals/
│   └── approval-123456789.json
├── calendar/
│   └── event-123456789.json
├── projects/
│   └── project-123456789.json
├── memory/
│   └── memory-123456789.json
├── docs/
│   └── doc-123456789.json
├── people/
│   └── person-123456789.json
└── cron/
    └── cron-123456789.json
```

You can manually edit these files and changes will appear in the UI instantly.

## Sample Data

### Create a Sample Task
```json
{
  "id": "task-sample-1",
  "title": "Review mission control implementation",
  "description": "Check all features are working correctly",
  "status": "in_progress",
  "priority": "high",
  "assignedTo": "User",
  "projectId": "project-mission-control",
  "tags": ["review", "important"],
  "createdAt": "2024-02-17T10:00:00Z",
  "updatedAt": "2024-02-17T10:00:00Z"
}
```

Save as `clawd/tasks/task-sample-1.json`

### Create a Sample Memory
```json
{
  "id": "memory-sample-1",
  "title": "Mission Control Completion",
  "content": "Successfully built the entire mission control dashboard with all features:\n\n- Drag & drop tasks\n- Real-time updates\n- Command palette\n- 8 complete pages\n\nNext: Deploy and start using!",
  "tags": ["milestone", "achievement"],
  "category": "work",
  "createdAt": "2024-02-17T10:00:00Z",
  "updatedAt": "2024-02-17T10:00:00Z"
}
```

Save as `clawd/memory/memory-sample-1.json`

## Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript Errors
```bash
# Check for type errors
npm run build
```

### File Watcher Not Working
- Check that `clawd/` directory exists
- Ensure proper permissions
- Check console for errors
- Restart dev server

### SSE Not Connecting
- Check browser console for errors
- Verify `/api/events` endpoint is accessible
- Try hard refresh (Cmd+Shift+R)

## Tips & Tricks

1. **Use Tags Effectively**
   - Tag tasks, memories, documents, people
   - Search by tags
   - Color-coded for quick recognition

2. **Organize with Projects**
   - Create projects for major initiatives
   - Link tasks to projects
   - Track progress automatically

3. **Markdown Power**
   - Use code blocks for technical notes
   - Create checklists in memories
   - Link to other resources

4. **Command Palette Workflow**
   - Keep hands on keyboard
   - Quick navigation without mouse
   - Muscle memory for common actions

5. **Cron Jobs**
   - Define periodic tasks
   - Track last run/next run
   - Enable/disable as needed

## What's Next?

After getting familiar with the basics:

1. **Customize**
   - Modify colors in `app/globals.css`
   - Add new fields to models
   - Create custom components

2. **Extend**
   - Add authentication
   - Integrate with external APIs
   - Build automation workflows

3. **Deploy**
   - Deploy to Vercel
   - Set up custom domain
   - Configure environment variables

4. **Integrate**
   - Connect to AI agents
   - Automate task creation
   - Build approval workflows

## Support

- Check README.md for detailed documentation
- Review IMPLEMENTATION.md for technical details
- Examine component source code
- Look at model schemas in `lib/models/`

## Happy Building! 🚀

The Mission Control dashboard is now your command center. Use it to:
- Manage AI agent tasks
- Track approvals
- Schedule events
- Organize knowledge
- Maintain contacts
- Automate workflows

Everything is in place. Start exploring!
