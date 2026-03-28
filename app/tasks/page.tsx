'use client'

import { useState, useEffect } from 'react'
import { AIPromptInput } from '@/components/ai-prompt-input'
import { TasksTable } from '@/components/tasks-table'
import { SkeletonTable } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { CheckSquare, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { toast } from 'sonner'

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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromptSubmit = async (prompt: string) => {
    try {
      // Parse prompt with AI
      const parseResponse = await fetch('/api/tasks/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!parseResponse.ok) {
        throw new Error('Failed to parse prompt')
      }

      const parsed = await parseResponse.json()

      // Create task
      const createResponse = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      })

      if (!createResponse.ok) {
        throw new Error('Failed to create task')
      }

      const newTask = await createResponse.json()
      
      setTasks(prev => [newTask, ...prev])
      toast.success('Task created successfully!')
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
      throw error
    }
  }

  const handleTaskUpdate = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Failed to update task')

      const updated = await response.json()
      setTasks(prev => prev.map(t => t.id === id ? updated : t))
      toast.success('Task updated')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleTaskDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete task')

      setTasks(prev => prev.filter(t => t.id !== id))
      toast.success('Task deleted')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    await handleTaskUpdate(id, { status })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Tasks" description="Manage your tasks and to-dos" />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* description removed for cleaner look */}

        {/* AI Prompt Input */}
        <div className="sticky top-4 z-10">
          <AIPromptInput
            placeholder="Create task: finish report by Friday, high priority..."
            onSubmit={handlePromptSubmit}
            icon={<Sparkles className="w-5 h-5" />}
          />
        </div>

        {/* Tasks Table */}
        {isLoading ? (
          <div className="bg-white border border-[#EEEEEE] rounded-[12px] p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <SkeletonTable rows={6} />
          </div>
        ) : tasks.length > 0 ? (
          <TasksTable
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <EmptyState
            icon={CheckSquare}
            title="No tasks yet"
            description="Create your first task using the AI prompt above. Try something like 'Add task to review PR #123, high priority, due tomorrow'"
          />
        )}
      </div>
    </div>
  )
}
