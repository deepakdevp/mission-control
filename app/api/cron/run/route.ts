import { NextRequest, NextResponse } from 'next/server'
import { execClawdbot } from '@/lib/clawdbot'

export async function POST(request: NextRequest) {
  try {
    const { jobId, mode = 'now' } = await request.json()
    const result = await execClawdbot(`cron run --job-id ${jobId} --mode ${mode}`)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to run cron job:', error)
    return NextResponse.json(
      { error: 'Failed to run cron job' },
      { status: 500 }
    )
  }
}
