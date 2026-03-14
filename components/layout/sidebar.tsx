"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  CheckCircle2,
  Calendar,
  FolderKanban,
  Brain,
  FileText,
  Users,
  Clock,
  Command,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, exact: true },
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
    <div className="flex h-full w-60 flex-col bg-[#191919]">
      <div className="flex items-center gap-2 px-5 py-5">
        <Command className="w-6 h-6 text-[#0057ff]" />
        <h1 className="text-lg font-semibold text-white tracking-tight">Mission Control</h1>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navigation.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-[rgba(0,87,255,0.15)] text-white border-l-[3px] border-[#0057ff] -ml-[3px] pl-[15px]'
                  : 'text-[#8a8a8a] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0057ff] flex items-center justify-center text-white text-xs font-semibold">
            U
          </div>
          <div>
            <p className="text-sm text-white font-medium">User</p>
            <p className="text-xs text-[#6b6b6b]">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
