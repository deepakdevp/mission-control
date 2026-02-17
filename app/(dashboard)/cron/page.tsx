"use client";

import { useState, useEffect, useCallback } from 'react';
import { CronJob } from '@/lib/models/cron';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAutoRefresh } from '@/hooks/use-sse';
import { Plus, Clock, Play, Pause, Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    schedule: '',
    command: '',
    enabled: true,
  });

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cron');
      if (!res.ok) throw new Error('Failed to fetch cron jobs');
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching cron jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useAutoRefresh(fetchJobs, ['clawd/cron']);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          logs: [],
        }),
      });

      if (!res.ok) throw new Error('Failed to create cron job');
      
      await fetchJobs();
      setIsModalOpen(false);
      setFormData({
        name: '',
        schedule: '',
        command: '',
        enabled: true,
      });
    } catch (error) {
      console.error('Error creating cron job:', error);
    }
  };

  const handleToggle = async (job: CronJob) => {
    try {
      const res = await fetch(`/api/cron/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: !job.enabled,
        }),
      });

      if (!res.ok) throw new Error('Failed to update cron job');
      await fetchJobs();
    } catch (error) {
      console.error('Error updating cron job:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cron job?')) return;

    try {
      const res = await fetch(`/api/cron/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete cron job');
      await fetchJobs();
      setIsLogsModalOpen(false);
    } catch (error) {
      console.error('Error deleting cron job:', error);
    }
  };

  const handleManualTrigger = async (job: CronJob) => {
    console.log('Manual trigger:', job.id);
    // In a real implementation, this would trigger the job
    alert(`Manually triggering: ${job.name}`);
  };

  const viewLogs = (job: CronJob) => {
    setSelectedJob(job);
    setIsLogsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading cron jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cron Jobs</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Cron Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No cron jobs yet</p>
          <Button onClick={() => setIsModalOpen(true)}>Create your first cron job</Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Name</th>
                <th className="text-left p-4 font-semibold">Schedule</th>
                <th className="text-left p-4 font-semibold">Last Run</th>
                <th className="text-left p-4 font-semibold">Next Run</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, idx) => (
                <tr key={job.id} className={cn('border-b border-border', idx % 2 === 0 && 'bg-background/50')}>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{job.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {job.command}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <code className="text-xs bg-background px-2 py-1 rounded">
                      {job.schedule}
                    </code>
                  </td>
                  <td className="p-4">
                    {job.lastRun ? (
                      <div>
                        <p className="text-sm">
                          {new Date(job.lastRun).toLocaleString()}
                        </p>
                        {job.lastStatus && (
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded',
                            job.lastStatus === 'success'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          )}>
                            {job.lastStatus}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </td>
                  <td className="p-4">
                    {job.nextRun ? (
                      <span className="text-sm">
                        {new Date(job.nextRun).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggle(job)}
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded text-sm',
                        job.enabled
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      )}
                    >
                      {job.enabled ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                      {job.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewLogs(job)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManualTrigger(job)}
                        disabled={!job.enabled}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Cron Job"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Job
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Daily backup"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Schedule (Cron Expression) *</label>
            <Input
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="0 0 * * *"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Example: "0 0 * * *" = Daily at midnight
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Command *</label>
            <Textarea
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              placeholder="node scripts/backup.js"
              rows={3}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm">Enable immediately</label>
          </div>
        </div>
      </Dialog>

      {selectedJob && (
        <Dialog
          open={isLogsModalOpen}
          onClose={() => {
            setIsLogsModalOpen(false);
            setSelectedJob(null);
          }}
          title={`Logs: ${selectedJob.name}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Schedule</p>
                <code className="text-xs bg-background px-2 py-1 rounded">{selectedJob.schedule}</code>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <span className={cn(
                  'inline-block px-2 py-1 rounded text-xs',
                  selectedJob.enabled
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                )}>
                  {selectedJob.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Command</p>
              <code className="block bg-background p-3 rounded text-xs font-mono whitespace-pre-wrap">
                {selectedJob.command}
              </code>
            </div>

            {selectedJob.logs && selectedJob.logs.length > 0 ? (
              <div>
                <p className="text-sm font-medium mb-2">Recent Logs</p>
                <div className="bg-background rounded p-3 max-h-64 overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {selectedJob.logs.join('\n')}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-background rounded p-4 text-center">
                <p className="text-sm text-muted-foreground">No logs yet</p>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
