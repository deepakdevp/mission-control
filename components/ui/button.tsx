import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap select-none'

    const variants = {
      primary:   'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
      secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
      success:   'bg-green-600 text-white hover:bg-green-700 shadow-sm',
      danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      ghost:     'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700',
    }

    const sizes = {
      sm: 'text-xs px-3 h-8',
      md: 'text-sm px-4 h-9',
      lg: 'text-sm px-5 h-11',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
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
