# Nerve Center Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a real-time monitoring dashboard for the AI agent that displays thought streams, API costs, system vitals, and allows editing SOUL.md/MEMORY.md files.

**Architecture:** Next.js API routes proxy to OpenClaw Gateway (localhost:18789) for agent data, execute shell commands for system metrics, and provide file I/O for configuration editing. Frontend uses React components with Framer Motion animations, polling-based updates, and dark "command center" theme.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion, shadcn/ui

**Design Reference:** `docs/plans/2026-02-18-nerve-center-design.md`

---

## Phase 1: API Infrastructure

### Task 1: Gateway Client Library

**Files:**
- Create: `lib/gateway-client.ts`

**Step 1: Create gateway client helper**

```typescript
// lib/gateway-client.ts
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:18789';

export async function fetchGatewaySessions() {
  const res = await fetch(`${GATEWAY_URL}/api/sessions/list`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Gateway unreachable');
  return res.json();
}

export async function fetchGatewayStatus() {
  const res = await fetch(`${GATEWAY_URL}/api/status`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Gateway unreachable');
  return res.json();
}

export async function restartGateway() {
  const res = await fetch('/api/gateway/restart', {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Restart failed');
  return res.json();
}
```

**Step 2: Commit**

```bash
git add lib/gateway-client.ts
git commit -m "feat(api): add gateway client helper functions"
```

---

### Task 2: Gateway Sessions API Route

**Files:**
- Create: `app/api/gateway/sessions/route.ts`

**Step 1: Create sessions proxy route**

```typescript
// app/api/gateway/sessions/route.ts
import { NextResponse } from 'next/server';

const GATEWAY_URL = 'http://localhost:18789';

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/sessions/list`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Gateway unreachable' },
        { status: 502 }
      );
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
```

**Step 2: Test manually**

```bash
npm run dev
# In another terminal:
curl http://localhost:3000/api/gateway/sessions
```

Expected: JSON response with session data or error

**Step 3: Commit**

```bash
git add app/api/gateway/sessions/route.ts
git commit -m "feat(api): add gateway sessions proxy route"
```

---

### Task 3: Gateway Status API Route

**Files:**
- Create: `app/api/gateway/status/route.ts`

**Step 1: Create status proxy route**

```typescript
// app/api/gateway/status/route.ts
import { NextResponse } from 'next/server';

const GATEWAY_URL = 'http://localhost:18789';

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/status`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Gateway unreachable' },
        { status: 502 }
      );
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
```

**Step 2: Test manually**

```bash
curl http://localhost:3000/api/gateway/status
```

Expected: JSON with token usage and model info

**Step 3: Commit**

```bash
git add app/api/gateway/status/route.ts
git commit -m "feat(api): add gateway status proxy route"
```

---

### Task 4: Gateway Restart API Route

**Files:**
- Create: `app/api/gateway/restart/route.ts`

**Step 1: Create restart route**

```typescript
// app/api/gateway/restart/route.ts
import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST() {
  try {
    execSync('clawdbot gateway restart', {
      stdio: 'pipe',
      timeout: 5000,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Gateway restart initiated',
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to restart gateway', details: String(error) },
      { status: 500 }
    );
  }
}
```

**Step 2: Test manually (CAREFUL - restarts gateway)**

```bash
curl -X POST http://localhost:3000/api/gateway/restart
```

Expected: Success message and gateway restarts

**Step 3: Commit**

```bash
git add app/api/gateway/restart/route.ts
git commit -m "feat(api): add gateway restart endpoint"
```

---

### Task 5: System Vitals API Route

**Files:**
- Create: `app/api/system/route.ts`

**Step 1: Create system vitals route**

