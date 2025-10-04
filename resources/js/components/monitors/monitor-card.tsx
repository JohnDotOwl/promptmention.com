import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MonitorStats } from './monitor-stats'
import { type MonitorCardProps } from '@/types/monitor'
import { RefreshCcw, Calendar, FileText, MessageSquareReply, TrendingUp, Eye, MessageCircle, BarChart3, ArrowUp, ArrowDown, ChevronRight, Clock, Activity } from 'lucide-react'
import { Link } from '@inertiajs/react'

export function MonitorCard({ monitor }: MonitorCardProps) {
  // Helper function to format relative time
  const formatRelativeTime = (timeString: string) => {
    try {
      // If it's already a human-readable format, return as is
      if (!timeString.includes('-')) {
        return timeString
      }

      // Try to parse the negative minutes format
      const match = timeString.match(/-(\d+(?:\.\d+)?) minutes? ago/)
      if (match) {
        const minutes = parseFloat(match[1])
        const now = new Date()
        const pastTime = new Date(now.getTime() + minutes * 60 * 1000)

        const seconds = Math.floor((now.getTime() - pastTime.getTime()) / 1000)

        if (seconds < 60) return 'just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
        return `${Math.floor(seconds / 86400)} days ago`
      }

      // If parsing fails, return original string or a default
      return timeString.includes('-') ? 'some time ago' : timeString
    } catch (error) {
      return 'some time ago'
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
        label: 'Active',
        icon: <Activity className="w-3 h-3" />
      },
      inactive: {
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700',
        label: 'Inactive',
        icon: <Clock className="w-3 h-3" />
      },
      error: {
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
        label: 'Error',
        icon: <RefreshCcw className="w-3 h-3" />
      },
      pending: {
        variant: 'outline' as const,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
        label: 'Pending',
        icon: <Clock className="w-3 h-3" />
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
      className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl hover:shadow-lg"
      aria-label={`View details for ${monitor.name} monitor monitoring ${monitor.website.name}`}
      role="article"
    >
      <Card
        id="monitor-card"
        className="group w-full border-0 shadow-sm hover:shadow-lg overflow-hidden bg-white dark:bg-gray-900/50 backdrop-blur-sm"
      >
        {/* Enhanced Header */}
        <CardHeader className="border-b bg-gradient-to-r from-gray-50/80 to-gray-50/40 dark:from-gray-800/50 dark:to-gray-800/30 py-3 lg:py-4 px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 lg:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3 mb-2">
                <h3 className="group-hover:text-blue-600 dark:group-hover:text-blue-400 text-lg lg:text-xl font-bold truncate">
                  {monitor.name}
                </h3>
                <Badge
                  variant={statusConfig.variant}
                  className={`text-xs font-medium ${statusConfig.className} shrink-0 flex items-center gap-1 px-2 lg:px-3 py-1 w-fit sm:w-auto`}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <FileText className="size-3 lg:size-4 text-blue-500" />
                  {monitor.website.name}
                </span>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full truncate max-w-full sm:max-w-[200px]">
                  {monitor.website.url}
                </span>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-end gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                <RefreshCcw className="size-3" />
                <span className="hidden sm:inline">{formatRelativeTime(monitor.lastUpdated)}</span>
                <span className="sm:hidden">{formatRelativeTime(monitor.lastUpdated).split(' ')[0]}</span>
              </div>
              <ChevronRight className="size-4 lg:size-5 opacity-40 group-hover:text-blue-500" />
            </div>
          </div>
        </CardHeader>

        {/* Enhanced Content with Metrics */}
        <CardContent className="p-0">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-border/50">
            {/* Visibility Metric */}
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded">
                    <Eye className="size-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Visibility</span>
                </div>
                <TrendIcon trend={visibilityTrend} />
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1 tabular-nums">
                {monitor.stats.visibilityScore}%
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {monitor.stats.totalPrompts} prompts
              </div>
              <div className="h-8 bg-white/50 dark:bg-gray-800/50 rounded p-1">
                <MonitorStats stats={monitor.stats} type="visibility" />
              </div>
            </div>

            {/* Mentions Metric */}
            <div className="p-3 bg-green-50/60 dark:bg-green-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-100 dark:bg-green-900/50 rounded">
                    <MessageCircle className="size-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">Mentions</span>
                </div>
                <TrendIcon trend={mentionsTrend} />
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1 tabular-nums">
                {monitor.stats.mentions}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {monitor.stats.totalResponses} responses
              </div>
              <div className="h-8 bg-white/50 dark:bg-gray-800/50 rounded p-1">
                <MonitorStats stats={monitor.stats} type="mentions" />
              </div>
            </div>

            {/* Citation Rank Metric */}
            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/50 rounded">
                    <BarChart3 className="size-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Citation Rank</span>
                </div>
                <TrendIcon trend={citationTrend} />
              </div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1 tabular-nums">
                {monitor.stats.avgCitationRank}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Average rank
              </div>
              <div className="h-8 bg-white/50 dark:bg-gray-800/50 rounded p-1">
                <MonitorStats stats={monitor.stats} type="citation" />
              </div>
            </div>
          </div>

          {/* Models Section */}
          <div className="border-t border-border/50 bg-gray-50/60 dark:bg-gray-800/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded">
                  <TrendingUp className="size-3 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Models</span>
                  <p className="text-xs text-muted-foreground">{monitor.models.length} platforms</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {monitor.models.slice(0, 4).map((model, index) => (
                  <div key={model.id} className="flex items-center -ml-1.5 first:ml-0">
                    <div className="bg-white dark:bg-gray-900 border border-border rounded-full p-1">
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
                  <div className="ml-1 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    +{monitor.models.length - 4}
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