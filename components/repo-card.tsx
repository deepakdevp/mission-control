'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Star,
  GitFork,
  Circle,
  ExternalLink,
  GitPullRequest,
  AlertCircle,
  GitCommit,
  Users
} from 'lucide-react'
import { Badge } from './ui/badge'
import { cn, formatRelativeTime } from '@/lib/utils'

interface RepoData {
  name: string
  description: string | null
  url: string
  stargazerCount: number
  forkCount: number
  primaryLanguage: string | null
  pushedAt: string
  issues?: Array<{ number: number; title: string; url: string; author: string; createdAt: string; labels?: string[] }>
  prs?: Array<{ number: number; title: string; url: string; author: string; createdAt: string; reviewDecision?: string }>
  commits?: Array<{ sha: string; message: string; author: string; date: string }>
  contributors?: Array<{ login: string; avatarUrl: string; contributions: number }>
}

interface RepoCardProps {
  repo: RepoData
}

export function RepoCard({ repo }: RepoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const issueCount = repo.issues?.filter(i => (i as unknown as { state?: string }).state === 'OPEN').length || repo.issues?.length || 0
  const prCount = repo.prs?.filter(pr => (pr as unknown as { state?: string }).state === 'OPEN').length || repo.prs?.length || 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      {/* Card Header */}
      <div className="p-5 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Circle className="w-2.5 h-2.5 text-blue-600 fill-blue-600 flex-shrink-0" />
              <h3 className="text-base font-semibold text-gray-900 truncate">{repo.name}</h3>
            </div>

            {repo.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{repo.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400">
              {repo.primaryLanguage && (
                <span className="flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-current" />
                  {repo.primaryLanguage}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                {repo.stargazerCount}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="w-3.5 h-3.5" />
                {repo.forkCount}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs">
              {issueCount > 0 && (
                <span className="flex items-center gap-1 text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
                </span>
              )}
              {prCount > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <GitPullRequest className="w-3 h-3" />
                  {prCount} {prCount === 1 ? 'PR' : 'PRs'}
                </span>
              )}
              <span className="text-gray-400">Updated {formatRelativeTime(repo.pushedAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-5">
          {/* Open Issues */}
          {repo.issues && repo.issues.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Open Issues ({issueCount})
              </h4>
              <div className="space-y-2">
                {repo.issues.slice(0, 5).map(issue => (
                  <a
                    key={issue.number}
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">#{issue.number} {issue.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">by {issue.author} · {formatRelativeTime(issue.createdAt)}</span>
                      {issue.labels && issue.labels.slice(0, 3).map(label => (
                        <span key={label} className="px-1.5 py-0.5 bg-gray-200 rounded text-xs text-gray-600">{label}</span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Open PRs */}
          {repo.prs && repo.prs.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
                <GitPullRequest className="w-3.5 h-3.5" />
                Open Pull Requests ({prCount})
              </h4>
              <div className="space-y-2">
                {repo.prs.slice(0, 5).map(pr => (
                  <a
                    key={pr.number}
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">#{pr.number} {pr.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">by {pr.author} · {formatRelativeTime(pr.createdAt)}</span>
                      {pr.reviewDecision && (
                        <Badge variant={pr.reviewDecision === 'APPROVED' ? 'done' : 'in_progress'}>
                          {pr.reviewDecision.toLowerCase()}
                        </Badge>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Recent Commits */}
          {repo.commits && repo.commits.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5" />
                Recent Commits
              </h4>
              <div className="space-y-2">
                {repo.commits.slice(0, 5).map(commit => (
                  <div key={commit.sha} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-900 font-mono line-clamp-1">{commit.message.split('\n')[0]}</div>
                    <div className="text-xs text-gray-400 mt-1">{commit.author} · {formatRelativeTime(commit.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contributors */}
          {repo.contributors && repo.contributors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Contributors
              </h4>
              <div className="flex gap-2 flex-wrap">
                {repo.contributors.slice(0, 10).map(contributor => (
                  <div
                    key={contributor.login}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    title={`${contributor.login} - ${contributor.contributions} contributions`}
                  >
                    <img src={contributor.avatarUrl} alt={contributor.login} className="w-6 h-6 rounded-full" />
                    <span className="text-xs text-gray-600">{contributor.login}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
