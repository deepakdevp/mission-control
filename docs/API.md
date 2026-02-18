# Mission Control API Documentation

All API routes for Mission Control.

## Base URL

Development: `http://localhost:3000/api`
Production: `https://yourdomain.com/api`

## Authentication

Currently no authentication (local-only app). For production deployment, add auth middleware.

---

## Tasks

### GET /api/tasks

List all tasks with optional filters.

**Query Parameters:**
- `status` (string): Filter by status (todo, in_progress, done, blocked)
- `priority` (string): Filter by priority (low, medium, high, urgent)
- `projectId` (string): Filter by project ID
- `search` (string): Search in title and description

**Response:**

```json
[
  {
    "id": "clxxx",
    "title": "Review PR #123",
    "description": "Check code quality and tests",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2026-02-20T00:00:00.000Z",
    "assignedTo": "user",
    "tags": "[\"pr\", \"review\"]",
    "projectId": "clyyy",
    "project": {
      "id": "clyyy",
      "name": "Mission Control"
    },
    "createdAt": "2026-02-17T10:00:00.000Z",
    "updatedAt": "2026-02-17T11:30:00.000Z"
  }
]
```

### POST /api/tasks

Create a new task.

**Request Body:**

```json
{
  "title": "Review PR #123",
  "description": "Check code quality and tests",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-02-20",
  "assignedTo": "user",
  "tags": ["pr", "review"],
  "projectId": "clyyy"
}
```

**Response:** 201 Created

```json
{
  "id": "clxxx",
  "title": "Review PR #123",
  ...
}
```

### GET /api/tasks/:id

Get a single task by ID.

**Response:**

```json
{
  "id": "clxxx",
  "title": "Review PR #123",
  ...
}
```

### PUT /api/tasks/:id

Update a task.

**Request Body:** (all fields optional)

```json
{
  "title": "Updated title",
  "status": "done",
  "priority": "medium"
}
```

**Response:**

```json
{
  "id": "clxxx",
  "title": "Updated title",
  ...
}
```

### DELETE /api/tasks/:id

Delete a task.

**Response:**

```json
{
  "success": true
}
```

### POST /api/tasks/parse

Parse natural language into task data using AI.

**Request Body:**

```json
{
  "prompt": "Add task: review PR #123, high priority, due tomorrow"
}
```

**Response:**

```json
{
  "title": "Review PR #123",
  "description": null,
  "priority": "high",
  "dueDate": "2026-02-18",
  "tags": ["pr", "review"],
  "assignedTo": null,
  "projectId": null
}
```

---

## Approvals

### GET /api/approvals

List all approval requests.

**Query Parameters:**
- `status` (string): Filter by status (pending, approved, denied)

**Response:**

```json
[
  {
    "id": "clxxx",
    "title": "Delete old backup files",
    "description": "Delete 3 files in ~/backups/",
    "status": "pending",
    "requestedBy": "clawdbot",
    "requestedAt": "2026-02-17T10:00:00.000Z",
    "respondedAt": null,
    "response": null,
    "notes": null,
    "metadata": "{\"action\":\"delete\",\"files\":[...],\"reasoning\":\"...\"}",
    "createdAt": "2026-02-17T10:00:00.000Z",
    "updatedAt": "2026-02-17T10:00:00.000Z"
  }
]
```

### POST /api/approvals

Create an approval request.

**Request Body:**

```json
{
  "title": "Delete old backup files",
  "description": "Delete 3 files in ~/backups/",
  "requestedBy": "clawdbot",
  "metadata": {
    "action": "delete",
    "files": ["file1.db", "file2.db", "file3.db"],
    "totalSize": "450MB",
    "reasoning": "Files are older than 90 days and no longer needed"
  }
}
```

**Response:** 201 Created

### GET /api/approvals/:id

Get single approval request.

### PUT /api/approvals/:id

Respond to an approval request.

**Request Body:**

```json
{
  "status": "approved",
  "response": "approved",
  "notes": "Looks good, proceed with deletion"
}
```

**Response:**

```json
{
  "id": "clxxx",
  "status": "approved",
  "respondedAt": "2026-02-17T11:00:00.000Z",
  ...
}
```

### DELETE /api/approvals/:id

Delete an approval request.

---

## Calendar

### GET /api/events

List calendar events.

**Query Parameters:**
- `from` (ISO date): Start date
- `to` (ISO date): End date

