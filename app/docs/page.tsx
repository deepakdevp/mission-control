'use client'

import { useState, useEffect } from 'react'
import { FileText, ChevronDown, ChevronRight, Clock, BookOpen } from 'lucide-react'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

interface DocFile {
  name: string
  mtime: string
  size: number
  path: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  return `${(bytes / 1024).toFixed(1)}KB`
}

function DocCard({ doc }: { doc: DocFile }) {
  const [expanded, setExpanded] = useState(false)
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (!expanded && content === null) {
      setLoading(true)
      try {
        const res = await fetch(`/api/docs?file=${encodeURIComponent(doc.name)}`)
        const data = await res.json()
        setContent(data.content || 'No content')
      } catch {
        setContent('Failed to load file content.')
      }
      setLoading(false)
    }
    setExpanded(v => !v)
  }

  return (
    <div
      className="bg-white border border-[#EEEEEE] rounded-[12px] overflow-hidden transition-shadow"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#F9FAFB] transition-colors"
        aria-expanded={expanded}
      >
        <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-[var(--primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#1A1A2E] text-sm truncate">{doc.name}</p>
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(doc.mtime)}
            </span>
            <span>{formatSize(doc.size)}</span>
          </div>
        </div>
        {expanded
          ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
        }
      </button>

      {expanded && (
        <div className="border-t border-[#F3F4F6] px-5 py-4">
          {loading ? (
            <SkeletonText lines={5} />
          ) : (
            <pre className="text-xs text-[#374151] whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-[500px]">
              {content}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

export default function DocsPage() {
  const [docs, setDocs] = useState<DocFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/docs')
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setDocs(data.files || [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      {/* Sticky Header */}
      <div className="bg-white border-b border-[#EEEEEE] sticky top-0 z-40">
        <div className="h-14 px-6 flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#1A1A2E] leading-none">Docs</h1>
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <BookOpen className="w-4 h-4" />
            <span>Read-only</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Documentation and reference files from your workspace.
        </p>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#EEEEEE] rounded-[12px] p-4 animate-pulse flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-2.5 w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-[12px] p-5 text-red-600 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && docs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-[var(--text-muted)] mb-3 opacity-40" />
            <p className="text-base font-semibold text-[#1A1A2E]">No docs found</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Documentation files will appear here.</p>
          </div>
        )}

        {!loading && !error && docs.length > 0 && (
          <div className="space-y-3">
            {docs.map(doc => (
              <DocCard key={doc.name} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
