# Setup Guide

## Prerequisites

- Node.js 20+
- A Clawdbot workspace (e.g., `~/clawd`)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mission-control
   cd mission-control
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create symlink to your Clawdbot workspace:
   ```bash
   ln -s ~/clawd clawd
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Production Deployment

### Using PM2

```bash
npm run build
pm2 start npm --name "mission-control" -- start
pm2 save
```

### Using Docker

```bash
docker build -t mission-control .
docker run -p 3000:3000 -v ~/clawd:/app/clawd mission-control
```

## Configuration

Create `.env.local` for personal settings:

```bash
# Optional: API key for Clawdbot integration
CLAWDBOT_API_KEY=your-key-here
```
