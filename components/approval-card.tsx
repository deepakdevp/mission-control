'use client'

import { useState } from 'react'
import { 
  AlertTriangle, 
  FileX, 
  GitBranch, 
  Mail, 
  DollarSign,
  Shield,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { GlassCard, GlassCardHeader, GlassCardContent } from './ui/glass-card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

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

interface ApprovalCardProps {
  approval: Approval
  onApprove: (id: string, notes?: string) => Promise<void>
  onDeny: (id: string, notes?: string) => Promise<void>
}

const ACTION_ICONS = {
  delete: FileX,
  git: GitBranch,
  email: Mail,
  financial: DollarSign,
  system: Shield,
  upload: Upload,
  default: AlertTriangle
}

export function ApprovalCard({ approval, onApprove, onDeny }: ApprovalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const metadata = approval.metadata ? JSON.parse(approval.metadata) : {}
  const actionType = metadata.action || 'default'
  const Icon = ACTION_ICONS[actionType as keyof typeof ACTION_ICONS] || ACTION_ICONS.default

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await onApprove(approval.id, notes)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeny = async () => {
    setIsProcessing(true)
    try {
      await onDeny(approval.id, notes)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = () => {
    switch (approval.status) {
      case 'approved':
        return <Badge variant="done">Approved</Badge>
      case 'denied':
        return <Badge variant="blocked">Denied</Badge>
      default:
        return <Badge variant="in_progress">Pending</Badge>
    }
  }

  const getRecommendationColor = () => {
    switch (metadata.recommended) {
      case 'approve':
        return 'text-success'
      case 'review-carefully':
        return 'text-warning'
      case 'approve-with-caution':
        return 'text-warning'
      default:
        return 'text-text-secondary'
    }
  }

  return (
    <GlassCard className="animate-fade-in">
      <GlassCardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn(
              'p-2 rounded-lg',
              approval.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-white/10 text-text-secondary'
            )}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-text-primary truncate">
                  {approval.title}
                </h3>
                {getStatusBadge()}
              </div>
              
              {approval.description && (
                <p className="text-sm text-text-secondary line-clamp-2">
                  {approval.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-xs text-text-tertiary">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(approval.requestedAt)}
                </span>
                <span>Requested by {approval.requestedBy}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/10 rounded transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </GlassCardHeader>

      {isExpanded && (
        <GlassCardContent className="space-y-4 border-t border-white/10 pt-4">
          {/* Metadata Details */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-text-primary">Context:</h4>
              <div className="space-y-2 text-sm">
                {metadata.files && (
                  <div>
                    <span className="text-text-tertiary">Files:</span>
                    <ul className="mt-1 space-y-1 ml-4">
                      {metadata.files.map((file: string, i: number) => (
                        <li key={i} className="text-text-secondary font-mono text-xs">
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {metadata.totalSize && (
                  <div>
                    <span className="text-text-tertiary">Total size: </span>
                    <span className="text-text-secondary">{metadata.totalSize}</span>
                  </div>
                )}
                
                {metadata.lastAccessed && (
                  <div>
                    <span className="text-text-tertiary">Last accessed: </span>
                    <span className="text-text-secondary">{metadata.lastAccessed}</span>
                  </div>
                )}
                
                {metadata.branch && (
                  <div>
                    <span className="text-text-tertiary">Branch: </span>
                    <span className="text-text-secondary font-mono">{metadata.branch}</span>
                  </div>
                )}
                
                {metadata.commits && (
                  <div>
                    <span className="text-text-tertiary">Commits affected: </span>
                    <span className="text-text-secondary">{metadata.commits}</span>
                  </div>
                )}
                
                {metadata.reversible !== undefined && (
                  <div>
                    <span className="text-text-tertiary">Reversible: </span>
                    <span className={metadata.reversible ? 'text-success' : 'text-danger'}>
                      {metadata.reversible ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Reasoning */}
          {metadata.reasoning && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-primary">AI Reasoning:</h4>
              <p className="text-sm text-text-secondary bg-white/5 p-3 rounded-lg">
                {metadata.reasoning}
              </p>
            </div>
          )}

          {/* Recommendation */}
          {metadata.recommended && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-primary">Recommendation:</h4>
              <p className={cn('text-sm font-medium', getRecommendationColor())}>
                {metadata.recommended === 'approve' && '✓ Safe to approve'}
                {metadata.recommended === 'review-carefully' && '⚠ Review carefully before approving'}
                {metadata.recommended === 'approve-with-caution' && '⚠ Approve with caution'}
              </p>
            </div>
          )}

          {/* Notes Input (for pending approvals) */}
          {approval.status === 'pending' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Notes (optional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your decision..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Response (for completed approvals) */}
          {approval.status !== 'pending' && approval.notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-primary">Response Notes:</h4>
              <p className="text-sm text-text-secondary bg-white/5 p-3 rounded-lg">
                {approval.notes}
              </p>
              {approval.respondedAt && (
                <p className="text-xs text-text-tertiary">
                  Responded {formatRelativeTime(approval.respondedAt)}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons (for pending approvals) */}
          {approval.status === 'pending' && (
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="success"
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
              
              <Button
                variant="danger"
                onClick={handleDeny}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Deny
              </Button>
            </div>
          )}
        </GlassCardContent>
      )}
    </GlassCard>
  )
}
