"use client";

import { useState, useEffect } from 'react';
import { CommandPalette } from '../command-palette';
import { useSSE } from '@/hooks/use-sse';
import { Toaster } from 'sonner';

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useSSE(); // Enable global SSE for real-time updates

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {children}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <Toaster position="bottom-right" />
    </>
  );
}
