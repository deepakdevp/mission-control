import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d)
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(d)
}

export function formatDueDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = d.getTime() - now.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 0) return `Overdue by ${Math.abs(diffInDays)} days`
  if (diffInDays === 0) return 'Due today'
  if (diffInDays === 1) return 'Due tomorrow'
  if (diffInDays < 7) return `Due in ${diffInDays} days`
  if (diffInDays < 30) return `Due in ${Math.floor(diffInDays / 7)} weeks`
  
  return `Due ${formatDate(d)}`
}

export function parseRelativeDate(input: string): Date | null {
  const now = new Date()
  const lower = input.toLowerCase().trim()
  
  if (lower === 'today') return now
  if (lower === 'tomorrow') {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }
  if (lower === 'yesterday') {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday
  }
  
  // "in X days"
  const inDaysMatch = lower.match(/in (\d+) days?/)
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1])
    const future = new Date(now)
    future.setDate(future.getDate() + days)
    return future
  }
  
  // "next monday", "next friday", etc.
  const nextDayMatch = lower.match(/next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/)
  if (nextDayMatch) {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const targetDay = daysOfWeek.indexOf(nextDayMatch[1])
    const currentDay = now.getDay()
    let daysUntil = targetDay - currentDay
    if (daysUntil <= 0) daysUntil += 7
    const nextDate = new Date(now)
    nextDate.setDate(nextDate.getDate() + daysUntil)
    return nextDate
  }
  
  // Try parsing as ISO date
  try {
    const parsed = new Date(input)
    if (!isNaN(parsed.getTime())) return parsed
  } catch (e) {
    // Ignore parse errors
  }
  
  return null
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function parseTags(tagsString: string | null): string[] {
  if (!tagsString) return []
  try {
    return JSON.parse(tagsString)
  } catch (e) {
    return []
  }
}

export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags)
}
