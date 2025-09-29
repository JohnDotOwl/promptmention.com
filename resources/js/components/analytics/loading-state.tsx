import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards Loading */}
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Loading */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <Skeleton className="h-4 w-32 mx-auto" />
              <div className="text-sm text-muted-foreground">
                Waiting for data...
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function EmptyState() {
  return (
    <Card>
      <CardContent className="h-[280px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-lg font-medium text-muted-foreground">
            No data available
          </div>
          <div className="text-sm text-muted-foreground">
            Select at least one AI platform to view analytics
          </div>
        </div>
      </CardContent>
    </Card>
  )
}