import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MonitorStats } from './monitor-stats'
import { type MonitorCardProps } from '@/types/monitor'
import { RefreshCcw, Calendar, FileText, MessageSquareReply, TrendingUp, Eye, MessageCircle, BarChart3, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react'
import { Link } from '@inertiajs/react'

export function MonitorCard({ monitor }: MonitorCardProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        variant: 'default' as const,
        className: 'bg-green-500 hover:bg-green-600 text-white border-green-500',
        label: 'Active'
      },
      inactive: {
        variant: 'secondary' as const,
        className: 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500',
        label: 'Inactive'
      },
      error: {
        variant: 'destructive' as const,
        className: 'bg-red-500 hover:bg-red-600 text-white border-red-500',
        label: 'Error'
      },
      pending: {
        variant: 'outline' as const,
        className: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500',
        label: 'Pending'
      }
    }

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
  }

  const statusConfig = getStatusBadge(monitor.status)

  // Helper function to get trend indicator
  const getTrendIndicator = (data: Array<{ value: number }>) => {
    if (data.length < 2) return null
    const recent = data.slice(-2)
    const trend = recent[1].value - recent[0].value
    return trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
  }

  const visibilityTrend = getTrendIndicator(monitor.stats.visibilityData)
  const mentionsTrend = getTrendIndicator(monitor.stats.mentionsData)
  const citationTrend = getTrendIndicator(monitor.stats.citationData)

  const TrendIcon = ({ trend }: { trend: string | null }) => {
    if (trend === 'up') return <ArrowUp className="size-3 text-green-500" />
    if (trend === 'down') return <ArrowDown className="size-3 text-red-500" />
    return <div className="size-3 bg-gray-300 rounded-full" />
  }

  return (
    <Link
      href={`/monitors/${monitor.id}`}
      className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.01]"
      aria-label={`View details for ${monitor.name} monitor monitoring ${monitor.website.name}`}
      role="article"
    >
      <Card
        id="monitor-card"
        className="group w-full border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        {/* Header with compact design */}
        <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-800/30 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="group-hover:text-primary text-lg font-semibold transition-colors truncate">
                  {monitor.name}
                </h3>
                <Badge
                  variant={statusConfig.variant}
                  className={`text-xs ${statusConfig.className} shrink-0`}
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="size-3" />
                  {monitor.website.name}
                </span>
                <span className="truncate">{monitor.website.url}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <RefreshCcw className="size-3" />
                <span>{monitor.lastUpdated}</span>
              </div>
              <ChevronRight className="size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardHeader>

        {/* Content with integrated metrics */}
        <CardContent className="p-0">
          {/* Integrated Metrics Grid */}
          <div className="grid grid-cols-3 divide-x divide-border">
            {/* Visibility Metric */}
            <div className="p-4 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Visibility</span>
                </div>
                <TrendIcon trend={visibilityTrend} />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {monitor.stats.visibilityScore}%
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {monitor.stats.totalPrompts} prompts
              </div>
              <div className="h-12">
                <MonitorStats stats={monitor.stats} type="visibility" />
              </div>
            </div>

            {/* Mentions Metric */}
            <div className="p-4 bg-gradient-to-b from-green-50/50 to-transparent dark:from-green-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="size-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Mentions</span>
                </div>
                <TrendIcon trend={mentionsTrend} />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {monitor.stats.mentions}
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {monitor.stats.totalResponses} responses
              </div>
              <div className="h-12">
                <MonitorStats stats={monitor.stats} type="mentions" />
              </div>
            </div>

            {/* Citation Rank Metric */}
            <div className="p-4 bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Citation Rank</span>
                </div>
                <TrendIcon trend={citationTrend} />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {monitor.stats.avgCitationRank}
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                Average rank
              </div>
              <div className="h-12">
                <MonitorStats stats={monitor.stats} type="citation" />
              </div>
            </div>
          </div>

          {/* Models Section */}
          <div className="border-t bg-gray-50/30 dark:bg-gray-800/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Models</span>
              </div>
              <div className="flex items-center gap-1 overflow-hidden">
                {monitor.models.slice(0, 4).map((model, index) => (
                  <div key={model.id} className="flex items-center -ml-1 first:ml-0">
                    <div className="bg-background border border-border rounded-full p-1 shadow-sm">
                      <img
                        alt={model.name}
                        loading="lazy"
                        width="16"
                        height="16"
                        decoding="async"
                        src={model.icon}
                        className="size-4"
                        style={{ color: 'transparent' }}
                      />
                    </div>
                  </div>
                ))}
                {monitor.models.length > 4 && (
                  <div className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    +{monitor.models.length - 4} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}