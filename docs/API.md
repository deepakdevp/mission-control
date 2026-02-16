# API Documentation

All endpoints return JSON.

## Tasks

### List Tasks
```
GET /api/tasks
```

Response:
```json
[
  {
    "id": "task-1",
    "title": "Task title",
    "status": "todo",
    "priority": "medium",
    "tags": []
  }
]
```

### Create Task
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Task title",
  "status": "todo",
  "priority": "medium",
  "tags": []
}
```

### Update Task
```
PUT /api/tasks/:id
Content-Type: application/json

{
  "status": "done"
}
```

### Delete Task
```
DELETE /api/tasks/:id
```

## Approvals

### List Approvals
```
GET /api/approvals
```

### Create Approval
```
POST /api/approvals
Content-Type: application/json

{
  "type": "deployment",
  "request": "Deploy to production?",
  "status": "pending"
}
```

## Projects

### List Projects
```
GET /api/projects
```

### Create Project
```
POST /api/projects
Content-Type: application/json

{
  "name": "Project name",
  "description": "Project description",
  "status": "active",
  "tasks": [],
  "tags": []
}
```

## People

### List People
```
GET /api/people
```

### Create Person
```
POST /api/people
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "tags": []
}
```

## Cron

### List Cron Jobs
```
GET /api/cron
```

### Create Cron Job
```
POST /api/cron
Content-Type: application/json

{
  "name": "Daily backup",
  "schedule": "0 2 * * *",
  "command": "node scripts/backup.js",
  "enabled": true
}
```

## Real-time Updates

Connect to Server-Sent Events endpoint for live updates:

```javascript
const eventSource = new EventSource('/api/events');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('File changed:', data);
};
```
