import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sparkline } from '@/components/ui/sparkline'
import { MonitorStats } from './monitor-stats'
import { type MonitorCardProps } from '@/types/monitor'
import { RefreshCcw, Calendar, FileText, MessageSquareReply, TrendingUp, Eye, MessageCircle, BarChart3, ArrowUp, ArrowDown, ChevronRight, Clock, Activity, Users, Zap, Target, TrendingDown, Bot, Globe } from 'lucide-react'
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
    if (trend === 'up') return <ArrowUp className="size-4 text-green-500" />
    if (trend === 'down') return <ArrowDown className="size-4 text-red-500" />
    return <div className="size-4 bg-gray-300 rounded-full" />
  }

  const TrendIconSmall = ({ trend }: { trend: string | null }) => {
    if (trend === 'up') return <TrendingUp className="size-3 text-green-500" />
    if (trend === 'down') return <TrendingDown className="size-3 text-red-500" />
    return <div className="size-3 bg-gray-300 rounded-full" />
  }

  // Calculate percentage changes
  const getPercentageChange = (data: Array<{ value: number }>) => {
    if (data.length < 2) return 0
    const recent = data.slice(-2)
    const previous = recent[0].value
    const current = recent[1].value
    if (previous === 0) return 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const visibilityChange = getPercentageChange(monitor.stats.visibilityData)
  const mentionsChange = getPercentageChange(monitor.stats.mentionsData)
  const citationChange = getPercentageChange(monitor.stats.citationData)

  // Generate mock recent activity data (in real app, this would come from API)
  const recentActivity = [
    { id: 1, model: 'Gemini 2.5 Flash', time: '2 hours ago', type: 'mention', positive: true },
    { id: 2, model: 'GPT-OSS 120B', time: '5 hours ago', type: 'mention', positive: true },
    { id: 3, model: 'Llama 4 Scout', time: '1 day ago', type: 'response', positive: false },
  ]

  return (
    <Link
      href={`/monitors/${monitor.id}`}
      className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl hover:shadow-2xl transition-all duration-300"
      aria-label={`View details for ${monitor.name} monitor monitoring ${monitor.website.name}`}
      role="article"
    >
      <Card
        id="monitor-card"
        className="group w-full border-0 shadow-lg hover:shadow-2xl overflow-hidden bg-white dark:bg-gray-900/60 backdrop-blur-sm py-0 gap-0 block min-h-[320px] rounded-2xl"
      >
        {/* Enhanced Header */}
        <CardHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/40 dark:to-gray-900/40 py-4 px-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="group-hover:text-blue-600 dark:group-hover:text-blue-400 text-xl font-bold truncate">
                    {monitor.name}
                  </h3>
                  <Badge
                    variant={statusConfig.variant}
                    className={`text-xs font-semibold ${statusConfig.className} shrink-0 flex items-center gap-1 px-3 py-1`}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                    <Globe className="size-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-300">{monitor.website.name}</span>
                  </span>
                  <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg truncate max-w-[180px] text-xs">
                    {monitor.website.url}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                <RefreshCcw className="size-4" />
                <span>{formatRelativeTime(monitor.lastUpdated)}</span>
              </div>
              <ChevronRight className="size-5 opacity-40 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </CardHeader>

        {/* Enhanced Content with More Data */}
        <CardContent className="p-0">
          {/* Enhanced Key Metrics Grid */}
          <div className="grid grid-cols-3 divide-x divide-border/50">
            {/* Visibility Metric with Progress */}
            <div className="p-4 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950/30 dark:via-blue-950/20 dark:to-blue-900/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Eye className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-bold text-blue-800 dark:text-blue-200">Visibility</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendIconSmall trend={visibilityTrend} />
                  <span className={`text-xs font-semibold ${visibilityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {visibilityChange >= 0 ? '+' : ''}{visibilityChange}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 tabular-nums mb-2">
                {monitor.stats.visibilityScore}%
              </div>
              <Progress value={monitor.stats.visibilityScore} className="h-2 mb-2" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                {monitor.stats.totalPrompts.toLocaleString()} total prompts
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200/30 dark:border-blue-700/30">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-blue-600 dark:text-blue-400">Response Rate</span>
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    {monitor.stats.totalPrompts > 0 ? Math.round((monitor.stats.totalResponses / monitor.stats.totalPrompts) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-600 dark:text-blue-400">Trend</span>
                  <Sparkline
                    data={monitor.stats.visibilityData}
                    color="#3B82F6"
                    width={80}
                    height={16}
                    showArea={true}
                  />
                </div>
              </div>
            </div>

            {/* Mentions Metric with Enhanced Stats */}
            <div className="p-4 bg-gradient-to-br from-green-50 via-green-50 to-green-100 dark:from-green-950/30 dark:via-green-950/20 dark:to-green-900/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <MessageCircle className="size-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-bold text-green-800 dark:text-green-200">Mentions</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendIconSmall trend={mentionsTrend} />
                  <span className={`text-xs font-semibold ${mentionsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {mentionsChange >= 0 ? '+' : ''}{mentionsChange}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100 tabular-nums mb-2">
                {monitor.stats.mentions.toLocaleString()}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300 mb-2">
                {monitor.stats.totalResponses.toLocaleString()} total responses
              </div>
              <div className="mt-2 pt-2 border-t border-green-200/30 dark:border-green-700/30">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-green-600 dark:text-green-400">Avg. per Day</span>
                  <span className="font-semibold text-green-800 dark:text-green-200">
                    {monitor.stats.mentions > 0 ? Math.round(monitor.stats.mentions / 30) : 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 dark:text-green-400">Trend</span>
                  <Sparkline
                    data={monitor.stats.mentionsData}
                    color="#10B981"
                    width={80}
                    height={16}
                    showArea={true}
                  />
                </div>
              </div>
            </div>

            {/* Citation Rank Metric with Performance */}
            <div className="p-4 bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 dark:from-purple-950/30 dark:via-purple-950/20 dark:to-purple-900/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <BarChart3 className="size-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-bold text-purple-800 dark:text-purple-200">Rank</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendIconSmall trend={citationTrend} />
                  <span className={`text-xs font-semibold ${citationChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {citationChange >= 0 ? '+' : ''}{citationChange}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 tabular-nums mb-2">
                {monitor.stats.avgCitationRank}
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                Avg citation rank
              </div>
              <div className="mt-2 pt-2 border-t border-purple-200/30 dark:border-purple-700/30">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-purple-600 dark:text-purple-400">Performance</span>
                  <span className={`font-semibold ${monitor.stats.avgCitationRank <= 10 ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
                    {monitor.stats.avgCitationRank <= 10 ? 'Excellent' : monitor.stats.avgCitationRank <= 25 ? 'Good' : 'Average'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-600 dark:text-purple-400">Trend</span>
                  <Sparkline
                    data={monitor.stats.citationData}
                    color="#8B5CF6"
                    width={80}
                    height={16}
                    showArea={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="border-t border-border/50 bg-gray-50/80 dark:bg-gray-800/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white dark:bg-gray-900 rounded-lg">
                  <Activity className="size-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Recent Activity</span>
              </div>
              <span className="text-xs text-muted-foreground">Last 24h</span>
            </div>
            <div className="space-y-2">
              {recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between text-xs bg-white dark:bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Bot className={`size-3 ${activity.positive ? 'text-green-500' : 'text-yellow-500'}`} />
                    <span className="font-medium text-gray-800 dark:text-gray-200">{activity.model}</span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-auto">
                      {activity.type}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced AI Models Section */}
          <div className="border-t border-border/50 bg-gray-50/60 dark:bg-gray-800/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white dark:bg-gray-900 rounded-lg">
                  <Zap className="size-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">AI Models</span>
                  <p className="text-xs text-muted-foreground">{monitor.models.length} platforms tracked</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center -ml-1 first:ml-0">
                  {monitor.models.map((model, index) => (
                    <div key={model.id} className="flex items-center -ml-1 first:ml-0">
                      <div className="bg-white dark:bg-gray-900 border border-border rounded-full p-1.5 shadow-sm">
                        <img
                          alt={model.name}
                          loading="lazy"
                          width="18"
                          height="18"
                          decoding="async"
                          src={model.icon}
                          className="size-4.5"
                          style={{ color: 'transparent' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                  <span className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                    All Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}