```typescript
// app/api/system/route.ts
import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

function getCPU(): number {
  try {
    const output = execSync('top -l 1 | grep "CPU usage"', { encoding: 'utf-8' });
    const match = output.match(/(\d+\.\d+)% user/);
    return match ? parseFloat(match[1]) : 0;
  } catch {
    return 0;
  }
}

function getRAM(): number {
  try {
    const output = execSync('vm_stat', { encoding: 'utf-8' });
    const pageSize = 4096;
    const active = output.match(/Pages active:\s+(\d+)/)?.[1];
    const wired = output.match(/Pages wired down:\s+(\d+)/)?.[1];
    const free = output.match(/Pages free:\s+(\d+)/)?.[1];
    
    if (!active || !wired || !free) return 0;
    
    const totalPages = parseInt(active) + parseInt(wired) + parseInt(free);
    const usedPages = parseInt(active) + parseInt(wired);
    return (usedPages / totalPages) * 100;
  } catch {
    return 0;
  }
}

function getDisk(): number {
  try {
    const output = execSync('df -h / | awk \'NR==2 {print $5}\'', { encoding: 'utf-8' });
    return parseFloat(output.replace('%', ''));
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const data = {
      cpu: getCPU(),
      ram: getRAM(),
      disk: getDisk(),
      timestamp: Date.now(),
    };
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch system vitals', details: String(error) },
      { status: 500 }
    );
  }
}
```

**Step 2: Test manually**

```bash
curl http://localhost:3000/api/system
```

Expected: `{ cpu: 45.2, ram: 62.8, disk: 73.1, timestamp: ... }`

**Step 3: Commit**

```bash
git add app/api/system/route.ts
git commit -m "feat(api): add system vitals endpoint with CPU/RAM/disk"
```

---

### Task 6: File Operations API Route

**Files:**
- Create: `app/api/files/route.ts`

**Step 1: Create file read/write route**

```typescript
// app/api/files/route.ts
import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const BASE_DIR = '/Users/deepak.panwar/clawd';
const ALLOWED_FILES = ['SOUL.md', 'MEMORY.md'];

function validatePath(path: string): boolean {
  return ALLOWED_FILES.includes(path) && !path.includes('../') && !path.startsWith('/');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  
  if (!path || !validatePath(path)) {
    return NextResponse.json(
      { error: 'Invalid file path' },
      { status: 400 }
    );
  }
  
  try {
    const filePath = join(BASE_DIR, path);
    const content = await readFile(filePath, 'utf-8');
    return NextResponse.json({ path, content });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read file', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { path, content } = body;
  
  if (!path || !validatePath(path)) {
    return NextResponse.json(
      { error: 'Invalid file path' },
      { status: 400 }
    );
  }
  
  if (typeof content !== 'string') {
    return NextResponse.json(
      { error: 'Content must be a string' },
      { status: 400 }
    );
  }
  
  try {
    const filePath = join(BASE_DIR, path);
    await writeFile(filePath, content, 'utf-8');
    return NextResponse.json({
      success: true,
      path,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to write file', details: String(error) },
      { status: 500 }
    );
  }
}
```

**Step 2: Test manually**

```bash
# Test read
curl "http://localhost:3000/api/files?path=SOUL.md"

# Test write (be careful!)
curl -X POST http://localhost:3000/api/files \
  -H "Content-Type: application/json" \
  -d '{"path":"SOUL.md","content":"# Test"}'
```

Expected: Read returns file content, write returns success

**Step 3: Commit**

```bash
git add app/api/files/route.ts
git commit -m "feat(api): add file read/write endpoint for SOUL.md and MEMORY.md"
```

---

## Phase 2: Components

### Task 7: Thought Stream Component

**Files:**
- Create: `components/nerve-center/thought-stream.tsx`

**Step 1: Create component with polling logic**

