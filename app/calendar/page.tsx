'use client'

import { useState, useEffect } from 'react'
import { Calendar as BigCalendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar'
import moment from 'moment'
import { AIPromptInput } from '@/components/ai-prompt-input'
import { Loading } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  CalendarDays, 
  Sparkles, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Download,
  Upload,
  Clock,
  MapPin,
  Users,
  X,
  Edit,
  Trash,
  ExternalLink,
  Check,
  RefreshCw,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'
import { formatRelativeTime } from '@/lib/utils'

const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: string
  title: string
  description?: string | null
  startTime: string
  endTime: string
  location?: string | null
  attendees?: string | null
  googleEventId?: string | null
}

interface EventModalData extends CalendarEvent {
  start: Date
  end: Date
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<View>('week')
  const [date, setDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<EventModalData | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMiniDate, setSelectedMiniDate] = useState(new Date())

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load calendar events')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/calendar/sync', { method: 'POST' })
      if (!response.ok) throw new Error('Sync failed')
      await fetchEvents()
      toast.success('Calendar synced with Google Calendar')
    } catch (error) {
      toast.error('Failed to sync calendar')
    } finally {
      setIsSyncing(false)
    }
  }

  const handlePromptSubmit = async (prompt: string) => {
    try {
      const parseResponse = await fetch('/api/calendar/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!parseResponse.ok) throw new Error('Failed to parse prompt')
      const parsed = await parseResponse.json()

      const createResponse = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      })

      if (!createResponse.ok) throw new Error('Failed to create event')
      const newEvent = await createResponse.json()
      setEvents(prev => [...prev, newEvent])
      toast.success('Event created successfully!')
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
      throw error
    }
  }

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const newEvent: EventModalData = {
      id: '',
      title: '',
      description: '',
      startTime: slotInfo.start.toISOString(),
      endTime: slotInfo.end.toISOString(),
      location: '',
      attendees: '',
      googleEventId: null,
      start: slotInfo.start,
      end: slotInfo.end
    }
    setSelectedEvent(newEvent)
    setIsCreating(true)
  }

  const handleSelectEvent = (event: any) => {
    setSelectedEvent({
      ...event.resource,
      start: event.start,
      end: event.end
    })
    setIsCreating(false)
  }

  const handleEventDrop = async ({ event, start, end }: any) => {
    try {
      const updatedEvent = {
        ...event.resource,
        startTime: start.toISOString(),
        endTime: end.toISOString()
      }

      const response = await fetch(`/api/events/${event.resource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent)
      })

      if (!response.ok) throw new Error('Failed to update event')
      
      setEvents(prev => prev.map(e => 
        e.id === event.resource.id ? updatedEvent : e
      ))
      toast.success('Event rescheduled')
    } catch (error) {
      toast.error('Failed to reschedule event')
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete event')
      
      setEvents(prev => prev.filter(e => e.id !== id))
      setSelectedEvent(null)
      toast.success('Event deleted')
    } catch (error) {
      toast.error('Failed to delete event')
    }
  }

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (isCreating) {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        })
        if (!response.ok) throw new Error('Failed to create event')
        const newEvent = await response.json()
        setEvents(prev => [...prev, newEvent])
        toast.success('Event created')
      } else {
        const response = await fetch(`/api/events/${selectedEvent?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        })
        if (!response.ok) throw new Error('Failed to update event')
        const updated = await response.json()
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
        toast.success('Event updated')
      }
      setSelectedEvent(null)
    } catch (error) {
      toast.error('Failed to save event')
    }
  }

  const calendarEvents = events
    .filter(event => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      )
    })
    .map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      resource: event
    }))

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startTime)
    const today = new Date()
    return eventDate.toDateString() === today.toDateString()
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const upcomingEvents = events
    .filter(event => new Date(event.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base">
        <Loading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="border-b border-border-secondary bg-bg-elevated/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="breadcrumb mb-2">
                <span className="breadcrumb-item">Calendar</span>
              </div>
              <h1 className="text-4xl font-bold text-gradient">Calendar</h1>
              <p className="text-text-secondary mt-2">
                Manage your schedule with Google Calendar sync
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleSync} disabled={isSyncing}>
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              <Button variant="primary" size="sm" onClick={() => {
                const now = new Date()
                const end = new Date(now.getTime() + 60 * 60 * 1000)
                handleSelectSlot({ start: now, end, slots: [], action: 'select' })
              }}>
                <Plus className="w-4 h-4" />
                New event
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>Google Calendar</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-text-tertiary"></div>
                <span>Local</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Quick Add */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-text-primary">Quick Add</h3>
              </div>
              <AIPromptInput
                onSubmit={handlePromptSubmit}
                placeholder="'Meeting with John tomorrow at 2pm'"
                buttonText="Create"
              />
            </div>

            {/* Today's Events */}
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-success" />
                Today ({todayEvents.length})
              </h3>
              {todayEvents.length > 0 ? (
                <div className="space-y-2">
                  {todayEvents.map(event => (
                    <div
                      key={event.id}
                      className="card-flat cursor-pointer group"
                      onClick={() => handleSelectEvent({
                        ...event,
                        start: new Date(event.startTime),
                        end: new Date(event.endTime),
                        resource: event
                      })}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-1 h-full rounded-full ${event.googleEventId ? 'bg-primary' : 'bg-text-tertiary'}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                            {event.title}
                          </div>
                          <div className="text-xs text-text-tertiary mt-1">
                            {moment(event.startTime).format('h:mm A')} - {moment(event.endTime).format('h:mm A')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-tertiary text-center py-4">
                  No events today
                </p>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Upcoming
              </h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {upcomingEvents.map(event => (
                    <div
                      key={event.id}
                      className="card-flat cursor-pointer group"
                      onClick={() => handleSelectEvent({
                        ...event,
                        start: new Date(event.startTime),
                        end: new Date(event.endTime),
                        resource: event
                      })}
                    >
                      <div className="text-sm font-medium text-text-primary truncate group-hover:text-warning transition-colors">
                        {event.title}
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        {moment(event.startTime).format('MMM D, h:mm A')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-tertiary text-center py-4">
                  No upcoming events
                </p>
              )}
            </div>
          </div>

          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <div className="card">
              {/* Calendar Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDate(moment(date).subtract(1, view === 'month' ? 'month' : 'week').toDate())}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-xl font-bold text-text-primary min-w-[200px] text-center">
                    {moment(date).format('MMMM YYYY')}
                  </h2>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDate(moment(date).add(1, view === 'month' ? 'month' : 'week').toDate())}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDate(new Date())}
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className={`btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setView('month')}
                  >
                    Month
                  </button>
                  <button
                    className={`btn btn-sm ${view === 'week' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setView('week')}
                  >
                    Week
                  </button>
                  <button
                    className={`btn btn-sm ${view === 'day' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setView('day')}
                  >
                    Day
                  </button>
                  <button
                    className={`btn btn-sm ${view === 'agenda' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setView('agenda')}
                  >
                    Agenda
                  </button>
                </div>
              </div>

              {/* BigCalendar */}
              <div className="calendar-container">
                <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={setDate}
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  onEventDrop={handleEventDrop}
                  selectable
                  resizable
                  style={{ height: 700 }}
                  views={['month', 'week', 'day', 'agenda']}
                  popup
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: event.resource.googleEventId ? '#6366f1' : '#71717a',
                      borderColor: event.resource.googleEventId ? '#4f46e5' : '#52525b',
                      color: '#ffffff'
                    }
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isCreating={isCreating}
          onClose={() => setSelectedEvent(null)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  )
}

// Event Modal Component
function EventModal({ 
  event, 
  isCreating, 
  onClose, 
  onSave, 
  onDelete 
}: { 
  event: EventModalData
  isCreating: boolean
  onClose: () => void
  onSave: (data: Partial<CalendarEvent>) => void
  onDelete: (id: string) => void
}) {
  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    startTime: moment(event.start).format('YYYY-MM-DDTHH:mm'),
    endTime: moment(event.end).format('YYYY-MM-DDTHH:mm'),
    location: event.location || '',
    attendees: event.attendees || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {isCreating ? 'Create Event' : 'Edit Event'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Title *
            </label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Event title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Start Time *
              </label>
              <Input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                End Time *
              </label>
              <Input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              className="input textarea"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add description..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Location
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Add location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Attendees
            </label>
            <Input
              value={formData.attendees}
              onChange={(e) => setFormData(prev => ({ ...prev, attendees: e.target.value }))}
              placeholder="email@example.com, another@example.com"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border-secondary">
            {!isCreating && (
              <Button 
                type="button" 
                variant="danger" 
                size="sm"
                onClick={() => onDelete(event.id)}
              >
                <Trash className="w-4 h-4" />
                Delete
              </Button>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <Check className="w-4 h-4" />
                {isCreating ? 'Create' : 'Save'}
              </Button>
            </div>
          </div>
        </form>

        {event.googleEventId && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2 text-sm text-primary">
            <ExternalLink className="w-4 h-4" />
            <span>Synced with Google Calendar</span>
          </div>
        )}
      </div>
    </div>
  )
}
