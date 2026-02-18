import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap user-select-none'
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary/90 hover:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]',
      secondary: 'bg-bg-elevated text-text-primary hover:bg-bg-hover border border-border-primary hover:border-primary',
      success: 'bg-success text-white hover:bg-success/90 hover:shadow-[0_0_0_4px_rgba(34,197,94,0.2)]',
      danger: 'bg-danger text-white hover:bg-danger/90 hover:shadow-[0_0_0_4px_rgba(239,68,68,0.2)]',
      ghost: 'bg-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary'
    }
    
    const sizes = {
      sm: 'text-[13px] px-4 h-8',
      md: 'text-sm px-6 h-10',
      lg: 'text-[15px] px-8 h-12'
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
