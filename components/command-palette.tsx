"use client";

import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckSquare,
  Users,
  Calendar,
  FolderKanban,
  Brain,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  const navigate = (path: string) => {
    router.push(path);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <Command className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
        <div className="flex items-center border-b border-border px-4">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search or jump to..."
            className="flex-1 bg-transparent border-0 outline-none px-4 py-4 text-sm"
          />
        </div>

        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Empty className="p-8 text-center text-sm text-muted-foreground">
            No results found
          </Command.Empty>

          <Command.Group heading="Navigation" className="px-2 py-2">
            <Command.Item
              onSelect={() => navigate('/tasks')}
              className="flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tasks</span>
            </Command.Item>

            <Command.Item
              onSelect={() => navigate('/approvals')}
              className="flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approvals</span>
            </Command.Item>

            <Command.Item
              onSelect={() => navigate('/calendar')}
              className="flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </Command.Item>

            <Command.Item
              onSelect={() => navigate('/projects')}
              className="flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <FolderKanban className="w-4 h-4" />
              <span>Projects</span>
            </Command.Item>

            <Command.Item
              onSelect={() => navigate('/memory')}
              className="flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <Brain className="w-4 h-4" />
              <span>Memory</span>
            </Command.Item>

            <Command.Item
              onSelect={() => navigate('/docs')}
              className="flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </Command.Item>

            <Command.Item
              onSelect={() => navigate('/people')}
              className="flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <Users className="w-4 h-4" />
              <span>People</span>
            </Command.Item>

            <Command.Item
              onSelect={() => navigate('/cron')}
              className="flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <Clock className="w-4 h-4" />
              <span>Cron Jobs</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Quick Actions" className="px-2 py-2 border-t border-border mt-2 pt-2">
            <Command.Item
              onSelect={() => {
                navigate('/tasks');
                // In a real app, this would trigger the "create task" modal
              }}
              className="flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Create Task</span>
            </Command.Item>

            <Command.Item
              onSelect={() => {
                navigate('/people');
                // In a real app, this would trigger the "add contact" modal
              }}
              className="flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <Users className="w-4 h-4" />
              <span>Add Contact</span>
            </Command.Item>

            <Command.Item
              onSelect={() => {
                navigate('/calendar');
                // In a real app, this would trigger the "create event" modal
              }}
              className="flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <Calendar className="w-4 h-4" />
              <span>Create Event</span>
            </Command.Item>

            <Command.Item
              onSelect={() => {
                navigate('/memory');
                // In a real app, this would trigger the "add memory" modal
              }}
              className="flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <Brain className="w-4 h-4" />
              <span>Add Memory</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
