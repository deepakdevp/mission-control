import {
  CheckSquare,
  CheckCircle2,
  Calendar,
  FolderKanban,
  FileText,
  Users,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { FileReader } from '@/lib/fs/reader';
import { Task } from '@/lib/models/task';

async function getTaskStats() {
  const reader = new FileReader();
  try {
    const files = await reader.listFiles('clawd/tasks', '.json');
    const tasks: Task[] = [];
    for (const file of files) {
      const task = await reader.readJSON<Task>(`clawd/tasks/${file}`);
      if (task) tasks.push(task);
    }
    const open = tasks.filter((t) => t.status !== 'done').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const blocked = tasks.filter((t) => t.status === 'blocked').length;
    return { open, todo, inProgress, done, blocked, total: tasks.length };
  } catch {
    return { open: 0, todo: 0, inProgress: 0, done: 0, blocked: 0, total: 0 };
  }
}

export default async function DashboardPage() {
  const stats = await getTaskStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#191919]">Dashboard</h1>
        <p className="text-sm text-[#6b6b6b] mt-1">Welcome back — here&apos;s your overview</p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <StatCard
          title="Open Tasks"
          value={stats.open}
          icon={CheckSquare}
          href="/tasks"
          iconColor="#0057ff"
          iconBg="#f5f8ff"
        />
        <StatCard
          title="Pending Approvals"
          value={0}
          icon={CheckCircle2}
          href="/approvals"
          iconColor="#028901"
          iconBg="#f0faf0"
        />
        <StatCard
          title="Today's Events"
          value={0}
          icon={Calendar}
          href="/calendar"
          iconColor="#f97c00"
          iconBg="#fff8f0"
        />
        <StatCard
          title="Active Projects"
          value={0}
          icon={FolderKanban}
          href="/projects"
          iconColor="#7c3aed"
          iconBg="#f5f3ff"
        />
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-6">
          <div className="bg-white border border-[#e8e8e8] rounded-xl p-6">
            <h2 className="text-base font-semibold text-[#191919] mb-1">Task Overview</h2>
            <p className="text-xs text-[#6b6b6b] mb-5">Status of current tasks</p>
            <div className="space-y-3">
              {[
                { label: 'To Do', value: stats.todo, total: stats.total, color: '#0057ff' },
                { label: 'In Progress', value: stats.inProgress, total: stats.total, color: '#f97c00' },
                { label: 'Done', value: stats.done, total: stats.total, color: '#028901' },
                { label: 'Blocked', value: stats.blocked, total: stats.total, color: '#d00d00' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="text-xs text-[#6b6b6b] w-20">{item.label}</span>
                  <div className="flex-1 h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%',
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#191919] w-8 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e8e8e8] rounded-xl p-6">
            <h2 className="text-base font-semibold text-[#191919] mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { icon: CheckSquare, text: 'Task created: "Review API design"', time: '2 min ago', color: '#0057ff' },
                { icon: CheckCircle2, text: 'Approval granted: Deploy staging', time: '1 hour ago', color: '#028901' },
                { icon: FileText, text: 'Document updated: Architecture notes', time: '3 hours ago', color: '#7c3aed' },
                { icon: Users, text: 'New contact added', time: '5 hours ago', color: '#f97c00' },
                { icon: FolderKanban, text: 'Project status changed to Active', time: 'Yesterday', color: '#0057ff' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${item.color}10`, color: item.color }}
                  >
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-[#191919] flex-1">{item.text}</span>
                  <span className="text-xs text-[#6b6b6b]">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-[#e8e8e8] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#191919]">Upcoming Events</h2>
              <a href="/calendar" className="text-xs text-[#0057ff] font-medium hover:underline">View All</a>
            </div>
            <div className="space-y-3">
              {[
                { date: 'MAR 14', title: 'Product Review', time: '10:00 AM - 11:30 AM' },
                { date: 'MAR 15', title: 'Team Standup', time: '9:30 AM - 10:00 AM' },
                { date: 'MAR 18', title: 'Client Demo', time: '2:00 PM - 3:00 PM' },
              ].map((event, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#f5f6f8]">
                  <div className="bg-[#0057ff] text-white text-[10px] font-bold px-2 py-1 rounded-md text-center leading-tight min-w-[48px]">
                    {event.date}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#191919] truncate">{event.title}</p>
                    <p className="text-xs text-[#6b6b6b]">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e8e8e8] rounded-xl p-6">
            <h2 className="text-base font-semibold text-[#191919] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: CheckSquare, label: 'New Task', href: '/tasks', color: '#0057ff' },
                { icon: Calendar, label: 'Add Event', href: '/calendar', color: '#f97c00' },
                { icon: FileText, label: 'New Doc', href: '/docs', color: '#7c3aed' },
                { icon: Users, label: 'Add Person', href: '/people', color: '#028901' },
              ].map((action, i) => (
                <a
                  key={i}
                  href={action.href}
                  className="flex items-center gap-2 p-3 rounded-lg border border-[#e8e8e8] hover:border-[#0057ff] hover:bg-[#f5f8ff] transition-all"
                >
                  <action.icon className="w-4 h-4" style={{ color: action.color }} />
                  <span className="text-sm font-medium text-[#191919]">{action.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e8e8e8] rounded-xl p-6">
            <h2 className="text-base font-semibold text-[#191919] mb-4">System Status</h2>
            <div className="space-y-3">
              {[
                { label: 'File Watcher', status: 'Active', ok: true },
                { label: 'SSE Connection', status: 'Connected', ok: true },
                { label: 'Cron Scheduler', status: 'Running', ok: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-[#191919]">{item.label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.ok ? 'bg-[#f0faf0] text-[#028901]' : 'bg-[#fef2f2] text-[#d00d00]'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
