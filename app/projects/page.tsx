'use client'

import { useState, useEffect } from 'react'
import { RepoCard } from '@/components/repo-card'
import { Loading } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FolderGit2, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'

interface Repo {
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

export default function ProjectsPage() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRepos()
  }, [])

  const fetchRepos = async (detailed = false) => {
    const loading = detailed ? setIsRefreshing : setIsLoading
    loading(true)

    try {
      const url = `/api/github/repos${detailed ? '?detailed=true' : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }

      const data = await response.json()
      setRepos(data)
      
      if (detailed) {
        toast.success('Repositories refreshed')
      }
    } catch (error) {
      console.error('Error fetching repos:', error)
      toast.error('Failed to load repositories. Make sure gh CLI is installed and authenticated.')
    } finally {
      loading(false)
    }
  }

  const handleRefresh = () => {
    fetchRepos(true)
  }

  const filteredRepos = repos.filter(repo => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      repo.name.toLowerCase().includes(query) ||
      repo.description?.toLowerCase().includes(query) ||
      repo.primaryLanguage?.toLowerCase().includes(query)
    )
  })

  if (isLoading) {
    return <Loading text="Loading GitHub repositories..." />
  }

  return (
    <div className="min-h-screen bg-bg-base p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Projects</h1>
            <p className="text-text-secondary">
              GitHub repositories with issues, PRs, and activity
            </p>
          </div>

          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Repositories Grid */}
        {filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRepos.map((repo) => (
              <RepoCard key={repo.url} repo={repo} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderGit2}
            title={searchQuery ? 'No repositories match your search' : 'No repositories found'}
            description={
              searchQuery 
                ? 'Try a different search term'
                : 'Make sure you have GitHub CLI (gh) installed and authenticated. Run: gh auth login'
            }
          />
        )}
      </div>
    </div>
  )
}
