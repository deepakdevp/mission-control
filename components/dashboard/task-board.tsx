"use client";

import { Task } from '@/lib/models/task';
import { useState } from 'react';

interface TaskBoardProps {
  tasks: Task[];
}

const columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
  { id: 'blocked', title: 'Blocked' },
] as const;

export function TaskBoard({ tasks }: TaskBoardProps) {
  const [localTasks, setLocalTasks] = useState(tasks);

  const getTasksByStatus = (status: Task['status']) => {
    return localTasks.filter(t => t.status === status);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map(column => (
        <div key={column.id} className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-3">{column.title}</h3>
          <div className="space-y-2">
            {getTasksByStatus(column.id).map(task => (
              <div
                key={task.id}
                className="bg-background border border-border rounded p-3 text-sm cursor-pointer hover:border-primary transition-colors"
              >
                <p className="font-medium">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                    task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
