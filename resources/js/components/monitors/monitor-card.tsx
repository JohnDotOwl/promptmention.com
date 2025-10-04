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
        className="group w-full border-0 shadow-sm hover:shadow-lg overflow-hidden bg-white dark:bg-gray-900/50 backdrop-blur-sm py-0 gap-0 block min-h-[280px]"
      >
        {/* Header */}
        <CardHeader className="border-b bg-gray-50/60 dark:bg-gray-800/30 py-4 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="group-hover:text-blue-600 dark:group-hover:text-blue-400 text-xl font-bold truncate">
                  {monitor.name}
                </h3>
                <Badge
                  variant={statusConfig.variant}
                  className={`text-xs font-medium ${statusConfig.className} shrink-0 flex items-center gap-1 px-2 py-1`}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="size-3 text-blue-500" />
                  {monitor.website.name}
                </span>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded truncate max-w-[180px]">
                  {monitor.website.url}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                <RefreshCcw className="size-3" />
                <span>{formatRelativeTime(monitor.lastUpdated).split(' ')[0]}</span>
              </div>
              <ChevronRight className="size-4 opacity-40 group-hover:text-blue-500" />
            </div>
          </div>
        </CardHeader>

        {/* Enhanced Content with Metrics */}
        <CardContent className="p-0">
          {/* Key Metrics - Colorful gradient scheme */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-border/50">
            {/* Visibility Metric */}
            <div className="p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-blue-900/40 border border-blue-200/50 dark:border-blue-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded shadow-sm">
                    <Eye className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Visibility</span>
                </div>
                <TrendIcon trend={visibilityTrend} />
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2 tabular-nums">
                {monitor.stats.visibilityScore}%
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-300 mb-3">
                {monitor.stats.totalPrompts} prompts
              </div>
              <div className="h-10 bg-white/70 dark:bg-gray-900/50 rounded p-1.5">
                <MonitorStats stats={monitor.stats} type="visibility" />
              </div>
            </div>

            {/* Mentions Metric */}
            <div className="p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-green-900/40 border border-green-200/50 dark:border-green-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded shadow-sm">
                    <MessageCircle className="size-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">Mentions</span>
                </div>
                <TrendIcon trend={mentionsTrend} />
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2 tabular-nums">
                {monitor.stats.mentions}
              </div>
              <div className="text-sm text-green-600 dark:text-green-300 mb-3">
                {monitor.stats.totalResponses} responses
              </div>
              <div className="h-10 bg-white/70 dark:bg-gray-900/50 rounded p-1.5">
                <MonitorStats stats={monitor.stats} type="mentions" />
              </div>
            </div>

            {/* Citation Rank Metric */}
            <div className="p-4 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 dark:from-purple-950/30 dark:via-violet-950/20 dark:to-purple-900/40 border border-purple-200/50 dark:border-purple-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded shadow-sm">
                    <BarChart3 className="size-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Citation Rank</span>
                </div>
                <TrendIcon trend={citationTrend} />
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-2 tabular-nums">
                {monitor.stats.avgCitationRank}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-300 mb-3">
                Average rank
              </div>
              <div className="h-10 bg-white/70 dark:bg-gray-900/50 rounded p-1.5">
                <MonitorStats stats={monitor.stats} type="citation" />
              </div>
            </div>
          </div>

          {/* Models Section */}
          <div className="border-t border-border/50 bg-gray-50/60 dark:bg-gray-800/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white dark:bg-gray-900 rounded shadow-sm">
                  <TrendingUp className="size-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Models</span>
                  <p className="text-xs text-muted-foreground">{monitor.models.length} platforms</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {monitor.models.slice(0, 4).map((model, index) => (
                  <div key={model.id} className="flex items-center -ml-2 first:ml-0">
                    <div className="bg-white dark:bg-gray-900 border border-border rounded-full p-1.5 shadow-sm">
                      <img
                        alt={model.name}
                        loading="lazy"
                        width="20"
                        height="20"
                        decoding="async"
                        src={model.icon}
                        className="size-5"
                        style={{ color: 'transparent' }}
                      />
                    </div>
                  </div>
                ))}
                {monitor.models.length > 4 && (
                  <div className="ml-1 text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded">
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