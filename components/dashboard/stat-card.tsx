import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  href?: string;
  iconColor?: string;
  iconBg?: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  href,
  iconColor = '#0057ff',
  iconBg = '#f5f8ff',
  trend,
  trendUp,
}: StatCardProps) {
  const content = (
    <div className="bg-white border border-[#e8e8e8] rounded-xl p-5 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-[#6b6b6b] font-medium">{title}</p>
          <p className="text-[28px] font-bold text-[#191919] mt-1 leading-tight">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trendUp ? 'text-[#028901]' : trendUp === false ? 'text-[#d00d00]' : 'text-[#6b6b6b]'}`}>
              {trend}
            </p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
