import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageContentProps {
  children: ReactNode
  className?: string
  centered?: boolean
}

export function PageContent({
  children,
  className,
  centered = false
}: PageContentProps) {
  return (
    <div className={cn(
      "px-6",
      className
    )}>
      {centered ? (
        <div className="flex justify-center">
          <div className="max-w-6xl w-full">
            {children}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}