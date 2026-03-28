'use client'

import { useState, useMemo } from 'react'
import {
  CheckSquare,
  Square,
  MoreVertical,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Circle,
  Timer,
  Ban,
  AlertTriangle,
} from 'lucide-react'
import { Input } from './ui/input'
import { cn, formatDueDate, parseTags } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  dueDate?: string | null
  assignedTo?: string | null
  tags?: string | null
  projectId?: string | null
  createdAt: string
  updatedAt: string
}

interface TasksTableProps {
  tasks: Task[]
  onTaskUpdate: (id: string, updates: Partial<Task>) => Promise<void>
  onTaskDelete: (id: string) => Promise<void>
  onStatusChange: (id: string, status: string) => Promise<void>
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  todo:        { label: 'Todo',        dot: 'bg-gray-400',   text: 'text-gray-600', bg: 'bg-gray-100' },
  in_progress: { label: 'In Progress', dot: 'bg-blue-500',   text: 'text-blue-700', bg: 'bg-blue-50' },
  done:        { label: 'Done',        dot: 'bg-green-500',  text: 'text-green-700', bg: 'bg-green-50' },
  blocked:     { label: 'Blocked',     dot: 'bg-red-500',    text: 'text-red-700',  bg: 'bg-red-50' },
}

const PRIORITY_CONFIG: Record<string, { label: string; text: string; bg: string }> = {
  low:    { label: 'Low',    text: 'text-gray-600', bg: 'bg-gray-100' },
  medium: { label: 'Medium', text: 'text-blue-700', bg: 'bg-blue-50' },
  high:   { label: 'High',   text: 'text-amber-700', bg: 'bg-amber-50' },
  urgent: { label: 'Urgent', text: 'text-red-700',  bg: 'bg-red-50' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.todo
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', cfg.bg, cfg.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', cfg.bg, cfg.text)}>
      {cfg.label}
    </span>
  )
}

export function TasksTable({ tasks, onTaskUpdate, onTaskDelete, onStatusChange }: TasksTableProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        parseTags(t.tags || null).some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter)
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter)

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return result
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  const toggleTask = (id: string) => {
    const s = new Set(selectedTasks)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelectedTasks(s)
  }

  const toggleAll = () => {
    setSelectedTasks(selectedTasks.size === filteredTasks.length && filteredTasks.length > 0
      ? new Set()
      : new Set(filteredTasks.map(t => t.id))
    )
  }

  const handleCellSave = async (taskId: string, field: string, value: string) => {
    await onTaskUpdate(taskId, { [field]: value })
    setEditingCell(null)
  }

  const handleBatchStatus = async (status: string) => {
    for (const id of selectedTasks) await onStatusChange(id, status)
    setSelectedTasks(new Set())
  }

  const handleBatchDelete = async () => {
    if (!confirm(`Delete ${selectedTasks.size} task(s)?`)) return
    for (const id of selectedTasks) await onTaskDelete(id)
    setSelectedTasks(new Set())
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 border-gray-200 text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {selectedTasks.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">{selectedTasks.size} selected</span>
              <button
                onClick={() => handleBatchStatus('done')}
                className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                Mark Done
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-12 px-4 py-3">
                  <button onClick={toggleAll} className="text-gray-400 hover:text-gray-600">
                    {selectedTasks.size === filteredTasks.length && filteredTasks.length > 0
                      ? <CheckSquare className="w-4 h-4" />
                      : <Square className="w-4 h-4" />
                    }
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Task</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tags</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">No tasks found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first task using the AI prompt above'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr
                    key={task.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    style={{ height: 52 }}
                  >
                    {/* Checkbox */}
                    <td className="px-4">
                      <button onClick={() => toggleTask(task.id)} className="text-gray-400 hover:text-gray-600">
                        {selectedTasks.has(task.id)
                          ? <CheckSquare className="w-4 h-4 text-blue-600" />
                          : <Square className="w-4 h-4" />
                        }
                      </button>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-2">
                      {editingCell?.id === task.id && editingCell.field === 'title' ? (
                        <Input
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleCellSave(task.id, 'title', editValue)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleCellSave(task.id, 'title', editValue)
                            if (e.key === 'Escape') setEditingCell(null)
                          }}
                          autoFocus
                          className="h-8 text-sm"
                        />
                      ) : (
                        <div
                          onClick={() => { setEditingCell({ id: task.id, field: 'title' }); setEditValue(task.title) }}
                          className="cursor-pointer group"
                        >
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-xs">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-gray-400 truncate max-w-xs">{task.description}</p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2">
                      <div className="relative">
                        <StatusBadge status={task.status} />
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-2">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-2">
                      {task.dueDate ? (
                        <span className={cn(
                          'text-sm',
                          new Date(task.dueDate) < new Date() && task.status !== 'done'
                            ? 'text-red-600 font-medium'
                            : 'text-gray-500'
                        )}>
                          {formatDueDate(task.dueDate)}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">–</span>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-2">
                      <div className="flex gap-1 flex-wrap">
                        {parseTags(task.tags || null).slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-2">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === task.id && (
                          <div
                            className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            {/* Status changes */}
                            {['todo', 'in_progress', 'done', 'blocked'].map(s => (
                              <button
                                key={s}
                                onClick={() => { onStatusChange(task.id, s); setOpenMenuId(null) }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_CONFIG[s]?.dot)} />
                                {STATUS_CONFIG[s]?.label}
                              </button>
                            ))}
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => {
                                setEditingCell({ id: task.id, field: 'title' })
                                setEditValue(task.title)
                                setOpenMenuId(null)
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit title
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this task?')) onTaskDelete(task.id)
                                setOpenMenuId(null)
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filteredTasks.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
