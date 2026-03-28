'use client'

import { useState } from 'react'
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
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    items: [
      { href: '/', icon: Home, label: 'Dashboard' },
      { href: '/nerve-center', icon: Activity, label: 'Nerve Center' },
    ],
  },
  {
    items: [
      { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
      { href: '/ideas', icon: Lightbulb, label: 'Ideas' },
      { href: '/approvals', icon: Shield, label: 'Approvals' },
    ],
  },
  {
    items: [
      { href: '/portfolio', icon: TrendingUp, label: 'Portfolio' },
      { href: '/calendar', icon: Calendar, label: 'Calendar' },
      { href: '/projects', icon: FolderGit2, label: 'Projects' },
    ],
  },
  {
    items: [
      { href: '/memory', icon: Brain, label: 'Memory' },
      { href: '/docs', icon: FileText, label: 'Docs' },
      { href: '/cron', icon: Clock, label: 'Cron' },
    ],
  },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-[60] md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-[#EEEEEE] shadow-sm"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5 text-[#1A1A2E]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[55] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <nav
        className={cn(
          'fixed left-0 top-0 h-screen w-[230px] bg-white border-r border-[#EEEEEE] z-[60] flex flex-col transition-transform duration-200',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo and Title */}
        <div className="px-4 py-4 border-b border-[#EEEEEE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5B4EE8] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">⚡</span>
            </div>
            <h1 className="text-base font-bold text-[#1A1A2E]">Mission Control</h1>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F9FAFB]"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Navigation Items with group separators */}
        <div className="py-2 flex-1 overflow-y-auto">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {groupIdx > 0 && (
                <div className="mx-4 my-2 border-t border-[#F3F4F6]" />
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 h-10 transition-colors relative',
                      'px-4',
                      isActive
                        ? 'bg-[#F0EFFE] text-[#5B4EE8] font-semibold'
                        : 'text-[#374151] font-medium hover:bg-[#F9FAFB]'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#5B4EE8]" />
                    )}
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
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
    </>
  )
}
