"use client";

import { Task } from '@/lib/models/task';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { X } from 'lucide-react';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Task;
}

export function TaskModal({ open, onClose, onSubmit, initialData }: TaskModalProps) {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignedTo: '',
      projectId: '',
      dueDate: '',
    },
  });

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        tags,
        status: data.status as Task['status'],
        priority: data.priority as Task['priority'],
      });
      reset();
      setTags([]);
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Task' : 'Create Task'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(handleFormSubmit)} disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input {...register('title', { required: true })} placeholder="Task title" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea {...register('description')} placeholder="Task description" rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select {...register('status')}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <Select {...register('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <Input {...register('dueDate')} type="date" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Assigned To</label>
          <Input {...register('assignedTo')} placeholder="Username or email" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Project ID</label>
          <Input {...register('projectId')} placeholder="Associated project" />
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
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[#0057ff]/10 text-[#0057ff] rounded text-sm"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
