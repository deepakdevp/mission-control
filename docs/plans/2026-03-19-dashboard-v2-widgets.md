# Dashboard V2 - Core Widgets Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add essential widgets (System Monitor, Weather, Theme Controls) to the new grid-based dashboard to match community standards for self-hosted dashboards.

**Architecture:** Build modular widget components using shadcn/ui primitives, integrate with react-grid-layout, implement real-time data fetching patterns, and add persistent theme storage.

**Tech Stack:** Next.js 16, React 19, TypeScript, shadcn/ui, react-grid-layout, systeminformation (for system stats), OpenWeather API (for weather)

---

## Task 1: System Monitoring Widget

**Files:**
- Create: `components/widgets/system-monitor.tsx`
- Create: `app/api/system-stats/route.ts`
- Modify: `app/page.tsx` (add widget to grid)

**Step 1: Install systeminformation library**

```bash
npm install systeminformation
npm install --save-dev @types/systeminformation
```

**Step 2: Create system stats API endpoint**

Create `app/api/system-stats/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import si from 'systeminformation';

export async function GET() {
  try {
    const [cpu, mem, disk] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize()
    ]);

    const stats = {
      cpu: cpu.currentLoad.toFixed(1),
      memory: {
        used: (mem.used / 1024 / 1024 / 1024).toFixed(2),
        total: (mem.total / 1024 / 1024 / 1024).toFixed(2),
        percentage: ((mem.used / mem.total) * 100).toFixed(1)
      },
      disk: {
        used: (disk[0].used / 1024 / 1024 / 1024).toFixed(2),
        total: (disk[0].size / 1024 / 1024 / 1024).toFixed(2),
        percentage: disk[0].use.toFixed(1)
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch system stats' }, { status: 500 });
  }
}
```

**Step 3: Test API endpoint**

Run dev server and test:
```bash
curl http://localhost:3001/api/system-stats
```
Expected: JSON with cpu, memory, disk data

**Step 4: Create SystemMonitor widget component**

Create `components/widgets/system-monitor.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SystemStats {
  cpu: string;
  memory: { used: string; total: string; percentage: string };
  disk: { used: string; total: string; percentage: string };
}

export function SystemMonitor() {
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/system-stats');
      const data = await res.json();
      setStats(data);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000); // Update every 3s

    return () => clearInterval(interval);
  }, []);

  if (!stats) return <Card className="h-full"><CardContent className="pt-6">Loading...</CardContent></Card>;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium text-gray-500">System Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>CPU</span>
            <span className="font-semibold">{stats.cpu}%</span>
          </div>
          <Progress value={parseFloat(stats.cpu)} />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Memory</span>
            <span className="font-semibold">{stats.memory.used}GB / {stats.memory.total}GB</span>
          </div>
          <Progress value={parseFloat(stats.memory.percentage)} />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Disk</span>
            <span className="font-semibold">{stats.disk.used}GB / {stats.disk.total}GB</span>
          </div>
          <Progress value={parseFloat(stats.disk.percentage)} />
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 5: Add Progress component from shadcn**

```bash
npx shadcn@latest add progress
```

**Step 6: Add widget to dashboard grid**

Modify `app/page.tsx`, import widget and add to layouts:

```typescript
import { SystemMonitor } from '@/components/widgets/system-monitor';

// In layouts state, add:
{ i: 'system-monitor', x: 0, y: 1, w: 2, h: 1 }

// In ResponsiveGridLayout children, add:
<div key="system-monitor">
  <SystemMonitor />
</div>
```

**Step 7: Test the widget**

Run: `npm run dev`
Expected: System monitor widget appears on dashboard with live stats updating every 3s

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add system monitoring widget with CPU/RAM/Disk stats"
```

---

## Task 2: Weather Widget

**Files:**
- Create: `components/widgets/weather.tsx`
- Create: `app/api/weather/route.ts`
- Create: `.env.local` (add OpenWeather API key)
- Modify: `app/page.tsx` (add widget to grid)

**Step 1: Get OpenWeather API key**

1. Sign up at https://openweathermap.org/api
2. Get free API key
3. Add to `.env.local`:

```bash
OPENWEATHER_API_KEY=your_api_key_here
```

**Step 2: Create weather API endpoint**

Create `app/api/weather/route.ts`:

