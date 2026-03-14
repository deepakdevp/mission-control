"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Memory } from '@/lib/models/memory';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAutoRefresh } from '@/hooks/use-sse';
import { Plus, Search, Brain, Edit, Trash2 } from 'lucide-react';
import Fuse from 'fuse.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'note' as Memory['category'],
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/memory');
      if (!res.ok) throw new Error('Failed to fetch memories');
      const data = await res.json();
      setMemories(data);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  useAutoRefresh(fetchMemories, ['clawd/memory']);

  const fuse = useMemo(() => {
    return new Fuse(memories, {
      keys: ['title', 'content', 'tags'],
      threshold: 0.3,
    });
  }, [memories]);

  const filteredMemories = useMemo(() => {
    let result = memories;

    if (searchQuery) {
      result = fuse.search(searchQuery).map(r => r.item);
    }

    if (filterCategory !== 'all') {
      result = result.filter(m => m.category === filterCategory);
    }

    return result;
  }, [memories, searchQuery, filterCategory, fuse]);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create memory');

      await fetchMemories();
      setIsModalOpen(false);
      setFormData({
        title: '',
        content: '',
        category: 'note',
        tags: [],
      });
    } catch (error) {
      console.error('Error creating memory:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    try {
      const res = await fetch(`/api/memory/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete memory');
      await fetchMemories();
      setIsViewModalOpen(false);
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const categoryColors = {
    personal: 'bg-[#028901]/20 text-[#028901]',
    work: 'bg-[#0057ff]/20 text-[#0057ff]',
    learning: 'bg-[#7c3aed]/20 text-[#7c3aed]',
    idea: 'bg-[#f97c00]/20 text-[#f97c00]',
    note: 'bg-[#6b6b6b]/20 text-[#6b6b6b]',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[#6b6b6b]">Loading memories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Memory</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Memory
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" />
          <Input
            className="pl-10"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="learning">Learning</option>
          <option value="idea">Idea</option>
          <option value="note">Note</option>
        </Select>
      </div>

      {filteredMemories.length === 0 ? (
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-8 text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-[#6b6b6b]" />
          <p className="text-[#6b6b6b] mb-4">
            {searchQuery ? 'No memories found' : 'No memories yet'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsModalOpen(true)}>Create your first memory</Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMemories.map(memory => (
            <div
              key={memory.id}
              className="bg-white border border-[#e8e8e8] rounded-lg p-4 hover:border-[#0057ff] transition-colors cursor-pointer"
              onClick={() => {
                setSelectedMemory(memory);
                setIsViewModalOpen(true);
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{memory.title}</h3>
                  <p className="text-sm text-[#6b6b6b] mt-1 line-clamp-2">
                    {memory.content}
                  </p>
                </div>
                <span className={cn('text-xs px-2 py-1 rounded whitespace-nowrap ml-2', categoryColors[memory.category])}>
                  {memory.category}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {memory.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-[#0057ff]/10 text-[#0057ff]">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-[#6b6b6b]">
                  {new Date(memory.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Memory"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Memory
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Memory title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content (Markdown supported)</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your memory..."
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Memory['category'] })}
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="learning">Learning</option>
              <option value="idea">Idea</option>
              <option value="note">Note</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#0057ff]/10 text-[#0057ff] rounded text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Dialog>

      {selectedMemory && (
        <Dialog
          open={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedMemory(null);
          }}
          title={selectedMemory.title}
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="danger"
                onClick={() => handleDelete(selectedMemory.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={cn('text-xs px-2 py-1 rounded', categoryColors[selectedMemory.category])}>
                {selectedMemory.category}
              </span>
              <span className="text-sm text-[#6b6b6b]">
                {new Date(selectedMemory.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedMemory.content}
              </ReactMarkdown>
            </div>

            {selectedMemory.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-[#e8e8e8]">
                {selectedMemory.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 rounded bg-[#0057ff]/10 text-[#0057ff]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
