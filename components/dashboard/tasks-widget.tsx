'use client'

import { useEffect, useState } from 'react'
import { CheckSquare, ArrowUpRight, Circle } from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  status: string
  priority: string
}

interface TaskSummary {
  todo: number
  in_progress: number
  done: number
  recentInProgress: Task[]
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-600',
  high: 'bg-amber-100 text-amber-600',
  medium: 'bg-[var(--primary-light)] text-[var(--primary)]',
  low: 'bg-gray-100 text-gray-500',
}

export function TasksWidget() {
  const [data, setData] = useState<TaskSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [todoRes, ipRes, doneRes] = await Promise.all([
          fetch('/api/tasks?status=todo'),
          fetch('/api/tasks?status=in_progress'),
          fetch('/api/tasks?status=done'),
        ])
        const [todoTasks, ipTasks, doneTasks] = await Promise.all([
          todoRes.json(),
          ipRes.json(),
          doneRes.json(),
        ])
        setData({
          todo: todoTasks.length,
          in_progress: ipTasks.length,
          done: doneTasks.length,
          recentInProgress: ipTasks.slice(0, 3),
        })
      } catch {
        setData({ todo: 0, in_progress: 0, done: 0, recentInProgress: [] })
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-20 bg-gray-100 rounded" />
        <div className="h-8 w-16 bg-gray-100 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="h-3 w-2/3 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const total = data.todo + data.in_progress + data.done

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] uppercase tracking-wide text-[var(--text-muted)] font-medium">Tasks</span>
        <Link href="/tasks" className="text-[var(--primary)] hover:underline text-xs flex items-center gap-0.5">
          View <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
          <CheckSquare className="w-4 h-4 text-[var(--primary)]" />
        </div>
        <div>
          <p className="text-[28px] font-bold text-[var(--text-primary)] leading-none">{total}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Total Tasks</p>
        </div>
      </div>
      {/* Status counts */}
      <div className="flex gap-3 mb-3 text-xs">
        <span className="text-[var(--text-secondary)]"><span className="font-semibold text-[var(--text-primary)]">{data.todo}</span> Todo</span>
        <span className="text-[var(--text-secondary)]"><span className="font-semibold text-[var(--primary)]">{data.in_progress}</span> Active</span>
        <span className="text-[var(--text-secondary)]"><span className="font-semibold text-[var(--success)]">{data.done}</span> Done</span>
      </div>
      {/* Recent in-progress */}
      <div className="flex-1 space-y-1.5">
        {data.recentInProgress.length > 0 ? (
          data.recentInProgress.map((task) => (
            <div key={task.id} className="flex items-center gap-2 text-sm">
              <Circle className="w-2 h-2 text-[var(--primary)] fill-[var(--primary)]" />
              <span className="truncate text-[var(--text-primary)] flex-1">{task.title}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
                {task.priority}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-[var(--text-muted)]">No tasks in progress</p>
        )}
      </div>
    </div>
  )
}
