// components/nerve-center/hitl-queue.tsx
'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface HITLRequest {
  id: string;
  task: string;
  requester: string;
  timestamp: number;
}

export function HITLQueue() {
  // Placeholder: In future, fetch from Gateway HITL endpoint
  const requests: HITLRequest[] = [];

  const handleApprove = (id: string) => {
    // TODO: POST to /api/gateway/hitl with approval
    console.log('Approved:', id);
  };

  const handleDeny = (id: string) => {
    // TODO: POST to /api/gateway/hitl with denial
    console.log('Denied:', id);
  };

  if (requests.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
        <p className="text-zinc-400 text-sm">No pending approvals 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-zinc-100 mb-4">Pending Approvals</h3>
      
      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm text-zinc-100 mb-1">{req.task}</p>
                <p className="text-xs text-zinc-500">
                  {req.requester} • {new Date(req.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => handleApprove(req.id)}
                className="bg-green-600 hover:bg-green-500"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeny(req.id)}
                className="border-red-600 text-red-400 hover:bg-red-600/10"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Deny
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
