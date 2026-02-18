import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function GET() {
  try {
    const output = execSync('clawdbot cron list --json', {
      encoding: 'utf-8',
      timeout: 5000,
    })
    const result = JSON.parse(output)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Failed to list cron jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cron jobs', details: error.message },
      { status: 500 }
    )
  }
}