```typescript
// components/nerve-center/thought-stream.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: number;
}

export function ThoughtStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/gateway/sessions');
        const data = await res.json();
        
        // Parse session data into messages
        // TODO: Implement actual parsing based on Gateway API response
        const parsed: Message[] = [];
        setMessages(parsed);
        
        // Check if thinking (last message is user with no assistant reply)
        const lastMsg = parsed[parsed.length - 1];
        setIsThinking(lastMsg?.role === 'user');
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const getMessageColor = (role: string) => {
    switch (role) {
      case 'user': return 'bg-emerald-500/10 border-emerald-500/50';
      case 'assistant': return 'bg-purple-500/10 border-purple-500/50';
      case 'tool': return 'bg-amber-500/10 border-amber-500/50';
      default: return 'bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <div className="h-[60vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-zinc-800/50 border-b border-zinc-700">
        <h3 className="text-sm font-semibold text-zinc-100">Live Thought Stream</h3>
      </div>
      
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 border rounded-lg ${getMessageColor(msg.role)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-zinc-400">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-xs font-medium text-zinc-300 uppercase">
                {msg.role}
              </span>
            </div>
            <p className="text-sm font-mono text-zinc-100">{msg.content}</p>
          </motion.div>
        ))}
        
        {isThinking && (
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="p-3 border border-purple-500/50 bg-purple-500/10 rounded-lg"
          >
            <p className="text-sm font-mono text-purple-300">Thinking...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Test in isolation**

Create test page at `app/test-stream/page.tsx`:

```typescript
import { ThoughtStream } from '@/components/nerve-center/thought-stream';

export default function TestPage() {
  return (
    <div className="p-8 bg-zinc-950 min-h-screen">
      <ThoughtStream />
    </div>
  );
}
```

Visit: http://localhost:3000/test-stream

**Step 3: Commit**

```bash
git add components/nerve-center/thought-stream.tsx app/test-stream/page.tsx
git commit -m "feat(component): add thought stream with polling and animations"
```

---

### Task 8: API Fuel Gauge Component

**Files:**
- Create: `components/nerve-center/api-fuel-gauge.tsx`

**Step 1: Create circular gauge component**

```typescript
// components/nerve-center/api-fuel-gauge.tsx
'use client';

import { useEffect, useState } from 'react';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
}

function CircularGauge({ value, max, label, unit }: GaugeProps) {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 54; // radius = 54
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isWarning = percentage > 80;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="120" height="120" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#27272a"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={isWarning ? '#f59e0b' : 'url(#gradient)'}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-zinc-100">
          {value.toLocaleString()}
        </span>
        <span className="text-xs text-zinc-400">{unit}</span>
      </div>
      
      <p className="mt-3 text-sm font-medium text-zinc-300">{label}</p>
      <p className="text-xs text-zinc-500">of {max.toLocaleString()}</p>
    </div>
  );
}

export function APIFuelGauge() {
  const [tokens, setTokens] = useState(0);
  const [cost, setCost] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/gateway/status');
        const data = await res.json();
        
        // TODO: Parse actual token usage from Gateway response
        const tokenUsage = data.tokens || 0;
        const estimatedCost = (tokenUsage / 1000) * 0.003; // Claude Sonnet pricing
        
        setTokens(tokenUsage);
        setCost(estimatedCost);
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-zinc-100 mb-6">API Fuel Gauges</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <CircularGauge
          value={tokens}
          max={100000}
          label="Token Usage"
          unit="tokens"
        />
        <CircularGauge
          value={cost}
          max={10}
          label="Estimated Cost"
          unit="USD"
        />
      </div>
    </div>
  );
}
```

**Step 2: Test in isolation**

Add to `app/test-stream/page.tsx`:

```typescript
import { APIFuelGauge } from '@/components/nerve-center/api-fuel-gauge';

<APIFuelGauge />
```

**Step 3: Commit**

```bash
git add components/nerve-center/api-fuel-gauge.tsx
git commit -m "feat(component): add API fuel gauge with circular progress indicators"
```

---

### Task 9: System Vitals Sparklines Component

**Files:**
- Create: `components/nerve-center/system-vitals.tsx`

**Step 1: Create sparkline component with canvas**

```typescript
// components/nerve-center/system-vitals.tsx
'use client';

import { useEffect, useState, useRef } from 'react';

interface VitalData {
  cpu: number;
  ram: number;
  disk: number;
  timestamp: number;
}

interface SparklineProps {
  data: number[];
  label: string;
  current: number;
  color: string;
}

