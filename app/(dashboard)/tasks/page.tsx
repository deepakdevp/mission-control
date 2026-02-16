import { TaskBoard } from '@/components/dashboard/task-board';
import { FileReader } from '@/lib/fs/reader';
import { Task } from '@/lib/models/task';

async function getTasks(): Promise<Task[]> {
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

    return tasks;
  } catch {
    return [];
  }
}

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Add Task
        </button>
      </div>

      <TaskBoard tasks={tasks} />
    </div>
  );
}
