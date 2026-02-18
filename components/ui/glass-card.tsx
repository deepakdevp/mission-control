import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function GlassCard({ className, hover = true, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'card',
        hover && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface GlassCardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function GlassCardHeader({ className, children, ...props }: GlassCardHeaderProps) {
  return (
    <div className={cn('mb-6', className)} {...props}>
      {children}
    </div>
  )
}

interface GlassCardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function GlassCardTitle({ className, children, ...props }: GlassCardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-text-primary', className)} {...props}>
      {children}
    </h3>
  )
}

interface GlassCardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function GlassCardDescription({ className, children, ...props }: GlassCardDescriptionProps) {
  return (
    <p className={cn('text-sm text-text-secondary mt-2', className)} {...props}>
      {children}
    </p>
  )
}

interface GlassCardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function GlassCardContent({ className, children, ...props }: GlassCardContentProps) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}

interface GlassCardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function GlassCardFooter({ className, children, ...props }: GlassCardFooterProps) {
  return (
    <div className={cn('mt-6 pt-6 border-t border-border-secondary', className)} {...props}>
      {children}
    </div>
  )
}