function Sparkline({ data, label, current, color }: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const max = Math.max(...data, 100);
    const xStep = width / (data.length - 1);

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((value, i) => {
      const x = i * xStep;
      const y = height - (value / max) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [data, color]);

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-zinc-400">{label}</h4>
        <span className="text-2xl font-bold text-zinc-100">
          {current.toFixed(1)}%
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={200}
        height={60}
        className="w-full"
      />
    </div>
  );
}

export function SystemVitals() {
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(60).fill(0));
  const [ramHistory, setRamHistory] = useState<number[]>(Array(60).fill(0));
  const [diskHistory, setDiskHistory] = useState<number[]>(Array(60).fill(0));
  const [current, setCurrent] = useState<VitalData>({ cpu: 0, ram: 0, disk: 0, timestamp: 0 });

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const res = await fetch('/api/system');
        const data: VitalData = await res.json();
        
        setCurrent(data);
        setCpuHistory(prev => [...prev.slice(1), data.cpu]);
        setRamHistory(prev => [...prev.slice(1), data.ram]);
        setDiskHistory(prev => [...prev.slice(1), data.disk]);
      } catch (error) {
        console.error('Failed to fetch vitals:', error);
      }
    };

    fetchVitals();
    const interval = setInterval(fetchVitals, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-zinc-100 mb-4">System Vitals</h3>
      
      <div className="space-y-4">
        <Sparkline
          data={cpuHistory}
          label="CPU Load"
          current={current.cpu}
          color="#06b6d4"
        />
        <Sparkline
          data={ramHistory}
          label="RAM Usage"
          current={current.ram}
          color="#a855f7"
        />
        <Sparkline
          data={diskHistory}
          label="Disk Space"
          current={current.disk}
          color="#10b981"
        />
      </div>
    </div>
  );
}
```

**Step 2: Test in isolation**

Add to test page.

**Step 3: Commit**

```bash
git add components/nerve-center/system-vitals.tsx
git commit -m "feat(component): add system vitals with sparkline charts"
```

---

### Task 10: Soul & Memory Editor Component

**Files:**
- Create: `components/nerve-center/soul-memory-editor.tsx`

**Step 1: Create tabbed editor with save/restart**

```typescript
// components/nerve-center/soul-memory-editor.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type FileType = 'SOUL.md' | 'MEMORY.md';

