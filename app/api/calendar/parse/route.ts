import { NextRequest, NextResponse } from 'next/server'
import { parseEventPrompt } from '@/lib/ai/prompt-parser'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const parsed = await parseEventPrompt(prompt)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Event parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse event prompt' },
      { status: 500 }
    )
  }
}
