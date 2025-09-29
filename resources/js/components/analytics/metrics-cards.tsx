import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from 'lucide-react'
import type { AnalyticsMetrics } from '@/types/analytics'
import { domainFilters } from '@/data/analytics'

interface MetricsCardsProps {
  metrics: AnalyticsMetrics
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const topDomainInfo = domainFilters.find(d => d.id === metrics.topDomain)
  
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalMentions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Across all platforms
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.dailyAverage.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Mentions per day
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Growth</CardTitle>
          {metrics.weeklyGrowth >= 0 ? (
            <ArrowUpIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.weeklyGrowth >= 0 ? '+' : ''}{metrics.weeklyGrowth}%
          </div>
          <p className="text-xs text-muted-foreground">
            From last week
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Platform</CardTitle>
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: topDomainInfo?.color }}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topDomainInfo?.name}</div>
          <p className="text-xs text-muted-foreground">
            Most mentions this period
          </p>
        </CardContent>
      </Card>
    </div>
  )
}