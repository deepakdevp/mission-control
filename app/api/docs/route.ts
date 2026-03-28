import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DOCS_DIR = '/Users/deepak.panwar/clawd/docs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const file = searchParams.get('file')

  try {
    if (file) {
      // Sanitize: prevent path traversal
      const safeName = file.replace(/[^a-zA-Z0-9.\-_ ]/g, '')
      if (!safeName.endsWith('.md')) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
      }
      const filePath = join(DOCS_DIR, safeName)
      const content = readFileSync(filePath, 'utf8')
      return NextResponse.json({ name: safeName, content })
    }

    // List all .md files (non-recursive)
    const files = readdirSync(DOCS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(name => {
        try {
          const stat = statSync(join(DOCS_DIR, name))
          return { name, mtime: stat.mtime.toISOString(), size: stat.size, path: name }
        } catch {
          return { name, mtime: new Date().toISOString(), size: 0, path: name }
        }
      })
      .sort((a, b) => b.mtime.localeCompare(a.mtime))

    return NextResponse.json({ files })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Docs unavailable: ${message}` }, { status: 503 })
  }
}
