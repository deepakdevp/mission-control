/**
 * AI Prompt Parser for Mission Control
 * Parses natural language into structured task/event data using Clawdbot
 */

import { parseTaskWithClawdbot, parseEventWithClawdbot } from '@/lib/clawdbot'

interface TaskParseResult {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  tags: string[]
  assignedTo?: string
  projectId?: string
}

interface EventParseResult {
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  attendees: string[]
}

/**
 * Parse a task creation prompt using Clawdbot
 */
export async function parseTaskPrompt(userInput: string): Promise<TaskParseResult> {
  try {
    const parsed = await parseTaskWithClawdbot(userInput)
    return validateTaskResult(parsed)
  } catch (error) {
    console.error('Task parsing failed:', error)
    // Return a basic fallback
    return {
      title: userInput.slice(0, 100),
      priority: 'medium',
      tags: []
    }
  }
}

/**
 * Parse a calendar event prompt using Clawdbot
 */
export async function parseEventPrompt(userInput: string): Promise<EventParseResult> {
  try {
    const parsed = await parseEventWithClawdbot(userInput)
    return validateEventResult(parsed)
  } catch (error) {
    console.error('Event parsing failed:', error)
    // Return a basic fallback
    const oneHourLater = new Date(Date.now() + 3600000).toISOString()
    return {
      title: userInput.slice(0, 100),
      startTime: new Date().toISOString(),
      endTime: oneHourLater,
      attendees: []
    }
  }
}

function validateTaskResult(data: any): TaskParseResult {
  if (!data.title) {
    throw new Error('Task title is required')
  }
  
  const validPriorities = ['low', 'medium', 'high', 'urgent']
  if (data.priority && !validPriorities.includes(data.priority)) {
    data.priority = 'medium'
  }
  
  return {
    title: data.title,
    description: data.description || undefined,
    priority: data.priority || 'medium',
    dueDate: data.dueDate || undefined,
    tags: Array.isArray(data.tags) ? data.tags : [],
    assignedTo: data.assignedTo || undefined,
    projectId: data.projectId || undefined
  }
}

function validateEventResult(data: any): EventParseResult {
  if (!data.title || !data.startTime || !data.endTime) {
    throw new Error('Event title, start time, and end time are required')
  }
  
  return {
    title: data.title,
    description: data.description || undefined,
    startTime: data.startTime,
    endTime: data.endTime,
    location: data.location || undefined,
    attendees: Array.isArray(data.attendees) ? data.attendees : []
  }
}
