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
    <div className="min-h-screen">
      {/* Header - 56px height per spec */}
      <div className="bg-white border-b border-[#EEEEEE] sticky top-0 z-40">
        <div className="h-14 px-6 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-[#1A1A2E] leading-none">Mission Control</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/tasks">
              <button className="btn btn-primary btn-sm">
                <Plus className="w-4 h-4" />
                New task
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - 32px horizontal, 24px vertical padding per spec */}
      <div className="px-8 py-6">
        {/* Stats Grid - 20px gap per spec */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
          {/* Tasks Card */}
          <div className="stat-card">
            <div className="stat-card-icon">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="stat-card-value">{stats.tasks.pending}</div>
              <div className="stat-card-label">Active Tasks</div>
            </div>
          </div>

          {/* Approvals Card */}
          <div className="stat-card">
            <div className="stat-card-icon">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="stat-card-value">{stats.approvals.pending}</div>
              <div className="stat-card-label">Pending Approvals</div>
            </div>
          </div>

          {/* Events Card */}
          <div className="stat-card">
            <div className="stat-card-icon">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="stat-card-value">{stats.events.today}</div>
              <div className="stat-card-label">Events Today</div>
            </div>
          </div>

          {/* Repos Card */}
          <div className="stat-card">
            <div className="stat-card-icon">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="stat-card-value">{stats.repos.total}</div>
              <div className="stat-card-label">GitHub Repos</div>
            </div>
          </div>
        </div>

        {/* Activity Sections - 20px gap per spec */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Tasks */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#1A1A2E]">Recent Tasks</h3>
              <Link href="/tasks">
                <button className="btn btn-ghost btn-sm">
                  View all
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            
            {recentTasks.length > 0 ? (
              <div className="space-y-0">
                {recentTasks.map((task) => (
                  <div key={task.id} className="activity-row">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#374151] mb-1 truncate">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`badge badge-${task.status}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className="text-[#9CA3AF]">{formatRelativeTime(task.createdAt)}</span>
                      </div>
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
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#1A1A2E]">Upcoming Events</h3>
              <Link href="/calendar">
                <button className="btn btn-ghost btn-sm">
                  View all
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-0">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="activity-row">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#374151] mb-1 truncate">
                        {event.title}
                      </div>
                      <div className="text-xs text-[#9CA3AF]">
                        {new Date(event.startTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
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
        <div className="card mt-5">
          <h3 className="text-base font-semibold text-[#1A1A2E] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/tasks">
              <button className="btn btn-secondary w-full justify-start">
                <CheckSquare className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </Link>
            
            <Link href="/calendar">
              <button className="btn btn-secondary w-full justify-start">
                <Calendar className="w-4 h-4" />
                <span>Schedule Event</span>
              </button>
            </Link>
            
            <Link href="/projects">
              <button className="btn btn-secondary w-full justify-start">
                <FolderGit2 className="w-4 h-4" />
                <span>View Projects</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
