'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  CheckSquare, 
  Shield, 
  Calendar, 
  FolderGit2,
  ArrowRight,
  TrendingUp,
  Clock,
  Plus,
  Command,
  ChevronRight
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export default function Dashboard() {
  const [stats, setStats] = useState({
    tasks: { total: 0, pending: 0, completed: 0, completionRate: 0 },
    approvals: { pending: 0 },
    events: { today: 0, upcoming: 0 },
    repos: { total: 0 }
  })
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch tasks
      const tasksRes = await fetch('/api/tasks')
      const tasks = await tasksRes.json()
      
      // Fetch approvals
      const approvalsRes = await fetch('/api/approvals')
      const approvals = await approvalsRes.json()
      
      // Fetch events
      const eventsRes = await fetch('/api/events')
      const events = await eventsRes.json()

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const completedCount = tasks.filter((t: any) => t.status === 'done').length
      const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0
      
      setStats({
        tasks: {
          total: tasks.length,
          pending: tasks.filter((t: any) => t.status !== 'done').length,
          completed: completedCount,
          completionRate
        },
        approvals: {
          pending: approvals.filter((a: any) => a.status === 'pending').length
        },
        events: {
          today: events.filter((e: any) => {
            const eventDate = new Date(e.startTime)
            eventDate.setHours(0, 0, 0, 0)
            return eventDate.getTime() === today.getTime()
          }).length,
          upcoming: events.filter((e: any) => new Date(e.startTime) > new Date()).length
        },
        repos: {
          total: 0 // Will be updated if GitHub integration is set up
        }
      })

      setRecentTasks(tasks.slice(0, 5))
      setUpcomingEvents(events.filter((e: any) => new Date(e.startTime) > new Date()).slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="border-b border-border-secondary blur-bg sticky top-0 z-40 animate-fade-in">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-success flex items-center justify-center">
                  <span className="text-xs">⚡</span>
                </div>
                <span className="text-xs text-text-tertiary font-mono tracking-wider uppercase">Dashboard</span>
              </div>
              <h1 className="text-5xl font-bold text-gradient mb-2 tracking-tight">Mission Control</h1>
              <p className="text-text-secondary text-base">
                Your AI-powered command center for ultimate productivity
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost btn-sm">
                <Command className="w-4 h-4" />
                <span className="hidden md:inline">Quick actions</span>
                <kbd className="hidden md:inline-flex items-center px-2 py-1 text-xs bg-bg-card border border-border-primary rounded">⌘K</kbd>
              </button>
              <Link href="/tasks">
                <button className="btn btn-primary btn-sm">
                  <Plus className="w-4 h-4" />
                  New task
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-fade">
          {/* Tasks Card */}
          <div className="card stat-card group cursor-pointer">
            <div className="flex items-start justify-between mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-3 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl border border-primary/20 group-hover:scale-110 transition-transform">
                  <CheckSquare className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10 border border-success/20">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-xs font-semibold text-success">{stats.tasks.completionRate}%</span>
              </div>
            </div>
            <div className="space-y-1.5 relative z-10">
              <div className="text-4xl font-bold text-text-primary tracking-tight">
                {stats.tasks.pending}
              </div>
              <div className="text-sm font-medium text-text-secondary">
                Active tasks
              </div>
              <div className="flex items-center gap-2 text-xs text-text-tertiary mt-3 pt-3 border-t border-border-secondary">
                <div className="w-full bg-bg-elevated rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary to-success h-full transition-all duration-1000"
                    style={{ width: `${stats.tasks.completionRate}%` }}
                  />
                </div>
                <span className="whitespace-nowrap font-mono">{stats.tasks.completed}/{stats.tasks.total}</span>
              </div>
            </div>
          </div>

          {/* Approvals Card */}
          <div className="card stat-card group cursor-pointer">
            <div className="flex items-start justify-between mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-warning/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-3 bg-gradient-to-br from-warning/15 to-warning/5 rounded-xl border border-warning/20 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-warning" />
                </div>
              </div>
              {stats.approvals.pending > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20 animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                  <span className="text-xs font-semibold text-warning">Action needed</span>
                </div>
              )}
            </div>
            <div className="space-y-1.5 relative z-10">
              <div className="text-4xl font-bold text-text-primary tracking-tight">
                {stats.approvals.pending}
              </div>
              <div className="text-sm font-medium text-text-secondary">
                Pending approvals
              </div>
              <div className="text-xs text-text-tertiary mt-3">
                Requires your attention
              </div>
            </div>
          </div>

          {/* Events Card */}
          <div className="card stat-card group cursor-pointer">
            <div className="flex items-start justify-between mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-success/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-3 bg-gradient-to-br from-success/15 to-success/5 rounded-xl border border-success/20 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5 text-success" />
                </div>
              </div>
              <Clock className="w-4 h-4 text-text-quaternary" />
            </div>
            <div className="space-y-1.5 relative z-10">
              <div className="text-4xl font-bold text-text-primary tracking-tight">
                {stats.events.today}
              </div>
              <div className="text-sm font-medium text-text-secondary">
                Events today
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-tertiary mt-3">
                <ChevronRight className="w-3 h-3" />
                <span>{stats.events.upcoming} upcoming this week</span>
              </div>
            </div>
          </div>

          {/* Repos Card */}
          <div className="card stat-card group cursor-pointer">
            <div className="flex items-start justify-between mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-3 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl border border-primary/20 group-hover:scale-110 transition-transform">
                  <FolderGit2 className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5 relative z-10">
              <div className="text-4xl font-bold text-text-primary tracking-tight">
                {stats.repos.total}
              </div>
              <div className="text-sm font-medium text-text-secondary">
                GitHub repos
              </div>
              <div className="text-xs text-text-tertiary mt-3 opacity-60">
                Connect GitHub to see stats
              </div>
            </div>
          </div>
        </div>

        {/* Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="card animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-secondary">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                  <CheckSquare className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Recent tasks</h3>
              </div>
              <Link href="/tasks">
                <button className="btn btn-ghost btn-sm group">
                  <span className="text-xs">View all</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
            
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task, idx) => (
                  <div 
                    key={task.id} 
                    className="card-flat group cursor-pointer"
                    style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary mb-2 truncate group-hover:text-primary transition-colors">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className={`badge badge-${task.status}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`badge badge-${task.priority}`}>
                            {task.priority}
                          </span>
                          <span className="text-text-tertiary">{formatRelativeTime(task.createdAt)}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <CheckSquare className="empty-state-icon" />
                <div className="empty-state-title">No tasks yet</div>
                <div className="empty-state-description">
                  Create your first task to get started
                </div>
                <Link href="/tasks">
                  <button className="btn btn-primary mt-4">
                    <Plus className="w-4 h-4" />
                    Create task
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="card animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-secondary">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center border border-success/20">
                  <Calendar className="w-4 h-4 text-success" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Upcoming events</h3>
              </div>
              <Link href="/calendar">
                <button className="btn btn-ghost btn-sm group">
                  <span className="text-xs">View calendar</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event, idx) => (
                  <div 
                    key={event.id} 
                    className="card-flat group cursor-pointer"
                    style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary mb-2 truncate group-hover:text-success transition-colors">
                          {event.title}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {new Date(event.startTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Calendar className="empty-state-icon" />
                <div className="empty-state-title">No upcoming events</div>
                <div className="empty-state-description">
                  Your calendar is clear
                </div>
                <Link href="/calendar">
                  <button className="btn btn-primary mt-4">
                    <Plus className="w-4 h-4" />
                    Add event
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-secondary">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center border border-warning/20">
              <Command className="w-4 h-4 text-warning" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Quick actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/tasks">
              <button className="btn btn-secondary w-full justify-start h-auto py-4 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 w-full relative z-10">
                  <div className="p-2.5 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl border border-primary/20 group-hover:scale-110 transition-transform">
                    <CheckSquare className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-text-primary text-sm">Create task</div>
                    <div className="text-xs text-text-tertiary">Add to your list</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </Link>
            
            <Link href="/calendar">
              <button className="btn btn-secondary w-full justify-start h-auto py-4 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 w-full relative z-10">
                  <div className="p-2.5 bg-gradient-to-br from-success/15 to-success/5 rounded-xl border border-success/20 group-hover:scale-110 transition-transform">
                    <Calendar className="w-4.5 h-4.5 text-success" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-text-primary text-sm">Schedule event</div>
                    <div className="text-xs text-text-tertiary">Add to calendar</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </Link>
            
            <Link href="/projects">
              <button className="btn btn-secondary w-full justify-start h-auto py-4 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 w-full relative z-10">
                  <div className="p-2.5 bg-gradient-to-br from-warning/15 to-warning/5 rounded-xl border border-warning/20 group-hover:scale-110 transition-transform">
                    <FolderGit2 className="w-4.5 h-4.5 text-warning" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-text-primary text-sm">View projects</div>
                    <div className="text-xs text-text-tertiary">Browse all</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
