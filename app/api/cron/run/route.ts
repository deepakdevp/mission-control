import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    const { jobId, mode = 'now' } = await request.json()
    const output = execSync(`clawdbot cron run --job-id ${jobId} --mode ${mode} --json`, {
      encoding: 'utf-8',
      timeout: 5000,
    })
    const result = JSON.parse(output)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Failed to run cron job:', error)
    return NextResponse.json(
      { error: 'Failed to run cron job', details: error.message },
      { status: 500 }
    )
  }
}
