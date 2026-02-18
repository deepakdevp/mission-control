import { NextRequest, NextResponse } from 'next/server'
import { execClawdbot } from '@/lib/clawdbot'

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json()
    const result = await execClawdbot(`cron remove --job-id ${jobId}`)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to remove cron job:', error)
    return NextResponse.json(
      { error: 'Failed to remove cron job' },
      { status: 500 }
    )
  }
}
