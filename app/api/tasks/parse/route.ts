import { NextRequest, NextResponse } from 'next/server'
import { parseTaskPrompt } from '@/lib/ai/prompt-parser'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const parsed = await parseTaskPrompt(prompt)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Task parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse task prompt' },
      { status: 500 }
    )
  }
}
