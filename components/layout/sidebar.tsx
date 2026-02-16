"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CheckSquare, 
  CheckCircle2, 
  Calendar, 
  FolderKanban, 
  Brain, 
  FileText, 
  Users, 
  Clock 
} from 'lucide-react';

const navigation = [
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Approvals', href: '/approvals', icon: CheckCircle2 },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Memory', href: '/memory', icon: Brain },
  { name: 'Docs', href: '/docs', icon: FileText },
  { name: 'People', href: '/people', icon: Users },
  { name: 'Cron', href: '/cron', icon: Clock },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">Mission Control</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
