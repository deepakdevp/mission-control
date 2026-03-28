'use client'

import { useState, useEffect } from 'react'
import { ApprovalCard } from '@/components/approval-card'
import { Loading } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Shield, Filter } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { toast } from 'sonner'

interface Approval {
  id: string
  title: string
  description?: string | null
  status: string
  requestedBy: string
  requestedAt: string
  respondedAt?: string | null
  response?: string | null
  notes?: string | null
  metadata?: string | null
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      const response = await fetch('/api/approvals')
      if (!response.ok) throw new Error('Failed to fetch approvals')
      const data = await response.json()
      setApprovals(data)
    } catch (error) {
      console.error('Error fetching approvals:', error)
      toast.error('Failed to load approvals')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string, notes?: string) => {
    try {
      const response = await fetch(`/api/approvals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          response: 'approved',
          notes: notes || null
        })
      })

      if (!response.ok) throw new Error('Failed to approve')

      const updated = await response.json()
      setApprovals(prev => prev.map(a => a.id === id ? updated : a))
      toast.success('Approval granted')
    } catch (error) {
      console.error('Error approving:', error)
      toast.error('Failed to approve')
      throw error
    }
  }

  const handleDeny = async (id: string, notes?: string) => {
    try {
      const response = await fetch(`/api/approvals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'denied',
          response: 'denied',
          notes: notes || null
        })
      })

      if (!response.ok) throw new Error('Failed to deny')

      const updated = await response.json()
      setApprovals(prev => prev.map(a => a.id === id ? updated : a))
      toast.success('Approval denied')
    } catch (error) {
      console.error('Error denying:', error)
      toast.error('Failed to deny')
      throw error
    }
  }

  const filteredApprovals = approvals.filter(approval => {
    if (statusFilter === 'all') return true
    return approval.status === statusFilter
  })

  const pendingCount = approvals.filter(a => a.status === 'pending').length

  if (isLoading) {
    return <Loading text="Loading approvals..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={`Approvals${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}`}
        description="Review and approve high-risk actions before they're executed"
        actions={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        }
      />
      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Approvals List */}
        {filteredApprovals.length > 0 ? (
          <div className="space-y-4">
            {filteredApprovals.map(approval => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onApprove={handleApprove}
                onDeny={handleDeny}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Shield}
            title={statusFilter === 'all' ? 'No approval requests' : `No ${statusFilter} approvals`}
            description={
              statusFilter === 'all'
                ? "When Clawdbot detects a high-risk action, it will request your approval here."
                : `No approvals with status: ${statusFilter}`
            }
          />
        )}
      </div>
    </div>
  )
}
