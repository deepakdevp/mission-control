import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

/**
 * Sync Google Calendar events to local database
 * Uses gog CLI for Google Calendar integration
 */
export async function POST(request: NextRequest) {
  try {
    const { action, eventData } = await request.json()

    switch (action) {
      case 'sync':
        return await syncFromGoogle()
      case 'create':
        return await createGoogleEvent(eventData)
      case 'update':
        return await updateGoogleEvent(eventData)
      case 'delete':
        return await deleteGoogleEvent(eventData)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync calendar', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Fetch events from Google Calendar and sync to local DB
 */
async function syncFromGoogle() {
  try {
    // Get events from Google Calendar for next 30 days
    const from = new Date().toISOString().split('T')[0]
    const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const output = execSync(
      `gog calendar list --from "${from}" --to "${to}" --json`,
      { encoding: 'utf-8' }
    )

    const googleEvents = JSON.parse(output)

    // Upsert events to database
    for (const event of googleEvents) {
      await prisma.calendarEvent.upsert({
        where: { googleEventId: event.id },
        create: {
          title: event.summary || 'Untitled',
          description: event.description || null,
          startTime: new Date(event.start.dateTime || event.start.date),
          endTime: new Date(event.end.dateTime || event.end.date),
          location: event.location || null,
          attendees: event.attendees ? JSON.stringify(event.attendees.map((a: any) => a.email)) : null,
          googleEventId: event.id
        },
        update: {
          title: event.summary || 'Untitled',
          description: event.description || null,
          startTime: new Date(event.start.dateTime || event.start.date),
          endTime: new Date(event.end.dateTime || event.end.date),
          location: event.location || null,
          attendees: event.attendees ? JSON.stringify(event.attendees.map((a: any) => a.email)) : null
        }
      })

      // Also write to ICS file
      await writeEventToICS(event)
    }

    return NextResponse.json({ 
      success: true, 
      synced: googleEvents.length,
      message: `Synced ${googleEvents.length} events from Google Calendar`
    })
  } catch (error) {
    console.error('Sync from Google failed:', error)
    throw error
  }
}

/**
 * Create event in Google Calendar and local DB
 */
async function createGoogleEvent(eventData: any) {
  try {
    const { title, date, time, duration } = eventData

    // Create in Google Calendar using gog
    const output = execSync(
      `gog calendar add "${title}" --date "${date}" --time "${time}" --duration "${duration || '1h'}" --json`,
      { encoding: 'utf-8' }
    )

    const googleEvent = JSON.parse(output)

    // Save to local database
    const event = await prisma.calendarEvent.create({
      data: {
        title: googleEvent.summary || title,
        description: eventData.description || null,
        startTime: new Date(googleEvent.start.dateTime || googleEvent.start.date),
        endTime: new Date(googleEvent.end.dateTime || googleEvent.end.date),
        location: eventData.location || null,
        attendees: eventData.attendees ? JSON.stringify(eventData.attendees) : null,
        googleEventId: googleEvent.id
      }
    })

    // Write to ICS file
    await writeEventToICS(googleEvent)

    return NextResponse.json({ success: true, event }, { status: 201 })
  } catch (error) {
    console.error('Create Google event failed:', error)
    throw error
  }
}

/**
 * Update event in Google Calendar and local DB
 */
async function updateGoogleEvent(eventData: any) {
  try {
    const { id, googleEventId, title } = eventData

    if (!googleEventId) {
      throw new Error('Google Event ID required for update')
    }

    // Update in Google Calendar
    execSync(
      `gog calendar update "${googleEventId}" --title "${title}"`,
      { encoding: 'utf-8' }
    )

    // Update in local database
    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title: eventData.title,
        description: eventData.description,
        startTime: eventData.startTime ? new Date(eventData.startTime) : undefined,
        endTime: eventData.endTime ? new Date(eventData.endTime) : undefined,
        location: eventData.location,
        attendees: eventData.attendees ? JSON.stringify(eventData.attendees) : undefined
      }
    })

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Update Google event failed:', error)
    throw error
  }
}

/**
 * Delete event from Google Calendar and local DB
 */
async function deleteGoogleEvent(eventData: any) {
  try {
    const { id, googleEventId } = eventData

    if (googleEventId) {
      // Delete from Google Calendar
      execSync(`gog calendar delete "${googleEventId}"`, { encoding: 'utf-8' })
    }

    // Delete from local database
    await prisma.calendarEvent.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete Google event failed:', error)
    throw error
  }
}

/**
 * Write event to ICS file in clawd/calendar/
 */
async function writeEventToICS(event: any) {
  try {
    const fs = require('fs').promises
    const path = require('path')

    const calendarDir = path.join(process.cwd(), '../clawd/calendar')
    
    // Create directory if it doesn't exist
    await fs.mkdir(calendarDir, { recursive: true })

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mission Control//Calendar//EN
BEGIN:VEVENT
UID:${event.id}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${new Date(event.start.dateTime || event.start.date).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(event.end.dateTime || event.end.date).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.summary || 'Untitled'}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`

    const filePath = path.join(calendarDir, `${event.id}.ics`)
    await fs.writeFile(filePath, icsContent)
  } catch (error) {
    console.error('Failed to write ICS file:', error)
    // Don't fail the whole operation if file write fails
  }
}
