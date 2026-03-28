import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MEMORY_DIR = '/Users/deepak.panwar/clawd/memory'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const file = searchParams.get('file')

  try {
    if (file) {
      // Sanitize: prevent path traversal
      const safeName = file.replace(/[^a-zA-Z0-9.\-_]/g, '')
      if (!safeName.endsWith('.md')) {
        return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
      }
      const filePath = join(MEMORY_DIR, safeName)
      const content = readFileSync(filePath, 'utf8')
      return NextResponse.json({ name: safeName, content })
    }

    // List all .md files
    const files = readdirSync(MEMORY_DIR)
      .filter(f => f.endsWith('.md'))
      .map(name => {
        try {
          const stat = statSync(join(MEMORY_DIR, name))
          return { name, mtime: stat.mtime.toISOString(), size: stat.size }
        } catch {
          return { name, mtime: new Date().toISOString(), size: 0 }
        }
      })
      .sort((a, b) => b.mtime.localeCompare(a.mtime))

    return NextResponse.json({ files })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Memory unavailable: ${message}` }, { status: 503 })
  }
}
