import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'todo' | 'in_progress' | 'done' | 'blocked' | 'low' | 'medium' | 'high' | 'urgent' | 'default'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        variant !== 'default' && `badge-${variant}`,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
