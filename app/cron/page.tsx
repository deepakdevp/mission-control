'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import {
  Clock,
  Plus,
  Play,
  Pause,
  Trash,
  Edit,
  X,
  Check,
  RefreshCw,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  Copy,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import moment from 'moment'

interface CronJob {
  id: string
  name: string
  enabled: boolean
  deleteAfterRun: boolean
  schedule: {
    kind: string
    expr: string
    tz?: string
  }
  sessionTarget: string
  wakeMode: string
  payload: {
    kind: string
    text: string
  }
  state: {
    nextRunAtMs: number
    lastRunAtMs?: number
    lastStatus?: string
    lastDurationMs?: number
    lastError?: string
  }
  createdAtMs: number
  updatedAtMs: number
}

interface CronJobRun {
  jobId: string
  runId: string
  startedAtMs: number
  finishedAtMs?: number
  status: 'running' | 'success' | 'failed'
  error?: string
  durationMs?: number
}

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [runs, setRuns] = useState<CronJobRun[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/cron/list')
      if (!response.ok) throw new Error('Failed to fetch cron jobs')
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Error fetching cron jobs:', error)
      toast.error('Failed to load cron jobs')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchJobRuns = async (jobId: string) => {
    try {
      const response = await fetch(`/api/cron/runs?jobId=${jobId}`)
      if (!response.ok) throw new Error('Failed to fetch job runs')
      const data = await response.json()
      setRuns(data.runs || [])
    } catch (error) {
      console.error('Error fetching job runs:', error)
      toast.error('Failed to load job runs')
    }
  }

  const handleCreateJob = async (jobData: Partial<CronJob>) => {
    try {
      const response = await fetch('/api/cron/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      })
      if (!response.ok) throw new Error('Failed to create job')
      await fetchJobs()
      toast.success('Cron job created')
      setIsCreating(false)
      setSelectedJob(null)
    } catch (error) {
      toast.error('Failed to create cron job')
    }
  }

  const handleUpdateJob = async (jobId: string, updates: Partial<CronJob>) => {
    try {
      const response = await fetch('/api/cron/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, ...updates })
      })
      if (!response.ok) throw new Error('Failed to update job')
      await fetchJobs()
      toast.success('Cron job updated')
      setSelectedJob(null)
    } catch (error) {
      toast.error('Failed to update cron job')
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this cron job?')) return
    
    try {
      const response = await fetch('/api/cron/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      })
      if (!response.ok) throw new Error('Failed to delete job')
      await fetchJobs()
      toast.success('Cron job deleted')
      setSelectedJob(null)
    } catch (error) {
      toast.error('Failed to delete cron job')
    }
  }

  const handleToggleJob = async (job: CronJob) => {
    await handleUpdateJob(job.id, { enabled: !job.enabled })
  }

  const handleRunJob = async (jobId: string) => {
    try {
      const response = await fetch('/api/cron/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, mode: 'now' })
      })
      if (!response.ok) throw new Error('Failed to run job')
      toast.success('Cron job triggered')
      setTimeout(fetchJobs, 1000) // Refresh after a second
    } catch (error) {
      toast.error('Failed to run cron job')
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!job.name.toLowerCase().includes(query) && 
          !job.payload.text.toLowerCase().includes(query)) {
        return false
      }
    }
    if (filterEnabled !== null && job.enabled !== filterEnabled) {
      return false
    }
    return true
  })

  const activeJobs = jobs.filter(j => j.enabled).length
  const totalRuns = jobs.reduce((sum, j) => sum + (j.state.lastRunAtMs ? 1 : 0), 0)
  const failedJobs = jobs.filter(j => j.state.lastStatus === 'failed').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base">
        <Loading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="border-b border-border-secondary bg-bg-elevated/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="breadcrumb mb-2">
                <span className="breadcrumb-item">Automation</span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-item">Cron Jobs</span>
              </div>
              <h1 className="text-4xl font-bold text-gradient">Cron Jobs</h1>
              <p className="text-text-secondary mt-2">
                Manage scheduled tasks and automation
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={fetchJobs}>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button variant="primary" size="sm" onClick={() => {
                setIsCreating(true)
                setSelectedJob({
                  id: '',
                  name: '',
                  enabled: true,
                  deleteAfterRun: false,
                  schedule: { kind: 'cron', expr: '0 10 * * *' },
                  sessionTarget: 'main',
                  wakeMode: 'now',
                  payload: { kind: 'systemEvent', text: '' },
                  state: { nextRunAtMs: 0 },
                  createdAtMs: Date.now(),
                  updatedAtMs: Date.now()
                })
              }}>
                <Plus className="w-4 h-4" />
                New job
              </Button>
            </div>
          </div>

          {/* Search & Stats */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span>{activeJobs} active</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-text-tertiary"></div>
                <div className="flex items-center gap-1 text-text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>{totalRuns} runs</span>
                </div>
                {failedJobs > 0 && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-text-tertiary"></div>
                    <div className="flex items-center gap-1 text-danger">
                      <XCircle className="w-4 h-4" />
                      <span>{failedJobs} failed</span>
                    </div>
                  </>
                )}
              </div>

              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 card-flat animate-slide-up">
              <div className="flex items-center gap-4">
                <span className="text-sm text-text-secondary font-medium">Status:</span>
                <div className="flex items-center gap-2">
                  <button
                    className={`btn btn-sm ${filterEnabled === null ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setFilterEnabled(null)}
                  >
                    All
                  </button>
                  <button
                    className={`btn btn-sm ${filterEnabled === true ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setFilterEnabled(true)}
                  >
                    Enabled
                  </button>
                  <button
                    className={`btn btn-sm ${filterEnabled === false ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setFilterEnabled(false)}
                  >
                    Disabled
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job, idx) => (
              <div 
                key={job.id} 
                className="card group animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary truncate">
                        {job.name}
                      </h3>
                      <span className={`badge ${job.enabled ? 'badge-success' : 'badge-default'}`}>
                        {job.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      {job.state.lastStatus && (
                        <span className={`badge ${
                          job.state.lastStatus === 'success' ? 'badge-success' :
                          job.state.lastStatus === 'failed' ? 'badge-danger' :
                          'badge-warning'
                        }`}>
                          {job.state.lastStatus}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-xs">{job.schedule.expr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Next: {moment(job.state.nextRunAtMs).fromNow()}</span>
                      </div>
                      {job.state.lastRunAtMs && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Last: {moment(job.state.lastRunAtMs).fromNow()}</span>
                        </div>
                      )}
                      {job.state.lastDurationMs && (
                        <div className="text-text-tertiary">
                          ({job.state.lastDurationMs}ms)
                        </div>
                      )}
                    </div>

                    <div className="mt-3 text-sm text-text-tertiary line-clamp-2">
                      {job.payload.text}
                    </div>

                    {job.state.lastError && (
                      <div className="mt-3 p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-start gap-2 text-sm text-danger">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="font-mono text-xs">{job.state.lastError}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRunJob(job.id)}
                      title="Run now"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleJob(job)}
                      title={job.enabled ? 'Disable' : 'Enable'}
                    >
                      {job.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedJob(job)
                        setIsCreating(false)
                      }}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                      title="Delete"
                    >
                      <Trash className="w-4 h-4 text-danger" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Clock className="empty-state-icon" />
            <div className="empty-state-title">
              {searchQuery || filterEnabled !== null ? 'No jobs found' : 'No cron jobs yet'}
            </div>
            <div className="empty-state-description">
              {searchQuery || filterEnabled !== null 
                ? 'Try adjusting your search or filters'
                : 'Create your first scheduled task to automate your workflow'
              }
            </div>
            {!searchQuery && filterEnabled === null && (
              <Button variant="primary" className="mt-4" onClick={() => {
                setIsCreating(true)
                setSelectedJob({
                  id: '',
                  name: '',
                  enabled: true,
                  deleteAfterRun: false,
                  schedule: { kind: 'cron', expr: '0 10 * * *' },
                  sessionTarget: 'main',
                  wakeMode: 'now',
                  payload: { kind: 'systemEvent', text: '' },
                  state: { nextRunAtMs: 0 },
                  createdAtMs: Date.now(),
                  updatedAtMs: Date.now()
                })
              }}>
                <Plus className="w-4 h-4" />
                Create cron job
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Job Modal */}
      {selectedJob && (
        <CronJobModal
          job={selectedJob}
          isCreating={isCreating}
          onClose={() => {
            setSelectedJob(null)
            setIsCreating(false)
          }}
          onSave={isCreating ? handleCreateJob : (data) => handleUpdateJob(selectedJob.id, data)}
        />
      )}
    </div>
  )
}

// Cron Job Modal Component
function CronJobModal({
  job,
  isCreating,
  onClose,
  onSave
}: {
  job: CronJob
  isCreating: boolean
  onClose: () => void
  onSave: (data: Partial<CronJob>) => void
}) {
  const [formData, setFormData] = useState({
    name: job.name,
    enabled: job.enabled,
    cronExpr: job.schedule.expr,
    timezone: job.schedule.tz || 'Asia/Calcutta',
    sessionTarget: job.sessionTarget,
    wakeMode: job.wakeMode,
    payloadText: job.payload.text,
    deleteAfterRun: job.deleteAfterRun
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      enabled: formData.enabled,
      deleteAfterRun: formData.deleteAfterRun,
      schedule: {
        kind: 'cron',
        expr: formData.cronExpr,
        tz: formData.timezone
      },
      sessionTarget: formData.sessionTarget,
      wakeMode: formData.wakeMode,
      payload: {
        kind: 'systemEvent',
        text: formData.payloadText
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {isCreating ? 'Create Cron Job' : 'Edit Cron Job'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Job Name *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Daily morning brief"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Cron Expression * 
              <a 
                href="https://crontab.guru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-primary text-xs hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                crontab.guru
              </a>
            </label>
            <Input
              required
              value={formData.cronExpr}
              onChange={(e) => setFormData(prev => ({ ...prev, cronExpr: e.target.value }))}
              placeholder="0 10 * * * (10:00 AM daily)"
              className="font-mono"
            />
            <p className="text-xs text-text-tertiary mt-1">
              Examples: 0 10 * * * (daily 10am), 0 */2 * * * (every 2 hours), 0 9 * * 1-5 (weekdays 9am)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Timezone
              </label>
              <Input
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                placeholder="Asia/Calcutta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Session Target
              </label>
              <Input
                value={formData.sessionTarget}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionTarget: e.target.value }))}
                placeholder="main"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Task / Event Text *
            </label>
            <textarea
              required
              className="input textarea"
              value={formData.payloadText}
              onChange={(e) => setFormData(prev => ({ ...prev, payloadText: e.target.value }))}
              placeholder="Generate my daily morning brief..."
              rows={6}
            />
            <p className="text-xs text-text-tertiary mt-1">
              This text will be sent to Clawdbot when the job runs
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm text-text-secondary">Enabled</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.deleteAfterRun}
                onChange={(e) => setFormData(prev => ({ ...prev, deleteAfterRun: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm text-text-secondary">Delete after run (one-time)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-secondary">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <Check className="w-4 h-4" />
              {isCreating ? 'Create' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
