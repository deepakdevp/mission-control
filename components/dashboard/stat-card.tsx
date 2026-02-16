import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  href?: string;
}

export function StatCard({ title, value, icon: Icon, href }: StatCardProps) {
  const content = (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-primary" />
      </div>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