**Response:**

```json
[
  {
    "id": "clxxx",
    "title": "Team Meeting",
    "description": "Weekly standup",
    "startTime": "2026-02-18T14:00:00.000Z",
    "endTime": "2026-02-18T15:00:00.000Z",
    "location": "Zoom",
    "attendees": "[\"john@example.com\", \"jane@example.com\"]",
    "googleEventId": "abc123",
    "createdAt": "2026-02-17T10:00:00.000Z",
    "updatedAt": "2026-02-17T10:00:00.000Z"
  }
]
```

### POST /api/events

Create a calendar event.

**Request Body:**

```json
{
  "title": "Team Meeting",
  "description": "Weekly standup",
  "startTime": "2026-02-18T14:00:00.000Z",
  "endTime": "2026-02-18T15:00:00.000Z",
  "location": "Zoom",
  "attendees": ["john@example.com", "jane@example.com"]
}
```

**Response:** 201 Created

### POST /api/calendar/parse

Parse natural language into event data using AI.

**Request Body:**

```json
{
  "prompt": "Schedule meeting with John tomorrow 2pm for 1 hour"
}
```

**Response:**

```json
{
  "title": "Meeting with John",
  "description": null,
  "startTime": "2026-02-18T14:00:00.000Z",
  "endTime": "2026-02-18T15:00:00.000Z",
  "location": null,
  "attendees": ["john"]
}
```

---

## GitHub

### GET /api/github/repos

List GitHub repositories.

**Query Parameters:**
- `detailed` (boolean): Include issues, PRs, commits, contributors (default: false)

**Response:**

```json
[
  {
    "name": "mission-control",
    "description": "AI-powered productivity dashboard",
    "url": "https://github.com/user/mission-control",
    "stargazerCount": 12,
    "forkCount": 3,
    "primaryLanguage": "TypeScript",
    "pushedAt": "2026-02-17T10:00:00.000Z",
    "isPrivate": false,
    "issues": [...],  // if detailed=true
    "prs": [...],     // if detailed=true
    "commits": [...], // if detailed=true
    "contributors": [...] // if detailed=true
  }
]
```

---

## Projects

### GET /api/projects

List all projects.

**Response:**

```json
[
  {
    "id": "clxxx",
    "name": "Mission Control",
    "description": "Productivity dashboard",
    "status": "active",
    "progress": 75,
    "startDate": "2026-02-01T00:00:00.000Z",
    "endDate": null,
    "docs": "# Project docs\n\n...",
    "createdAt": "2026-02-01T10:00:00.000Z",
    "updatedAt": "2026-02-17T11:00:00.000Z"
  }
]
```

### POST /api/projects

Create a project.

### GET /api/projects/:id

Get single project.

### PUT /api/projects/:id

Update a project.

### DELETE /api/projects/:id

Delete a project.

---

## People

### GET /api/people

List contacts.

**Response:**

```json
[
  {
    "id": "clxxx",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "tags": "[\"client\", \"vip\"]",
    "socialLinks": "{\"linkedin\":\"https://...\"}",
    "notes": "Met at conference",
    "interactionHistory": "[{...}]",
    "lastContact": "2026-02-15T10:00:00.000Z",
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-02-17T11:00:00.000Z"
  }
]
```

### POST /api/people

Create a contact.

### GET /api/people/:id

Get single contact.

### PUT /api/people/:id

Update a contact.

### DELETE /api/people/:id

Delete a contact.

---

## Error Responses

All endpoints may return:

**400 Bad Request**

```json
{
  "error": "Invalid request body"
}
```

**404 Not Found**

```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error**

```json
{
  "error": "Failed to process request"
}
```

---

## Rate Limiting

Currently no rate limiting (local app). For production, consider:

- API gateway (Vercel, Cloudflare)
- Redis-based rate limiter
- Per-user quotas

---

## Webhooks

Not currently supported. Future plans:

- GitHub webhooks for repo updates
- Google Calendar webhooks for event changes
- Slack/Discord notifications

---

## SDK / Client Libraries

Use fetch or any HTTP client:

```typescript
// TypeScript example
const tasks = await fetch('/api/tasks').then(r => r.json())

const newTask = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New task',
    priority: 'high'
  })
}).then(r => r.json())
```

---

## Versioning

Current version: v1 (implicit, no version in URL)

Future breaking changes will use `/api/v2/...`
