import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    const { jobId, ...updates } = await request.json()
    
    const args = ['clawdbot', 'cron', 'update', '--job-id', jobId]

    if (updates.name) {
      args.push('--name', `"${updates.name}"`)
    }

    if (updates.schedule) {
      args.push('--schedule', `"${updates.schedule.expr}"`)
      if (updates.schedule.tz) {
        args.push('--tz', updates.schedule.tz)
      }
    }

    if (updates.payload?.text) {
      args.push('--text', `"${updates.payload.text.replace(/"/g, '\\"')}"`)
    }

    if (updates.sessionTarget) {
      args.push('--session', updates.sessionTarget)
    }

    if (typeof updates.enabled === 'boolean') {
      args.push(updates.enabled ? '--enabled' : '--disabled')
    }

    if (typeof updates.deleteAfterRun === 'boolean') {
      args.push(updates.deleteAfterRun ? '--delete-after-run' : '--no-delete-after-run')
    }

    args.push('--json')

    const output = execSync(args.join(' '), {
      encoding: 'utf-8',
      timeout: 5000,
    })
    const result = JSON.parse(output)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Failed to update cron job:', error)
    return NextResponse.json(
      { error: 'Failed to update cron job', details: error.message },
      { status: 500 }
    )
  }
}
