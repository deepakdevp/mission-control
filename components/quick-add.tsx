'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, CheckSquare, Lightbulb, Calendar } from 'lucide-react'
import { toast } from 'sonner'

type QuickAddType = 'task' | 'idea' | 'event'

interface QuickAddOption {
  type: QuickAddType
  label: string
  icon: React.ReactNode
  placeholder: string
  color: string
}

const options: QuickAddOption[] = [
  {
    type: 'task',
    label: 'Task',
    icon: <CheckSquare className="w-4 h-4" />,
    placeholder: 'Quick task title...',
    color: '#5B4EE8',
  },
  {
    type: 'idea',
    label: 'Idea',
    icon: <Lightbulb className="w-4 h-4" />,
    placeholder: 'Idea name...',
    color: '#F59E0B',
  },
  {
    type: 'event',
    label: 'Event',
    icon: <Calendar className="w-4 h-4" />,
    placeholder: 'Event title...',
    color: '#10B981',
  },
]

async function saveItem(type: QuickAddType, title: string): Promise<void> {
  if (type === 'task') {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, status: 'todo', priority: 'medium' }),
    })
    if (!res.ok) throw new Error('Failed to create task')
  } else if (type === 'idea') {
    const res = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: title,
        description: title,
        status: 'Idea',
        confidence: 5,
        tags: [],
      }),
    })
    if (!res.ok) throw new Error('Failed to create idea')
  } else if (type === 'event') {
    const start = new Date()
    start.setHours(start.getHours() + 1, 0, 0, 0)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, startTime: start.toISOString(), endTime: end.toISOString() }),
    })
    if (!res.ok) throw new Error('Failed to create event')
  }
}

export function QuickAdd() {
  const [open, setOpen] = useState(false)
  const [activeType, setActiveType] = useState<QuickAddType | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Focus input when mini-form opens
  useEffect(() => {
    if (activeType && inputRef.current) {
      inputRef.current.focus()
    }
  }, [activeType])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  const handleClose = () => {
    setOpen(false)
    setActiveType(null)
    setInputValue('')
  }

  const handleOptionClick = (type: QuickAddType) => {
    setActiveType(type)
    setInputValue('')
  }

  const handleSave = async () => {
    if (!activeType || !inputValue.trim()) return
    setSaving(true)
    try {
      await saveItem(activeType, inputValue.trim())
      toast.success(`${activeType.charAt(0).toUpperCase() + activeType.slice(1)} created!`)
      handleClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      if (activeType) {
        setActiveType(null)
        setInputValue('')
      } else {
        handleClose()
      }
    }
  }

  const activeOption = options.find(o => o.type === activeType)

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
    >
      {/* Popover */}
      {open && (
        <div
          className="bg-white rounded-[12px] border border-[#EEEEEE] p-3 w-56 animate-scale-in"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
        >
          {!activeType ? (
            // Option buttons
            <div className="space-y-1">
              {options.map(opt => (
                <button
                  key={opt.type}
                  onClick={() => handleOptionClick(opt.type)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors text-left"
                >
                  <span style={{ color: opt.color }}>{opt.icon}</span>
                  <span>+ {opt.label}</span>
                </button>
              ))}
            </div>
          ) : (
            // Mini form
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E] mb-2">
                <span style={{ color: activeOption?.color }}>{activeOption?.icon}</span>
                <span>New {activeOption?.label}</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeOption?.placeholder}
                className="w-full h-9 px-3 text-sm border border-[#EEEEEE] rounded-lg focus:outline-none focus:border-[#5B4EE8] focus:ring-2 focus:ring-[#5B4EE8]/20 transition-all"
                disabled={saving}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!inputValue.trim() || saving}
                  className="flex-1 h-8 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ background: activeOption?.color || '#5B4EE8' }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setActiveType(null); setInputValue('') }}
                  className="h-8 px-3 rounded-lg text-xs font-medium text-[#6B7280] border border-[#EEEEEE] hover:bg-[#F9FAFB] transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close quick add' : 'Quick add'}
        className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: '#5B4EE8', boxShadow: '0 4px 16px rgba(91,78,232,0.4)' }}
      >
        {open
          ? <X className="w-5 h-5" />
          : <Plus className="w-5 h-5" />
        }
      </button>
    </div>
  )
}
