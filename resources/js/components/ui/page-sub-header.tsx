import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageSubHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageSubHeader({
  title,
  description,
  actions,
  className
}: PageSubHeaderProps) {
  return (
    <div className={cn(
      "px-4 pt-2 pb-2 border-b border-border bg-background h-24",
      className
    )}>
      <div className="flex items-center justify-between w-full h-16">
        <div className="flex-1">
          <h1 className="text-lg font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-0.5 max-w-2xl">
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