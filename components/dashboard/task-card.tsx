"use client";

import { Task } from '@/lib/models/task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    urgent: 'bg-[#d00d00]/20 text-[#d00d00] border-[#d00d00]/30',
    high: 'bg-[#f97c00]/20 text-[#f97c00] border-[#f97c00]/30',
    medium: 'bg-[#0057ff]/20 text-[#0057ff] border-[#0057ff]/30',
    low: 'bg-[#6b6b6b]/20 text-[#6b6b6b] border-[#6b6b6b]/30',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-[#f5f6f8] border border-[#e8e8e8] rounded p-3 cursor-pointer hover:border-[#0057ff] transition-all',
        isDragging && 'opacity-50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 text-[#6b6b6b] hover:text-[#191919] cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{task.title}</p>
          {task.description && (
            <p className="text-xs text-[#6b6b6b] mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={cn('text-xs px-2 py-0.5 rounded border', priorityColors[task.priority])}>
              {task.priority}
            </span>

            {task.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded bg-[#0057ff]/10 text-[#0057ff]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {isHovered && (
          <div className="flex gap-1">
            <button
              onClick={() => onUpdate(task.id, task)}
              className="p-1 text-[#6b6b6b] hover:text-[#191919] transition-colors"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-[#6b6b6b] hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
