import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm p-6', className)}>
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-muted rounded animate-pulse w-full" />
            {i === lines - 1 && <div className="h-3 bg-muted rounded animate-pulse w-4/5" />}
          </div>
        ))}
      </div>
    </div>
  );
}