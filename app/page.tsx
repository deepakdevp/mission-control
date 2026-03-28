'use client';

import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ResponsiveGridLayout } = require('react-grid-layout');
import { PortfolioWidget } from '@/components/dashboard/portfolio-widget';
import { TasksWidget } from '@/components/dashboard/tasks-widget';
import { CalendarWidget } from '@/components/dashboard/calendar-widget';
import { GithubWidget } from '@/components/dashboard/github-widget';
import { Settings } from 'lucide-react';

const LAYOUT_STORAGE_KEY = 'mission-control-dashboard-layout';

const defaultLayouts = {
  lg: [
    { i: 'portfolio', x: 0, y: 0, w: 2, h: 2, minH: 1 },
    { i: 'tasks',     x: 2, y: 0, w: 1, h: 2, minH: 1 },
    { i: 'calendar',  x: 3, y: 0, w: 1, h: 2, minH: 1 },
    { i: 'github',    x: 0, y: 2, w: 2, h: 2, minH: 1 },
  ],
  md: [
    { i: 'portfolio', x: 0, y: 0, w: 2, h: 2, minH: 1 },
    { i: 'tasks',     x: 2, y: 0, w: 1, h: 2, minH: 1 },
    { i: 'calendar',  x: 0, y: 2, w: 1, h: 2, minH: 1 },
    { i: 'github',    x: 1, y: 2, w: 2, h: 2, minH: 1 },
  ],
  sm: [
    { i: 'portfolio', x: 0, y: 0, w: 2, h: 2, minH: 1 },
    { i: 'tasks',     x: 0, y: 2, w: 1, h: 2, minH: 1 },
    { i: 'calendar',  x: 1, y: 2, w: 1, h: 2, minH: 1 },
    { i: 'github',    x: 0, y: 4, w: 2, h: 2, minH: 1 },
  ],
  xs: [
    { i: 'portfolio', x: 0, y: 0, w: 1, h: 2, minH: 1 },
    { i: 'tasks',     x: 0, y: 2, w: 1, h: 2, minH: 1 },
    { i: 'calendar',  x: 0, y: 4, w: 1, h: 2, minH: 1 },
    { i: 'github',    x: 0, y: 6, w: 1, h: 2, minH: 1 },
  ],
};

type Layouts = typeof defaultLayouts;

function WidgetCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-full bg-white border border-[#EEEEEE] rounded-[12px] p-5"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const [editMode, setEditMode] = useState(false);

  // Load persisted layout from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setLayouts(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleLayoutChange = useCallback(
    (_currentLayout: unknown, allLayouts: Layouts) => {
      setLayouts(allLayouts);
      try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(allLayouts));
      } catch {
        // ignore storage errors
      }
    },
    []
  );

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    try {
      localStorage.removeItem(LAYOUT_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      {/* Sticky Header */}
      <div className="bg-white border-b border-[#EEEEEE] sticky top-0 z-10">
        <div className="h-14 px-6 flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#1A1A2E] leading-none">Dashboard</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                editMode
                  ? 'bg-[#5B4EE8] text-white border-[#5B4EE8]'
                  : 'text-[#6B7280] border-[#EEEEEE] hover:bg-[#F9FAFB]'
              }`}
              aria-label={editMode ? 'Stop editing layout' : 'Edit layout'}
            >
              <Settings className="w-3.5 h-3.5" />
              {editMode ? 'Done' : 'Edit'}
            </button>
            {editMode && (
              <button
                onClick={resetLayout}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#6B7280] border border-[#EEEEEE] hover:bg-[#F9FAFB] transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="px-4 py-4">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
          rowHeight={200}
          isDraggable={editMode}
          isResizable={editMode}
          onLayoutChange={handleLayoutChange}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          <div key="portfolio">
            <WidgetCard>
              <PortfolioWidget />
            </WidgetCard>
          </div>
          <div key="tasks">
            <WidgetCard>
              <TasksWidget />
            </WidgetCard>
          </div>
          <div key="calendar">
            <WidgetCard>
              <CalendarWidget />
            </WidgetCard>
          </div>
          <div key="github">
            <WidgetCard>
              <GithubWidget />
            </WidgetCard>
          </div>
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
