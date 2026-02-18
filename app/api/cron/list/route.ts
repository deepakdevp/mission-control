import { NextResponse } from 'next/server'
import { callClawdbot } from '@/lib/clawdbot'

export async function GET() {
  try {
    const result = await callClawdbot('cron list')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to list cron jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cron jobs' },
      { status: 500 }
    )
  }
}
