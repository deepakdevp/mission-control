"use client";

import { TaskBoardEnhanced } from '@/components/dashboard/task-board-enhanced';
import { TaskModal } from '@/components/dashboard/task-modal';
import { useTasks } from '@/hooks/use-tasks';
import { useAutoRefresh } from '@/hooks/use-sse';
import { useState } from 'react';
import { Task } from '@/lib/models/task';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

export default function TasksPage() {
  const { tasks, loading, createTask, updateTask, deleteTask, refresh } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');

  useAutoRefresh(refresh, ['clawd/tasks']);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesProject = filterProject === 'all' || task.projectId === filterProject;
    
    return matchesSearch && matchesPriority && matchesProject;
  });

  const uniqueProjects = Array.from(new Set(tasks.map(t => t.projectId).filter(Boolean)));

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createTask(taskData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[#6b6b6b]">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" />
          <Input
            className="pl-10"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" />
          <Select
            className="pl-10"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>

        <Select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="all">All Projects</option>
          {uniqueProjects.map(project => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </Select>
      </div>

      <TaskBoardEnhanced
        tasks={filteredTasks}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onCreateTask={() => setIsModalOpen(true)}
      />

      <TaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
