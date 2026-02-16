"use client";

import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Topbar() {
  return (
    <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search... (Cmd+K)"
            className="pl-10 bg-background"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
