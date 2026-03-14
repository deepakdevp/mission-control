"use client";

import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TaskColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  children: ReactNode;
}

export function TaskColumn({ id, title, color, count, children }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-white border border-[#e8e8e8] rounded-lg p-4 transition-colors',
        isOver && 'border-[#0057ff] bg-[#0057ff]/5'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <span className={cn('text-xs px-2 py-0.5 rounded', color)}>
          {count}
        </span>
      </div>
      <div className="min-h-[200px]">
        {children}
      </div>
    </div>
  );
}
