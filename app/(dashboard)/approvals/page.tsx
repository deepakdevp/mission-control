"use client";

import { useState, useEffect, useCallback } from 'react';
import { Approval } from '@/lib/models/approval';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAutoRefresh } from '@/hooks/use-sse';
import { CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [actionType, setActionType] = useState<'approved' | 'denied'>('approved');

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/approvals');
      if (!res.ok) throw new Error('Failed to fetch approvals');
      const data = await res.json();
      setApprovals(data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  useAutoRefresh(fetchApprovals, ['clawd/approvals']);

  const handleApprove = (approval: Approval, action: 'approved' | 'denied') => {
    setSelectedApproval(approval);
    setActionType(action);
    setIsModalOpen(true);
  };

  const submitResponse = async () => {
    if (!selectedApproval) return;

    try {
      const res = await fetch(`/api/approvals/${selectedApproval.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionType,
          response: responseText,
          respondedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Failed to update approval');

      await fetchApprovals();
      setIsModalOpen(false);
      setResponseText('');
      setSelectedApproval(null);
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  const filteredApprovals = approvals.filter(approval => {
    if (filterStatus === 'all') return true;
    return approval.status === filterStatus;
  });

  const getStatusBadge = (status: Approval['status']) => {
    const styles = {
      pending: 'bg-[#fff8f0] text-[#f97c00] border-[#f97c00]/30',
      approved: 'bg-[#f0faf0] text-[#028901] border-[#028901]/30',
      denied: 'bg-[#fef2f2] text-[#d00d00] border-[#d00d00]/30',
    };

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      denied: XCircle,
    };

    const Icon = icons[status];

    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded border text-sm', styles[status])}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[#6b6b6b]">Loading approvals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Approvals</h1>
          <p className="text-[#6b6b6b] mt-1">Review and approve agent actions</p>
        </div>
      </div>

      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" />
        <Select
          className="pl-10 max-w-xs"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
        </Select>
      </div>

      {filteredApprovals.length === 0 ? (
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-8 text-center">
          <p className="text-[#6b6b6b]">No approvals found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map(approval => (
            <div key={approval.id} className="bg-white border border-[#e8e8e8] rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-[#0057ff]/10 text-[#0057ff]">
                      {approval.type}
                    </span>
                    {getStatusBadge(approval.status)}
                  </div>
                  <p className="font-medium">{approval.request}</p>
                  <p className="text-sm text-[#6b6b6b] mt-1">
                    {new Date(approval.createdAt).toLocaleString()}
                  </p>
                </div>

                {approval.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(approval, 'approved')}
                      className="bg-[#028901] hover:bg-[#026e01]"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleApprove(approval, 'denied')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Deny
                    </Button>
                  </div>
                )}
              </div>

              {approval.context && (
                <div className="bg-[#f5f6f8] rounded p-3 text-sm">
                  <p className="text-[#6b6b6b] text-xs mb-2">Context:</p>
                  <pre className="overflow-x-auto text-xs">
                    {JSON.stringify(approval.context, null, 2)}
                  </pre>
                </div>
              )}

              {approval.response && (
                <div className="mt-3 p-3 bg-[#f5f6f8] rounded">
                  <p className="text-xs text-[#6b6b6b] mb-1">Response:</p>
                  <p className="text-sm">{approval.response}</p>
                  {approval.respondedAt && (
                    <p className="text-xs text-[#6b6b6b] mt-1">
                      {new Date(approval.respondedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${actionType === 'approved' ? 'Approve' : 'Deny'} Request`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitResponse}
              className={actionType === 'approved' ? 'bg-[#028901] hover:bg-[#026e01]' : ''}
              variant={actionType === 'denied' ? 'danger' : 'default'}
            >
              Confirm {actionType === 'approved' ? 'Approval' : 'Denial'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-2">
              <strong>Request:</strong> {selectedApproval?.request}
            </p>
            {selectedApproval?.context && (
              <div className="bg-[#f5f6f8] rounded p-3 text-xs">
                <pre>{JSON.stringify(selectedApproval.context, null, 2)}</pre>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (optional)
            </label>
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Add any notes about this decision..."
              rows={4}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