export function SoulMemoryEditor() {
  const [activeTab, setActiveTab] = useState<FileType>('SOUL.md');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    loadFile(activeTab);
  }, [activeTab]);

  useEffect(() => {
    setIsDirty(content !== originalContent);
  }, [content, originalContent]);

  const loadFile = async (path: FileType) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/files?path=${path}`);
      const data = await res.json();
      setContent(data.content);
      setOriginalContent(data.content);
    } catch (error) {
      toast.error(`Failed to load ${path}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: activeTab, content }),
      });
      
      if (!res.ok) throw new Error('Save failed');
      
      setOriginalContent(content);
      toast.success(`${activeTab} saved successfully`);
    } catch (error) {
      toast.error(`Failed to save ${activeTab}`);
    } finally {
      setIsLoading(false);
    }
  };

  const restartGateway = async () => {
    if (!confirm('Restart Gateway? This will reload all configuration.')) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/gateway/restart', { method: 'POST' });
      if (!res.ok) throw new Error('Restart failed');
      
      toast.success('Gateway restart initiated. Check back in 10 seconds.');
    } catch (error) {
      toast.error('Failed to restart Gateway');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-[60vh]">
      {/* Tab Bar */}
      <div className="flex bg-zinc-800/50 border-b border-zinc-700">
        <button
          onClick={() => setActiveTab('SOUL.md')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'SOUL.md'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          SOUL.md {activeTab === 'SOUL.md' && isDirty && '*'}
        </button>
        <button
          onClick={() => setActiveTab('MEMORY.md')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'MEMORY.md'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          MEMORY.md {activeTab === 'MEMORY.md' && isDirty && '*'}
        </button>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isLoading}
        className="flex-1 p-4 bg-zinc-900 text-zinc-100 font-mono text-sm resize-none focus:outline-none"
        placeholder={`Edit ${activeTab}...`}
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-zinc-800/50 border-t border-zinc-700">
        <div className="text-xs text-zinc-400">
          {isDirty && 'Unsaved changes'}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={saveFile}
            disabled={!isDirty || isLoading}
            className="bg-cyan-600 hover:bg-cyan-500"
          >
            Save
          </Button>
          <Button
            onClick={restartGateway}
            disabled={isLoading}
            variant="outline"
            className="border-amber-600 text-amber-400 hover:bg-amber-600/10"
          >
            Restart Gateway
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Test in isolation**

**Step 3: Commit**

```bash
git add components/nerve-center/soul-memory-editor.tsx
git commit -m "feat(component): add soul/memory editor with save and restart"
```

---

### Task 11: HITL Queue Component (Placeholder)

**Files:**
- Create: `components/nerve-center/hitl-queue.tsx`

**Step 1: Create placeholder component**

```typescript
// components/nerve-center/hitl-queue.tsx
'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface HITLRequest {
  id: string;
  task: string;
  requester: string;
  timestamp: number;
}

export function HITLQueue() {
  // Placeholder: In future, fetch from Gateway HITL endpoint
  const requests: HITLRequest[] = [];

  const handleApprove = (id: string) => {
    // TODO: POST to /api/gateway/hitl with approval
    console.log('Approved:', id);
  };

  const handleDeny = (id: string) => {
    // TODO: POST to /api/gateway/hitl with denial
    console.log('Denied:', id);
  };

  if (requests.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
        <p className="text-zinc-400 text-sm">No pending approvals 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-zinc-100 mb-4">Pending Approvals</h3>
      
      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm text-zinc-100 mb-1">{req.task}</p>
                <p className="text-xs text-zinc-500">
                  {req.requester} • {new Date(req.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => handleApprove(req.id)}
                className="bg-green-600 hover:bg-green-500"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeny(req.id)}
                className="border-red-600 text-red-400 hover:bg-red-600/10"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Deny
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/nerve-center/hitl-queue.tsx
git commit -m "feat(component): add HITL queue placeholder component"
```

---

## Phase 3: Main Dashboard Page

### Task 12: Nerve Center Page Layout

**Files:**
- Create: `app/nerve-center/page.tsx`

**Step 1: Create main dashboard page**

```typescript
// app/nerve-center/page.tsx
import { ThoughtStream } from '@/components/nerve-center/thought-stream';
import { APIFuelGauge } from '@/components/nerve-center/api-fuel-gauge';
import { SystemVitals } from '@/components/nerve-center/system-vitals';
import { SoulMemoryEditor } from '@/components/nerve-center/soul-memory-editor';
import { HITLQueue } from '@/components/nerve-center/hitl-queue';

export default function NerveCenterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            Nerve Center
          </h1>
          <p className="text-zinc-400 text-sm">
            Real-time monitoring of AI agent activity and system health
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <ThoughtStream />
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1 space-y-6">
            <APIFuelGauge />
            <SystemVitals />
            <HITLQueue />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <SoulMemoryEditor />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add to navigation**

Edit `components/navigation.tsx`:

```typescript
// Add to navigation items
{
  name: 'Nerve Center',
  href: '/nerve-center',
  icon: Activity, // Import from lucide-react
}
```

**Step 3: Test full page**

Visit: http://localhost:3000/nerve-center

**Step 4: Commit**

```bash
git add app/nerve-center/page.tsx components/navigation.tsx
git commit -m "feat(page): add nerve center dashboard with all components"
```

---

## Phase 4: Polish & Testing

### Task 13: Add Loading States

**Files:**
- Modify: `components/nerve-center/thought-stream.tsx`
- Modify: `components/nerve-center/api-fuel-gauge.tsx`
- Modify: `components/nerve-center/system-vitals.tsx`

**Step 1: Add loading spinners to each component**

Add to each component:

```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent" />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/nerve-center/
git commit -m "feat(polish): add loading states to all components"
```

---

### Task 14: Error Handling & Retry Logic

**Files:**
- Modify: All component files

**Step 1: Add error boundaries**

Create `components/nerve-center/error-boundary.tsx`:

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-red-400 p-4 text-sm">
          Something went wrong. Refresh to retry.
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 2: Wrap components in error boundaries**

Update `app/nerve-center/page.tsx`:

```typescript
<ErrorBoundary>
  <ThoughtStream />
</ErrorBoundary>
```

**Step 3: Commit**

```bash
git add components/nerve-center/error-boundary.tsx app/nerve-center/page.tsx
git commit -m "feat(polish): add error boundaries for graceful failures"
```

---

### Task 15: Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/NERVE_CENTER.md`

**Step 1: Create Nerve Center docs**

```markdown
# Nerve Center Dashboard

Real-time monitoring dashboard for AI agent activity, API costs, and system health.

## Features

1. **Live Thought Stream** - See agent messages and tool executions in real-time
2. **API Fuel Gauges** - Track token usage and estimated costs
3. **System Vitals** - Monitor CPU, RAM, and disk usage with sparklines
4. **Soul & Memory Editor** - Edit SOUL.md and MEMORY.md with hot-reload
5. **HITL Queue** - Approve/deny pending agent requests (coming soon)

## Access

Navigate to: http://localhost:3000/nerve-center

## Requirements

- OpenClaw Gateway running on localhost:18789
- Clawdbot CLI installed and configured
- macOS (for system vitals shell commands)

## API Endpoints

- GET `/api/gateway/sessions` - Fetch agent session messages
- GET `/api/gateway/status` - Fetch token usage and status
- POST `/api/gateway/restart` - Restart Gateway process
- GET `/api/system` - Fetch CPU/RAM/disk vitals
- GET/POST `/api/files` - Read/write SOUL.md and MEMORY.md

## Future Enhancements

- WebSocket support for real-time updates
- Historical data storage
- Custom alerts and notifications
- Multi-agent monitoring
- Export logs to JSON/CSV
```

**Step 2: Update main README**

Add section:

```markdown
## Nerve Center Dashboard

Monitor your AI agent in real-time. See the [Nerve Center docs](docs/NERVE_CENTER.md) for details.

Access at: http://localhost:3000/nerve-center
```

**Step 3: Commit**

```bash
git add README.md docs/NERVE_CENTER.md
git commit -m "docs: add Nerve Center dashboard documentation"
```

---

## Final Steps

### Task 16: Clean Up Test Files

**Files:**
- Delete: `app/test-stream/page.tsx`

**Step 1: Remove test page**

```bash
rm -rf app/test-stream
git add -A
git commit -m "chore: remove test files"
```

---

### Task 17: Build & Verify

**Step 1: Run build**

```bash
npm run build
```

Expected: No TypeScript errors, build succeeds

**Step 2: Run production server**

```bash
npm run start
```

Visit: http://localhost:3000/nerve-center

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete Nerve Center dashboard implementation"
```

---

## Testing Checklist

- [ ] Thought stream displays messages
- [ ] Thought stream polls every 3 seconds
- [ ] API gauges show token usage
- [ ] API gauges show cost estimate
- [ ] System vitals display CPU/RAM/disk
- [ ] Sparklines update every 5 seconds
- [ ] SOUL.md loads in editor
- [ ] MEMORY.md loads in editor
- [ ] Save button works
- [ ] Restart Gateway button works
- [ ] HITL queue shows empty state
- [ ] All animations smooth (60fps)
- [ ] Error states handled gracefully
- [ ] Loading states display correctly
- [ ] Dark theme matches design spec

---

## Success Criteria

✅ All 5 components functional  
✅ Real-time polling working  
✅ File editing with save/restart  
✅ Dark "command center" aesthetic  
✅ No TypeScript errors  
✅ Responsive layout  
✅ Error handling complete  
✅ Documentation complete

---

**Total Tasks:** 17  
**Estimated Time:** 3-4 hours  
**Dependencies:** OpenClaw Gateway running on localhost:18789
