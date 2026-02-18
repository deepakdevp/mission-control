'use client'

import { useState, useMemo } from 'react'
import { 
  CheckSquare, 
  Square, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
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

export function TasksTable({ tasks, onTaskUpdate, onTaskDelete, onStatusChange }: TasksTableProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'createdAt',
    direction: 'desc'
  })
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        parseTags(task.tags || null).some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter)
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortBy.field as keyof Task] || ''
      const bVal = b[sortBy.field as keyof Task] || ''
      
      if (sortBy.direction === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return result
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy])

  const toggleTaskSelection = (id: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedTasks(newSelected)
  }

  const toggleAllTasks = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(filteredTasks.map(t => t.id)))
    }
  }

  const handleCellEdit = async (taskId: string, field: string, value: string) => {
    await onTaskUpdate(taskId, { [field]: value })
    setEditingCell(null)
    setEditValue('')
  }

  const handleBatchStatusChange = async (status: string) => {
    for (const id of selectedTasks) {
      await onStatusChange(id, status)
    }
    setSelectedTasks(new Set())
  }

  const handleBatchDelete = async () => {
    if (!confirm(`Delete ${selectedTasks.size} tasks?`)) return
    
    for (const id of selectedTasks) {
      await onTaskDelete(id)
    }
    setSelectedTasks(new Set())
  }

  const handleSort = (field: string) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Batch Actions */}
      {selectedTasks.size > 0 && (
        <div className="glass-card p-4 flex items-center gap-4 animate-fade-in">
          <span className="text-sm text-text-secondary">
            {selectedTasks.size} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleBatchStatusChange('done')}>
              Mark Done
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleBatchStatusChange('in_progress')}>
              In Progress
            </Button>
            <Button size="sm" variant="danger" onClick={handleBatchDelete}>
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left">
                <th className="p-4 w-12">
                  <button
                    onClick={toggleAllTasks}
                    className="text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    {selectedTasks.size === filteredTasks.length && filteredTasks.length > 0 ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="p-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('title')}>
                  Title {sortBy.field === 'title' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-4">Description</th>
                <th className="p-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('status')}>
                  Status {sortBy.field === 'status' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('priority')}>
                  Priority {sortBy.field === 'priority' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-4">Tags</th>
                <th className="p-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('dueDate')}>
                  Due Date {sortBy.field === 'dueDate' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-4">Assignee</th>
                <th className="p-4 w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <td className="p-4">
                    <button
                      onClick={() => toggleTaskSelection(task.id)}
                      className="text-text-tertiary hover:text-text-primary transition-colors"
                    >
                      {selectedTasks.has(task.id) ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    {editingCell?.id === task.id && editingCell?.field === 'title' ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleCellEdit(task.id, 'title', editValue)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCellEdit(task.id, 'title', editValue)
                          if (e.key === 'Escape') setEditingCell(null)
                        }}
                        autoFocus
                        className="py-1"
                      />
                    ) : (
                      <div
                        onClick={() => {
                          setEditingCell({ id: task.id, field: 'title' })
                          setEditValue(task.title)
                        }}
                        className="cursor-pointer hover:text-primary transition-colors"
                      >
                        {task.title}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-text-secondary text-sm max-w-xs truncate">
                    {task.description || '-'}
                  </td>
                  <td className="p-4">
                    <div className="relative group/status">
                      <Badge variant={task.status as any}>{task.status.replace('_', ' ')}</Badge>
                      <div className="absolute left-0 top-full mt-1 hidden group-hover/status:block z-10">
                        <div className="glass-card p-2 space-y-1">
                          {['todo', 'in_progress', 'done', 'blocked'].map(status => (
                            <button
                              key={status}
                              onClick={() => onStatusChange(task.id, status)}
                              className="block w-full text-left px-3 py-1 rounded hover:bg-white/10 transition-colors text-sm"
                            >
                              {status.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={task.priority as any}>{task.priority}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {parseTags(task.tags || null).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    {task.dueDate ? (
                      <span className={cn(
                        new Date(task.dueDate) < new Date() && task.status !== 'done' 
                          ? 'text-danger' 
                          : 'text-text-secondary'
                      )}>
                        {formatDueDate(task.dueDate)}
                      </span>
                    ) : (
                      <span className="text-text-tertiary">-</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {task.assignedTo || 'Unassigned'}
                  </td>
                  <td className="p-4">
                    <div className="relative group/actions">
                      <button className="p-2 hover:bg-white/10 rounded transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 hidden group-hover/actions:block z-10">
                        <div className="glass-card p-2 space-y-1 min-w-[120px]">
                          <button
                            onClick={() => {
                              setEditingCell({ id: task.id, field: 'title' })
                              setEditValue(task.title)
                            }}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors text-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this task?')) {
                                onTaskDelete(task.id)
                              }
                            }}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-danger/20 text-danger transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
            ? 'No tasks match your filters'
            : 'No tasks yet. Create one using the AI prompt above!'}
        </div>
      )}
    </div>
  )
}
