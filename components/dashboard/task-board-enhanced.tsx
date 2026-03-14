"use client";

import { Task } from '@/lib/models/task';
import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './task-card';
import { TaskColumn } from './task-column';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onCreateTask: () => void;
}

const columns = [
  { id: 'todo' as const, title: 'To Do', color: 'bg-[#6b6b6b]/20' },
  { id: 'in_progress' as const, title: 'In Progress', color: 'bg-[#0057ff]/20' },
  { id: 'done' as const, title: 'Done', color: 'bg-green-500/20' },
  { id: 'blocked' as const, title: 'Blocked', color: 'bg-[#d00d00]/20' },
];

export function TaskBoardEnhanced({ tasks, onUpdateTask, onDeleteTask, onCreateTask }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as Task['status'];

    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      await onUpdateTask(taskId, { status: newStatus });
    }

    setActiveTask(null);
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(t => t.status === status);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onCreateTask} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4">
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <TaskColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                count={columnTasks.length}
              >
                <SortableContext
                  items={columnTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {columnTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={onUpdateTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </div>
                </SortableContext>
              </TaskColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 opacity-90">
              <TaskCard
                task={activeTask}
                onUpdate={() => Promise.resolve()}
                onDelete={() => Promise.resolve()}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
