import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn(
      "mb-8",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2 ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}