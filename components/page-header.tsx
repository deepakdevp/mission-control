import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="h-[65px] px-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 leading-none">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
