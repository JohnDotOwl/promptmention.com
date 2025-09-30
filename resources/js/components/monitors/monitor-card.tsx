import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MonitorStats } from './monitor-stats'
import { type MonitorCardProps } from '@/types/monitor'
import { RefreshCcw, Calendar, FileText, MessageSquareReply, TrendingUp, Eye, MessageCircle, BarChart3 } from 'lucide-react'

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

  return (
    <a
      className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
      href={`/monitors/${monitor.id}`}
      aria-label={`View details for ${monitor.name} monitor monitoring ${monitor.website.name}`}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          window.location.href = `/monitors/${monitor.id}`
        }
      }}
    >
      <Card
        id="monitor-card"
        className="group w-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-0 shadow-md overflow-hidden"
      >
        {/* Header Section */}
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-4 px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="group-hover:text-primary text-lg font-semibold transition-colors truncate">
                  {monitor.website.name}
                </h3>
                <Badge
                  variant={statusConfig.variant}
                  className={`text-xs ${statusConfig.className} shrink-0`}
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {monitor.website.url}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Monitor: {monitor.name}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <RefreshCcw className="size-3" aria-hidden="true" />
                <span>Updated {monitor.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="size-3" aria-hidden="true" />
                <span>Created {monitor.createdAt}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Content Section */}
        <CardContent className="p-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div
              className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg"
              role="region"
              aria-label="Visibility metrics"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Eye className="size-4 text-blue-600" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">Visibility</span>
              </div>
              <div className="text-2xl font-bold text-blue-600" aria-label="Visibility score">
                {monitor.stats.visibilityScore}%
              </div>
              <div className="text-xs text-muted-foreground" aria-label="Based on total prompts">
                {monitor.stats.totalPrompts} prompts
              </div>
            </div>

            <div
              className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg"
              role="region"
              aria-label="Mentions metrics"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <MessageCircle className="size-4 text-green-600" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">Mentions</span>
              </div>
              <div className="text-2xl font-bold text-green-600" aria-label="Total mentions">
                {monitor.stats.mentions}
              </div>
              <div className="text-xs text-muted-foreground" aria-label="Total responses">
                {monitor.stats.totalResponses} responses
              </div>
            </div>

            <div
              className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg"
              role="region"
              aria-label="Citation rank metrics"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <BarChart3 className="size-4 text-purple-600" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">Citation Rank</span>
              </div>
              <div className="text-2xl font-bold text-purple-600" aria-label="Average citation rank">
                {monitor.stats.avgCitationRank}
              </div>
              <div className="text-xs text-muted-foreground">
                Average rank
              </div>
            </div>
          </div>

          {/* Models Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Tracked Models</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {monitor.models.map((model) => (
                <div
                  key={model.id}
                  className="bg-muted/50 hover:bg-muted flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors"
                >
                  <img
                    alt={model.name}
                    loading="lazy"
                    width="14"
                    height="14"
                    decoding="async"
                    data-nimg="1"
                    src={model.icon}
                    className="w-[14px] h-[14px]"
                    style={{ color: 'transparent' }}
                  />
                  {model.name}
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">
                Visibility Trend
              </div>
              <div className="h-24">
                <MonitorStats stats={monitor.stats} type="visibility" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">
                Mentions Trend
              </div>
              <div className="h-24">
                <MonitorStats stats={monitor.stats} type="mentions" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">
                Citation Rank Trend
              </div>
              <div className="h-24">
                <MonitorStats stats={monitor.stats} type="citation" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}