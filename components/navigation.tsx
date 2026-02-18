'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  CheckSquare, 
  Shield, 
  Calendar, 
  FolderGit2, 
  Users, 
  FileText, 
  Clock,
  Brain,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/approvals', icon: Shield, label: 'Approvals' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/projects', icon: FolderGit2, label: 'Projects' },
  { href: '/people', icon: Users, label: 'People' },
  { href: '/memory', icon: Brain, label: 'Memory' },
  { href: '/nerve-center', icon: Activity, label: 'Nerve Center' },
  { href: '/docs', icon: FileText, label: 'Docs' },
  { href: '/cron', icon: Clock, label: 'Cron' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 h-screen w-[230px] bg-white border-r border-[#EEEEEE] z-50 flex flex-col">
      {/* Logo and Title - 16px padding per spec */}
      <div className="px-4 py-4 border-b border-[#EEEEEE]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5B4EE8] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg font-bold">⚡</span>
          </div>
          <h1 className="text-base font-bold text-[#1A1A2E]">Mission Control</h1>
        </div>
      </div>

      {/* Navigation Items - 16px padding top/bottom per spec */}
      <div className="py-4 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 h-10 transition-colors relative',
                'px-4', /* 0 16px padding per spec */
                isActive 
                  ? 'bg-[#F0EFFE] text-[#5B4EE8] font-semibold' 
                  : 'text-[#374151] font-medium hover:bg-[#F9FAFB]'
              )}
            >
              {/* Active indicator - 3px left border per spec */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#5B4EE8]" />
              )}
              
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Footer - 16px padding per spec */}
      <div className="px-4 py-3 mt-auto border-t border-[#EEEEEE]">
        <div className="flex items-center justify-between text-xs text-[#6B7280]">
          <span>v0.1.0</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Online</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
