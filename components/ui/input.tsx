import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full h-10 px-4 bg-bg-elevated border border-border-primary rounded-lg',
          'text-sm text-text-primary placeholder:text-text-tertiary',
          'focus:outline-none focus:ring-3 focus:ring-primary/20 focus:border-primary',
          'hover:border-text-tertiary',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
