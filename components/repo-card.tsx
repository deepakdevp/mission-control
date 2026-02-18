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
import { GlassCard, GlassCardHeader, GlassCardContent } from './ui/glass-card'
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
  issues?: any[]
  prs?: any[]
  commits?: any[]
  contributors?: any[]
}

interface RepoCardProps {
  repo: RepoData
}

export function RepoCard({ repo }: RepoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const issueCount = repo.issues?.filter(i => i.state === 'OPEN').length || 0
  const prCount = repo.prs?.filter(pr => pr.state === 'OPEN').length || 0

  return (
    <GlassCard className="animate-fade-in">
      <GlassCardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Circle className="w-3 h-3 text-primary fill-current" />
              <h3 className="text-lg font-semibold text-text-primary truncate">
                {repo.name}
              </h3>
            </div>

            {repo.description && (
              <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                {repo.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-text-tertiary">
              {repo.primaryLanguage && (
                <span className="flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-current" />
                  {repo.primaryLanguage}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {repo.stargazerCount}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="w-4 h-4" />
                {repo.forkCount}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs">
              {issueCount > 0 && (
                <span className="flex items-center gap-1 text-danger">
                  <AlertCircle className="w-3 h-3" />
                  {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
                </span>
              )}
              {prCount > 0 && (
                <span className="flex items-center gap-1 text-success">
                  <GitPullRequest className="w-3 h-3" />
                  {prCount} {prCount === 1 ? 'PR' : 'PRs'}
                </span>
              )}
              <span className="text-text-tertiary">
                Updated {formatRelativeTime(repo.pushedAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </GlassCardHeader>

      {isExpanded && (
        <GlassCardContent className="border-t border-white/10 pt-6 space-y-6">
          {/* Open Issues */}
          {repo.issues && repo.issues.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Open Issues ({issueCount})
              </h4>
              <div className="space-y-2">
                {repo.issues.slice(0, 5).map((issue) => (
                  <a
                    key={issue.number}
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary">
                          #{issue.number} {issue.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-text-tertiary">
                            by {issue.author} • {formatRelativeTime(issue.createdAt)}
                          </span>
                          {issue.labels?.length > 0 && (
                            <div className="flex gap-1">
                              {issue.labels.slice(0, 3).map((label: string) => (
                                <span key={label} className="px-2 py-0.5 bg-white/10 rounded text-xs">
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Open Pull Requests */}
          {repo.prs && repo.prs.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <GitPullRequest className="w-4 h-4" />
                Open Pull Requests ({prCount})
              </h4>
              <div className="space-y-2">
                {repo.prs.slice(0, 5).map((pr) => (
                  <a
                    key={pr.number}
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary">
                          #{pr.number} {pr.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-text-tertiary">
                            by {pr.author} • {formatRelativeTime(pr.createdAt)}
                          </span>
                          {pr.reviewDecision && (
                            <Badge variant={pr.reviewDecision === 'APPROVED' ? 'done' : 'in_progress'}>
                              {pr.reviewDecision.toLowerCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Recent Commits */}
          {repo.commits && repo.commits.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <GitCommit className="w-4 h-4" />
                Recent Commits
              </h4>
              <div className="space-y-2">
                {repo.commits.slice(0, 5).map((commit) => (
                  <div key={commit.sha} className="p-3 bg-white/5 rounded-lg">
                    <div className="text-sm text-text-primary font-mono line-clamp-1">
                      {commit.message.split('\n')[0]}
                    </div>
                    <div className="text-xs text-text-tertiary mt-1">
                      {commit.author} • {formatRelativeTime(commit.date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contributors */}
          {repo.contributors && repo.contributors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Contributors
              </h4>
              <div className="flex gap-2 flex-wrap">
                {repo.contributors.slice(0, 10).map((contributor) => (
                  <div
                    key={contributor.login}
                    className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
                    title={`${contributor.login} - ${contributor.contributions} contributions`}
                  >
                    <img
                      src={contributor.avatarUrl}
                      alt={contributor.login}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-xs text-text-secondary">{contributor.login}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCardContent>
      )}
    </GlassCard>
  )
}
