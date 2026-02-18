// components/nerve-center/soul-memory-editor.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type FileType = 'SOUL.md' | 'MEMORY.md';

export function SoulMemoryEditor() {
  const [activeTab, setActiveTab] = useState<FileType>('SOUL.md');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    loadFile(activeTab);
  }, [activeTab]);

  useEffect(() => {
    setIsDirty(content !== originalContent);
  }, [content, originalContent]);

  const loadFile = async (path: FileType) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/files?path=${path}`);
      const data = await res.json();
      setContent(data.content);
      setOriginalContent(data.content);
    } catch (error) {
      toast.error(`Failed to load ${path}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: activeTab, content }),
      });
      
      if (!res.ok) throw new Error('Save failed');
      
      setOriginalContent(content);
      toast.success(`${activeTab} saved successfully`);
    } catch (error) {
      toast.error(`Failed to save ${activeTab}`);
    } finally {
      setIsLoading(false);
    }
  };

  const restartGateway = async () => {
    if (!confirm('Restart Gateway? This will reload all configuration.')) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/gateway/restart', { method: 'POST' });
      if (!res.ok) throw new Error('Restart failed');
      
      toast.success('Gateway restart initiated. Check back in 10 seconds.');
    } catch (error) {
      toast.error('Failed to restart Gateway');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-[60vh]">
      {/* Tab Bar */}
      <div className="flex bg-zinc-800/50 border-b border-zinc-700">
        <button
          onClick={() => setActiveTab('SOUL.md')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'SOUL.md'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          SOUL.md {activeTab === 'SOUL.md' && isDirty && '*'}
        </button>
        <button
          onClick={() => setActiveTab('MEMORY.md')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'MEMORY.md'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          MEMORY.md {activeTab === 'MEMORY.md' && isDirty && '*'}
        </button>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isLoading}
        className="flex-1 p-4 bg-zinc-900 text-zinc-100 font-mono text-sm resize-none focus:outline-none"
        placeholder={`Edit ${activeTab}...`}
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-zinc-800/50 border-t border-zinc-700">
        <div className="text-xs text-zinc-400">
          {isDirty && 'Unsaved changes'}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={saveFile}
            disabled={!isDirty || isLoading}
            className="bg-cyan-600 hover:bg-cyan-500"
          >
            Save
          </Button>
          <Button
            onClick={restartGateway}
            disabled={isLoading}
            variant="ghost"
            className="border-amber-600 text-amber-400 hover:bg-amber-600/10"
          >
            Restart Gateway
          </Button>
        </div>
      </div>
    </div>
  );
}
