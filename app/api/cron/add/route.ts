import { NextRequest, NextResponse } from 'next/server'
import { execClawdbot } from '@/lib/clawdbot'

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json()
    
    const args = [
      'cron', 'add',
      '--name', jobData.name,
      '--schedule', jobData.schedule.expr,
      '--tz', jobData.schedule.tz || 'Asia/Calcutta',
      '--session', jobData.sessionTarget,
      '--wake', jobData.wakeMode,
      '--text', jobData.payload.text
    ]

    if (jobData.enabled === false) {
      args.push('--disabled')
    }

    if (jobData.deleteAfterRun) {
      args.push('--delete-after-run')
    }

    const result = await execClawdbot(args.join(' '))
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to create cron job:', error)
    return NextResponse.json(
      { error: 'Failed to create cron job' },
      { status: 500 }
    )
  }
}
