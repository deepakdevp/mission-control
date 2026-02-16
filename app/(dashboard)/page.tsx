import { CheckSquare, CheckCircle2, Calendar, FolderKanban } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { FileReader } from '@/lib/fs/reader';
import { Task } from '@/lib/models/task';

async function getTasksCount() {
  const reader = new FileReader();
  try {
    const files = await reader.listFiles('clawd/tasks', '.json');
    const tasks: Task[] = [];

    for (const file of files) {
      const task = await reader.readJSON<Task>(`clawd/tasks/${file}`);
      if (task) {
        tasks.push(task);
      }
    }

    return tasks.filter((t: any) => t.status !== 'done').length;
  } catch {
    return 0;
  }
}

export default async function DashboardPage() {
  const openTasks = await getTasksCount();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Open Tasks"
          value={openTasks}
          icon={CheckSquare}
          href="/tasks"
        />
        <StatCard
          title="Pending Approvals"
          value={0}
          icon={CheckCircle2}
          href="/approvals"
        />
        <StatCard
          title="Today's Events"
          value={0}
          icon={Calendar}
          href="/calendar"
        />
        <StatCard
          title="Active Projects"
          value={0}
          icon={FolderKanban}
          href="/projects"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-semibold mb-3">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-semibold mb-3">Upcoming Cron Jobs</h2>
          <p className="text-sm text-muted-foreground">No upcoming jobs</p>
        </div>
      </div>
    </div>
  );
}
