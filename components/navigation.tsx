'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  CheckSquare,
  Shield,
  Calendar,
  FolderGit2,
  FileText,
  Clock,
  Brain,
  Activity,
  Lightbulb,
  TrendingUp,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'WORKSPACE',
    items: [
      { href: '/', icon: Home, label: 'Dashboard' },
      { href: '/nerve-center', icon: Activity, label: 'Nerve Center' },
    ],
  },
  {
    label: 'MONITORING',
    items: [
      { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
      { href: '/ideas', icon: Lightbulb, label: 'Ideas' },
      { href: '/approvals', icon: Shield, label: 'Approvals' },
      { href: '/projects', icon: FolderGit2, label: 'Projects' },
      { href: '/calendar', icon: Calendar, label: 'Calendar' },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { href: '/portfolio', icon: TrendingUp, label: 'Portfolio' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { href: '/memory', icon: Brain, label: 'Memory' },
      { href: '/docs', icon: FileText, label: 'Docs' },
      { href: '/cron', icon: Clock, label: 'Cron' },
    ],
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-gray-200 z-[60] flex flex-col">
      {/* Logo Area */}
      <div className="h-16 px-5 flex items-center border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold text-gray-900">Mission Control</span>
          <div className="w-2 h-2 rounded-full bg-blue-600 ml-auto flex-shrink-0" />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className={groupIdx > 0 ? 'mt-4' : ''}>
            <p className={cn(
              'text-[11px] font-semibold tracking-widest text-gray-400 uppercase px-3 mb-1',
              groupIdx > 0 ? 'mt-4' : ''
            )}>
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-0.5 text-sm font-medium',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-[18px] h-[18px] flex-shrink-0',
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Deepak Panwar</p>
            <p className="text-xs text-gray-500 truncate">deepakdevp@gmail.com</p>
          </div>
          <div className="ml-auto flex items-center gap-1 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>
      </div>
    </nav>
  )
}
