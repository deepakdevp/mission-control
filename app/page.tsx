'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { KPICard } from '@/components/dashboard/kpi-card'
import { TrendingUp, CheckSquare, Lightbulb, DollarSign, GitCommit, Clock, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

// ---- Types ----
interface PortfolioSummary {
  netWorthInr: number
  usdInrRate: number
  crypto: { totalUsd: number; numAssets: number }
  usStocks: { totalUsd: number; gainUsd: number }
  mutualFunds: { totalInr: number; gainInr: number; count: number }
  indianStocks: { totalInr: number; count: number }
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
  createdAt: string
}

interface CalendarEvent {
  id: string
  title: string
  startTime: string
  endTime?: string
  location?: string
}

interface Commit {
  sha: string
  message: string
  date: string
  repo: string
}

interface Repo {
  name: string
  url: string
  commits?: Array<{ sha: string; commit: { message: string; author: { date: string } } }>
}

// ---- Helpers ----
function formatInr(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)}`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ---- Portfolio chart data generator ----
function generateChartData(days: number, baseValue: number) {
  const data = []
  const now = Date.now()
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 86400000)
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const noise = (Math.random() - 0.48) * baseValue * 0.02
    const trend = (baseValue * 0.001 * (days - i)) / days
    baseValue = Math.max(baseValue + noise + trend, baseValue * 0.85)
    data.push({ date: label, value: Math.round(baseValue) })
  }
  return data
}

const PIE_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6']

// ---- Main Component ----
export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [commits, setCommits] = useState<Commit[]>([])
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D')
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [portfolioRes, tasksRes, eventsRes, reposRes] = await Promise.all([
          fetch('/api/portfolio-summary').catch(() => null),
          fetch('/api/tasks').catch(() => null),
          fetch(`/api/calendar?start=${new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()}&end=${new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toISOString()}`).catch(() => null),
          fetch('/api/github/repos?detailed=true').catch(() => null),
        ])

        if (portfolioRes?.ok) {
          const data = await portfolioRes.json()
          setPortfolio(data)
        }

        if (tasksRes?.ok) {
          const data = await tasksRes.json()
          setTasks(Array.isArray(data) ? data : [])
        }

        if (eventsRes?.ok) {
          const data = await eventsRes.json()
          setEvents(Array.isArray(data) ? data.slice(0, 5) : [])
        }

        if (reposRes?.ok) {
          const repos: Repo[] = await reposRes.json()
          if (Array.isArray(repos)) {
            const allCommits: Commit[] = []
            repos.forEach(repo => {
              ;(repo.commits || []).forEach(c => {
                allCommits.push({
                  sha: c.sha,
                  message: c.commit.message.split('\n')[0],
                  date: c.commit.author.date,
                  repo: repo.name,
                })
              })
            })
            allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            setCommits(allCommits.slice(0, 6))
          }
        }
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Task summary
  const tasksDone = tasks.filter(t => t.status === 'done').length
  const tasksInProgress = tasks.filter(t => t.status === 'in_progress').length
  const tasksTodo = tasks.filter(t => t.status === 'todo').length

  // Ideas this week (using tasks as proxy - in a real app, fetch /api/ideas)
  const ideasThisWeek = 0

  // Chart data
  const daysMap = { '7D': 7, '30D': 30, '90D': 90 }
  const basePortfolioValue = portfolio ? portfolio.netWorthInr : 5000000
  const chartData = generateChartData(daysMap[timeRange], basePortfolioValue * 0.92)

  // Donut data for tasks
  const taskDonutData = [
    { name: 'Todo', value: tasksTodo || 1 },
    { name: 'In Progress', value: tasksInProgress || 0 },
    { name: 'Done', value: tasksDone || 0 },
  ]
  const taskDonutColors = ['#E5E7EB', '#2563EB', '#10B981']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="px-6 pt-8 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, Deepak 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">{dateStr}</p>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Net Worth"
            value={portfolio ? formatInr(portfolio.netWorthInr) : '–'}
            change="+3.2%"
            changeType="positive"
            icon={<DollarSign className="w-5 h-5" />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <KPICard
            title="Portfolio Today"
            value={portfolio ? `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(portfolio.usStocks.totalUsd + portfolio.crypto.totalUsd)}` : '–'}
            change={portfolio && portfolio.usStocks.gainUsd > 0 ? `+$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(portfolio.usStocks.gainUsd)}` : '0'}
            changeType={portfolio && portfolio.usStocks.gainUsd > 0 ? 'positive' : 'neutral'}
            icon={<TrendingUp className="w-5 h-5" />}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <KPICard
            title="Tasks Done"
            value={String(tasksDone)}
            change={`${tasksInProgress} in progress`}
            changeType="neutral"
            icon={<CheckSquare className="w-5 h-5" />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
          <KPICard
            title="Ideas This Week"
            value={String(ideasThisWeek)}
            change="0%"
            changeType="neutral"
            icon={<Lightbulb className="w-5 h-5" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Area Chart - 2/3 width */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Portfolio Value</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {portfolio ? formatInr(portfolio.netWorthInr) : '–'} total
                </p>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['7D', '30D', '90D'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      timeRange === range
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => formatInr(v)}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: 8,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      fontSize: 12,
                    }}
                    formatter={(v) => [formatInr(Number(v)), 'Portfolio']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#portfolioGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Breakdown - 1/3 width */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Task Breakdown</h3>
              <Link href="/tasks" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-6">
              {/* Donut chart */}
              <div className="flex justify-center mb-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie
                      data={taskDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {taskDonutData.map((_, idx) => (
                        <Cell key={idx} fill={taskDonutColors[idx]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                    <span className="text-gray-600">Todo</span>
                  </div>
                  <span className="font-semibold text-gray-900">{tasksTodo}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-gray-600">In Progress</span>
                  </div>
                  <span className="font-semibold text-gray-900">{tasksInProgress}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-gray-600">Done</span>
                  </div>
                  <span className="font-semibold text-gray-900">{tasksDone}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Tasks</span>
                  <span className="font-bold text-gray-900">{tasks.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: GitHub Activity + Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
              <Link href="/projects" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                View repos <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                        <div className="h-2 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : commits.length > 0 ? (
                <div className="space-y-4">
                  {commits.map(commit => (
                    <div key={commit.sha} className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <GitCommit className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900 truncate">{commit.message}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-medium text-blue-600">{commit.repo}</span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-400">{timeAgo(commit.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GitCommit className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent commits</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Upcoming Events</h3>
              <Link href="/calendar" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                View calendar <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                        <div className="h-2 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-4">
                  {events.map(event => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-semibold text-blue-600 uppercase leading-none">
                          {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-sm font-bold text-blue-700 leading-none">
                          {new Date(event.startTime).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{formatTime(event.startTime)}</span>
                          {event.location && (
                            <>
                              <span className="text-xs text-gray-300">·</span>
                              <span className="text-xs text-gray-400 truncate">{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No upcoming events</p>
                  <p className="text-xs text-gray-400 mt-1">Clear schedule ahead!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
