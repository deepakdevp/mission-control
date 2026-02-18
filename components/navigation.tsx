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
  Brain
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
  { href: '/docs', icon: FileText, label: 'Docs' },
  { href: '/cron', icon: Clock, label: 'Cron' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 glass-card rounded-none p-6 z-50 flex flex-col">
      {/* Logo and Title */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Mission Control</h1>
          </div>
        </div>
        <p className="text-xs text-text-tertiary ml-13 font-mono">AI Command Center</p>
      </div>

      {/* Navigation Items */}
      <div className="space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all group relative',
                'text-text-secondary hover:text-text-primary',
                isActive 
                  ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary border border-primary/20' 
                  : 'hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon className={cn(
                "w-4.5 h-4.5 flex-shrink-0 transition-transform",
                isActive ? "text-primary" : "text-text-tertiary group-hover:text-text-primary",
                "group-hover:scale-110"
              )} />
              <span className="text-sm font-medium">{item.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="pt-4 mt-auto border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-quaternary font-mono">v0.1.0</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-text-tertiary">Online</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
