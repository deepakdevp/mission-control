'use client'

import { useEffect, useState } from 'react'
import { Calendar, ArrowUpRight, Clock } from 'lucide-react'
import Link from 'next/link'

interface CalendarEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  location?: string
}

export function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

    fetch(`/api/calendar?start=${start}&end=${end}`)
      .then(r => r.json())
      .then(d => { setEvents(Array.isArray(d) ? d.slice(0, 3) : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-8 w-32 bg-gray-100 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="h-3 w-2/3 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] uppercase tracking-wide text-[var(--text-muted)] font-medium">Today</span>
        <Link href="/calendar" className="text-[var(--primary)] hover:underline text-xs flex items-center gap-0.5">
          View <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
          <Calendar className="w-4 h-4 text-[var(--primary)]" />
        </div>
        <div>
          <p className="text-[28px] font-bold text-[var(--text-primary)] leading-none">{dateStr}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{dayName}</p>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="flex items-start gap-2 text-sm">
              <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-[var(--text-primary)] font-medium">{event.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{formatTime(event.startTime)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-[var(--text-muted)]">No events today</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Enjoy your free day!</p>
          </div>
        )}
      </div>
    </div>
  )
}
