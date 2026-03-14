"use client";

import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Topbar() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="h-14 border-b border-[#e8e8e8] bg-white flex items-center justify-between px-6">
      <div>
        <p className="text-xs text-[#6b6b6b]">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" />
          <Input
            placeholder="Search... (Cmd+K)"
            className="pl-9 w-64 h-9 bg-[#f5f6f8] border-[#e8e8e8] text-sm rounded-lg"
          />
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-[#6b6b6b] hover:text-[#191919]">
          <Bell className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-[#6b6b6b] hover:text-[#191919]">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
