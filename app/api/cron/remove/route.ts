import { NextRequest, NextResponse } from 'next/server'
import { callClawdbot } from '@/lib/clawdbot'

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json()
    const result = await callClawdbot(`cron remove --job-id ${jobId}`)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to remove cron job:', error)
    return NextResponse.json(
      { error: 'Failed to remove cron job' },
      { status: 500 }
    )
  }
}
