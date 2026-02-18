import { NextResponse } from 'next/server'
import { execClawdbot } from '@/lib/clawdbot'

export async function GET() {
  try {
    const result = await execClawdbot('cron list')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to list cron jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cron jobs' },
      { status: 500 }
    )
  }
}
