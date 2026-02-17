"use client";

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/lib/models/project';
import { Task } from '@/lib/models/task';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAutoRefresh } from '@/hooks/use-sse';
import { Plus, FolderKanban, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as Project['status'],
    startDate: '',
    endDate: '',
    tags: [] as string[],
  });

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks'),
      ]);
      
      if (!projectsRes.ok || !tasksRes.ok) throw new Error('Failed to fetch data');
      
      const projectsData = await projectsRes.json();
      const tasksData = await tasksRes.json();
      
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useAutoRefresh(fetchProjects, ['clawd/projects', 'clawd/tasks']);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tasks: [],
        }),
      });

      if (!res.ok) throw new Error('Failed to create project');
      
      await fetchProjects();
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        status: 'active',
        startDate: '',
        endDate: '',
        tags: [],
      });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const getProjectProgress = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId);
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  const statusColors = {
    planning: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <FolderKanban className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No projects yet</p>
          <Button onClick={() => setIsModalOpen(true)}>Create your first project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.map(project => {
            const progress = getProjectProgress(project.id);
            const projectTasks = getProjectTasks(project.id);
            
            return (
              <div
                key={project.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  </div>
                  <span className={cn('text-xs px-2 py-1 rounded border whitespace-nowrap', statusColors[project.status])}>
                    {project.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{projectTasks.length} tasks</span>
                    </div>
                    
                    {project.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Project"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Project
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Project description"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Dialog>

      {selectedProject && (
        <Dialog
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.name}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Tasks</h3>
              <div className="space-y-2">
                {getProjectTasks(selectedProject.id).map(task => (
                  <div key={task.id} className="p-2 bg-background rounded border border-border">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {task.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
                {getProjectTasks(selectedProject.id).length === 0 && (
                  <p className="text-sm text-muted-foreground">No tasks yet</p>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
