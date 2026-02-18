import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json()
    
    const args = [
      'clawdbot',
      'cron', 'add',
      '--name', `"${jobData.name}"`,
      '--schedule', `"${jobData.schedule.expr}"`,
      '--tz', jobData.schedule.tz || 'Asia/Calcutta',
      '--session', jobData.sessionTarget,
      '--wake', jobData.wakeMode,
      '--text', `"${jobData.payload.text.replace(/"/g, '\\"')}"`,
      '--json'
    ]

    if (jobData.enabled === false) {
      args.push('--disabled')
    }

    if (jobData.deleteAfterRun) {
      args.push('--delete-after-run')
    }

    const output = execSync(args.join(' '), {
      encoding: 'utf-8',
      timeout: 5000,
    })
    const result = JSON.parse(output)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Failed to create cron job:', error)
    return NextResponse.json(
      { error: 'Failed to create cron job', details: error.message },
      { status: 500 }
    )
  }
}
