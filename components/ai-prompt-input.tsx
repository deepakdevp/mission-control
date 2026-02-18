'use client'

import { useState, FormEvent, KeyboardEvent } from 'react'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIPromptInputProps {
  placeholder: string
  onSubmit: (prompt: string) => Promise<void>
  icon?: React.ReactNode
  className?: string
  disabled?: boolean
}

export function AIPromptInput({
  placeholder,
  onSubmit,
  icon,
  className,
  disabled = false
}: AIPromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading || disabled) return

    setIsLoading(true)
    setError(null)

    try {
      await onSubmit(prompt.trim())
      setPrompt('') // Clear on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process prompt')
      console.error('Prompt submission error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
    if (e.key === 'Escape') {
      setPrompt('')
      setError(null)
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-card p-1">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 pl-3 text-text-secondary">
              {icon || <Sparkles className="w-5 h-5" />}
            </div>
            
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading || disabled}
              className={cn(
                'flex-1 bg-transparent border-none outline-none',
                'text-text-primary placeholder:text-text-tertiary',
                'py-3 px-2 text-sm',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />

            {prompt.trim() && (
              <button
                type="button"
                onClick={() => {
                  setPrompt('')
                  setError(null)
                }}
                className="text-text-tertiary hover:text-text-secondary transition-colors px-2"
                disabled={isLoading || disabled}
              >
                ✕
              </button>
            )}

            <button
              type="submit"
              disabled={!prompt.trim() || isLoading || disabled}
              className={cn(
                'flex items-center justify-center',
                'w-10 h-10 rounded-lg mr-1',
                'bg-primary text-white',
                'hover:bg-primary/90 transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-2 text-sm text-danger animate-fade-in">
          {error}
        </div>
      )}
    </div>
  )
}
