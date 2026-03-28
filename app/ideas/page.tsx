'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2, MoreVertical, Lightbulb, Calendar, Tag, X } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { cn } from '@/lib/utils';

// --- TYPES ---
interface Idea {
  id: string;
  name: string;
  description: string;
  status: string;
  confidence: number;
  tags: string | null;
  createdAt: string;
}

// --- ZOD SCHEMA ---
const ideaSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.string().default('Idea'),
  confidence: z.coerce.number().min(1).max(10).default(5),
  tags: z.string().optional(),
});

type IdeaFormData = z.infer<typeof ideaSchema>;

// --- API FUNCTIONS ---
const API_URL = '/api/ideas';

async function fetchIdeas(): Promise<Idea[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch ideas');
  return res.json();
}

async function createIdea(data: IdeaFormData): Promise<Idea> {
  const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, tags: tagsArray }),
  });
  if (!res.ok) throw new Error('Failed to create idea');
  return res.json();
}

async function updateIdea(id: string, data: IdeaFormData): Promise<Idea> {
  const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, tags: tagsArray }),
  });
  if (!res.ok) throw new Error('Failed to update idea');
  return res.json();
}

async function deleteIdea(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete idea');
}

// --- STATUS CONFIG ---
const STATUS_CONFIG: Record<string, { text: string; bg: string }> = {
  'Idea':        { text: 'text-gray-600',  bg: 'bg-gray-100' },
  'Researching': { text: 'text-blue-700',  bg: 'bg-blue-50' },
  'Validating':  { text: 'text-amber-700', bg: 'bg-amber-50' },
  'Building':    { text: 'text-green-700', bg: 'bg-green-50' },
};

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

// --- CONFIDENCE DOTS ---
function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 rounded-full',
            i < value
              ? value >= 8 ? 'bg-green-500' : value >= 5 ? 'bg-blue-500' : 'bg-amber-400'
              : 'bg-gray-200'
          )}
        />
      ))}
      <span className="text-xs text-gray-400 ml-1">{value}/10</span>
    </div>
  );
}

// --- IDEA CARD ---
function IdeaCard({ idea, onEdit, onDelete }: { idea: Idea; onEdit: (idea: Idea) => void; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tags = parseTags(idea.tags);
  const statusCfg = STATUS_CONFIG[idea.status] || STATUS_CONFIG.Idea;
  const dateStr = new Date(idea.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 leading-snug">{idea.name}</h3>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                onClick={() => { onEdit(idea); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => { onDelete(idea.id); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{idea.description}</p>

      {/* Status badge */}
      <span className={cn('self-start inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', statusCfg.bg, statusCfg.text)}>
        {idea.status}
      </span>

      {/* Confidence */}
      <ConfidenceMeter value={idea.confidence} />

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
        <Calendar className="w-3 h-3" />
        {dateStr}
      </div>
    </div>
  );
}

// --- MODAL FORM ---
function IdeaModal({ idea, onSave, onCancel }: { idea?: Idea; onSave: () => void; onCancel: () => void }) {
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
    defaultValues: idea ? {
      name: idea.name,
      description: idea.description,
      status: idea.status,
      confidence: idea.confidence,
      tags: parseTags(idea.tags).join(', '),
    } : { status: 'Idea', confidence: 5 },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const confidenceValue = watch('confidence');

  const onSubmit: SubmitHandler<IdeaFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      if (idea) {
        await updateIdea(idea.id, data);
      } else {
        await createIdea(data);
      }
      onSave();
      reset();
    } catch (error) {
      console.error('Failed to save idea', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{idea ? 'Edit Idea' : 'New Idea'}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input {...register('name')} className="input" placeholder="e.g. SaaS dashboard for freelancers" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea {...register('description')} className="input textarea" rows={3} placeholder="Describe the idea..." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select {...register('status')} className="input">
                <option>Idea</option>
                <option>Researching</option>
                <option>Validating</option>
                <option>Building</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confidence: <span className="text-blue-600 font-semibold">{confidenceValue}/10</span>
              </label>
              <input
                type="range"
                {...register('confidence')}
                min={1}
                max={10}
                className="w-full h-2 accent-blue-600"
              />
              {errors.confidence && <p className="text-red-500 text-xs mt-1">{errors.confidence.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma-separated)</label>
            <input {...register('tags')} className="input" placeholder="e.g. saas, fintech, mobile" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : idea ? 'Save Changes' : 'Create Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---
export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | undefined>(undefined);

  const loadIdeas = async () => {
    setIsLoading(true);
    try {
      const data = await fetchIdeas();
      setIdeas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadIdeas(); }, []);

  const handleSave = () => {
    setIsModalOpen(false);
    setEditingIdea(undefined);
    loadIdeas();
  };

  const handleEdit = (idea: Idea) => {
    setEditingIdea(idea);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      try {
        await deleteIdea(id);
        loadIdeas();
      } catch (error) {
        console.error('Failed to delete idea', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Business Ideas"
        description="Track and develop your ideas"
        actions={
          <button className="btn btn-primary" onClick={() => { setEditingIdea(undefined); setIsModalOpen(true); }}>
            <Plus size={16} className="mr-1" />
            New Idea
          </button>
        }
      />

      <div className="px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Lightbulb className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No ideas yet</h3>
            <p className="text-sm text-gray-500 mb-6">Capture your first business idea to get started</p>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-1" />
              Add First Idea
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ideas.map(idea => (
              <IdeaCard key={idea.id} idea={idea} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <IdeaModal
          idea={editingIdea}
          onSave={handleSave}
          onCancel={() => { setIsModalOpen(false); setEditingIdea(undefined); }}
        />
      )}
    </div>
  );
}
