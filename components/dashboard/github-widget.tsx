'use client'

import { useEffect, useState } from 'react'
import { FolderGit2, ArrowUpRight, GitCommit } from 'lucide-react'
import Link from 'next/link'

interface Commit {
  sha: string
  message: string
  date: string
  repo: string
}

interface Repo {
  name: string
  url: string
  commits?: Array<{
    sha: string
    commit: { message: string; author: { date: string } }
  }>
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function GithubWidget() {
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    fetch('/api/github/repos?detailed=true', { signal: controller.signal })
      .then(r => r.json())
      .then((repos: Repo[]) => {
        clearTimeout(timeout)
        if (!Array.isArray(repos)) {
          setLoading(false)
          return
        }
        const allCommits: Commit[] = []
        repos.forEach((repo) => {
          ;(repo.commits || []).forEach((c) => {
            allCommits.push({
              sha: c.sha,
              message: c.commit.message.split('\n')[0],
              date: c.commit.author.date,
              repo: repo.name,
            })
          })
        })
        allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setCommits(allCommits.slice(0, 5))
        setLoading(false)
      })
      .catch(() => {
        clearTimeout(timeout)
        setLoading(false)
      })

    // Fallback: always stop loading after 3 seconds
    const fallback = setTimeout(() => setLoading(false), 3000)

    return () => {
      controller.abort()
      clearTimeout(timeout)
      clearTimeout(fallback)
    }
  }, [])

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-20 bg-gray-100 rounded" />
        <div className="flex-1 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-2 w-1/3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] uppercase tracking-wide text-[var(--text-muted)] font-medium">GitHub</span>
        <Link href="/projects" className="text-[var(--primary)] hover:underline text-xs flex items-center gap-0.5">
          View <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex-1 space-y-2.5">
        {commits.length > 0 ? (
          commits.map((commit) => (
            <div key={commit.sha} className="flex items-start gap-2 text-sm">
              <GitCommit className="w-3.5 h-3.5 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[var(--text-primary)] text-[13px]">{commit.message}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                  <span className="font-medium text-[var(--primary)]">{commit.repo}</span>
                  <span>·</span>
                  <span>{timeAgo(commit.date)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <FolderGit2 className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No recent commits</p>
            <p className="text-xs text-gray-400 mt-1">Connect GitHub to see activity</p>
          </div>
        )}
      </div>
    </div>
  )
}
