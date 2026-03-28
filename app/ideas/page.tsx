'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash, MoreHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

import { useRouter } from 'next/navigation';

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
  const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, tags: tagsArray }),
  });
  if (!res.ok) throw new Error('Failed to create idea');
  return res.json();
}

async function updateIdea(id: string, data: IdeaFormData): Promise<Idea> {
    const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];
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

// --- COMPONENTS ---

function IdeaForm({ idea, onSave, onCancel }: { idea?: Idea; onSave: () => void; onCancel: () => void; }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
    defaultValues: idea ? {
        ...idea,
        tags: idea.tags ? JSON.parse(idea.tags).join(', ') : ''
    } : {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Add user-facing error message here
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-4">{idea ? 'Edit Idea' : 'Add New Idea'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#374151] mb-1">Name</label>
            <input id="name" {...register('name')} className="input" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#374151] mb-1">Description</label>
            <textarea id="description" {...register('description')} className="input h-32" />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-[#374151] mb-1">Status</label>
                <select id="status" {...register('status')} className="input">
                    <option>Idea</option>
                    <option>Researching</option>
                    <option>Validating</option>
                    <option>Building</option>
                </select>
            </div>
            <div>
                <label htmlFor="confidence" className="block text-sm font-medium text-[#374151] mb-1">Confidence (1-10)</label>
                <input id="confidence" type="number" {...register('confidence')} className="input" />
                {errors.confidence && <p className="text-red-500 text-xs mt-1">{errors.confidence.message}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-[#374151] mb-1">Tags (comma-separated)</label>
            <input id="tags" {...register('tags')} className="input" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function IdeasDataTable({ ideas, onEdit, onDelete }: { ideas: Idea[]; onEdit: (idea: Idea) => void; onDelete: (id: string) => void; }) {
    const router = useRouter();

    if (ideas.length === 0) {
        return <div className="card text-center text-gray-500">No ideas yet. Add one to get started!</div>;
    }
    
  return (
    <div className="card !p-0">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Confidence</th>
                        <th scope="col" className="px-6 py-3">Tags</th>
                        <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    {ideas.map((idea) => (
                        <tr key={idea.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/ideas/${idea.id}`)}>
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                {idea.name}
                                <p className="text-xs text-gray-400 font-normal truncate max-w-xs">{idea.description}</p>
                            </th>
                            <td className="px-6 py-4">{idea.status}</td>
                            <td className="px-6 py-4">{idea.confidence}/10</td>
                            <td className="px-6 py-4">
                                {idea.tags && JSON.parse(idea.tags).map((tag: string) => (
                                    <span key={tag} className="bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={(e) => { e.stopPropagation(); onEdit(idea); }} className="p-1 text-gray-500 hover:text-indigo-600"><Edit size={16}/></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(idea.id); }} className="p-1 text-gray-500 hover:text-red-600"><Trash size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}


// --- MAIN PAGE COMPONENT ---
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
      // Add user-facing error message here
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  const handleSave = () => {
    setIsModalOpen(false);
    setEditingIdea(undefined);
    loadIdeas();
  };

  const handleAddNew = () => {
    setEditingIdea(undefined);
    setIsModalOpen(true);
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
          <button className="btn btn-primary" onClick={handleAddNew}>
            <Plus size={16} className="mr-1" />
            New Idea
          </button>
        }
      />

      {/* Main Content */}
      <div className="px-8 py-6">
        {isLoading ? (
          <div className="card text-center">Loading ideas...</div>
        ) : (
          <IdeasDataTable ideas={ideas} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {isModalOpen && (
        <IdeaForm 
            idea={editingIdea}
            onSave={handleSave} 
            onCancel={() => {
                setIsModalOpen(false);
                setEditingIdea(undefined);
            }}
        />
      )}
    </div>
  );
}