```typescript
import { NextResponse } from 'next/server';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = 'Tokyo'; // Make configurable later

export async function GET() {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`
    );
    
    if (!res.ok) throw new Error('Weather API failed');
    
    const data = await res.json();
    
    const weather = {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      city: data.name
    };

    return NextResponse.json(weather);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
```

**Step 3: Test API endpoint**

```bash
curl http://localhost:3001/api/weather
```
Expected: JSON with weather data for Tokyo

**Step 4: Create Weather widget component**

Create `components/widgets/weather.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Cloud, Droplets } from 'lucide-react';

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  city: string;
}

export function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const res = await fetch('/api/weather');
      const data = await res.json();
      setWeather(data);
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 min

    return () => clearInterval(interval);
  }, []);

  if (!weather) return <Card className="h-full"><CardContent className="pt-6">Loading...</CardContent></Card>;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium text-gray-500 flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          {weather.city}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold">{weather.temp}°C</div>
            <div className="text-sm text-gray-500 capitalize">{weather.description}</div>
            <div className="text-xs text-gray-400 mt-1">Feels like {weather.feelsLike}°C</div>
          </div>
          <div className="text-right">
            <img 
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.condition}
              className="w-16 h-16"
            />
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Droplets className="w-3 h-3" />
              {weather.humidity}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 5: Add widget to dashboard grid**

Modify `app/page.tsx`:

```typescript
import { Weather } from '@/components/widgets/weather';

// In layouts state, add:
{ i: 'weather', x: 2, y: 1, w: 2, h: 1 }

// In ResponsiveGridLayout children, add:
<div key="weather">
  <Weather />
</div>
```

**Step 6: Test the widget**

Run: `npm run dev`
Expected: Weather widget shows current weather for Tokyo with icon and humidity

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add weather widget with OpenWeather API integration"
```

---

## Task 3: Theme Customization Controls

**Files:**
- Create: `components/theme-toggle.tsx`
- Create: `lib/use-theme.ts`
- Modify: `app/layout.tsx` (add theme provider)
- Modify: `app/page.tsx` (add theme toggle button)

**Step 1: Install next-themes**

```bash
npm install next-themes
```

**Step 2: Create theme toggle component**

Create `components/theme-toggle.tsx`:

```typescript
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

**Step 3: Add Button component from shadcn**

```bash
npx shadcn@latest add button
```

**Step 4: Update layout with theme provider**

Modify `app/layout.tsx`:

```typescript
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 5: Add dark mode styles to globals.css**

Modify `app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... other light theme vars */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... other dark theme vars */
  }
}
```

**Step 6: Add theme toggle to dashboard header**

Modify `app/page.tsx`:

```typescript
import { ThemeToggle } from '@/components/theme-toggle';

// In the header div:
<div className="h-14 px-6 flex items-center justify-between">
  <h1 className="text-[28px] font-bold text-[#1A1A2E] leading-none">Dashboard</h1>
  <ThemeToggle />
</div>
```

**Step 7: Test theme toggle**

Run: `npm run dev`
Expected: Sun/moon icon in header, clicking toggles between light/dark themes

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add theme customization with light/dark mode toggle"
```

---

## Final Steps

**Step 1: Update dashboard grid styles**

Add react-grid-layout CSS to `app/globals.css`:

```css
@import 'react-grid-layout/css/styles.css';
@import 'react-grid-layout/css/styles.css';
```

**Step 2: Test full dashboard**

Run: `npm run dev`
Verify:
- All widgets render correctly
- Drag-and-drop works
- Theme toggle works
- All data updates in real-time

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete Dashboard V2 core widgets implementation"
```

**Step 4: Push branch**

```bash
git push origin feat/dashboard-v2
```

---

## Testing Checklist

- [ ] System monitor shows live CPU/RAM/Disk stats
- [ ] Stats update every 3 seconds
- [ ] Weather widget shows current conditions
- [ ] Weather updates every 10 minutes
- [ ] Theme toggle switches between light/dark
- [ ] Theme persists on page reload
- [ ] All widgets are draggable
- [ ] Layout persists (add localStorage later)
- [ ] Responsive on mobile screens
- [ ] No console errors

---

## Future Enhancements

1. Add layout persistence (localStorage)
2. Make weather city configurable
3. Add more system metrics (network, processes)
4. Add widget configuration UI
5. Create widget marketplace/library
