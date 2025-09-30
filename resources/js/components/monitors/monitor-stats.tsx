import { type MonitorStats } from '@/types/monitor'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface MonitorStatsProps {
  stats: MonitorStats
  type?: 'visibility' | 'mentions' | 'citation'
}

interface StatChartProps {
  data: Array<{ value: number }>
  color: string
  dataKey?: string
  title?: string
}

function StatChart({ data, color, dataKey = 'value', title }: StatChartProps) {
  const colorMap = {
    'blue-500': '#3b82f6',
    'orange-500': '#f97316',
    'purple-500': '#a855f7',
    'green-500': '#22c55e',
    'red-500': '#ef4444'
  }

  const chartColor = colorMap[color as keyof typeof colorMap] || colorMap['blue-500']
  const gradientId = `gradient-${dataKey}-${color.replace('-', '')}`

  return (
    <div className="h-full w-full">
      <div className="relative h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity="0.4" />
                <stop offset="95%" stopColor={chartColor} stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {title || 'Value'}
                      </p>
                      <p className="text-sm font-semibold">
                        {payload[0].value}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={chartColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              dot={{ fill: chartColor, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: chartColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function MonitorStats({ stats, type }: MonitorStatsProps) {
  // If no type specified, render the full grid (original behavior)
  if (!type) {
    return (
      <div className="grid grid-cols-9 gap-4">
        {/* Visibility Score */}
        <div className="border-r pr-4 col-span-1 pt-3 pb-2">
          <div className="text-sm text-muted-foreground leading-relaxed">Visibility Score</div>
          <div className="text-2xl font-semibold leading-relaxed tabular-nums">{stats.visibilityScore}%</div>
          <div className="text-muted-foreground mb-4 text-xs">Based on {stats.totalPrompts} prompts</div>
        </div>

        {/* Models - taking more space */}
        <div className="border-r pr-4 col-span-2 pt-4">
          <div className="mb-2 text-sm text-muted-foreground leading-relaxed">Models</div>
          <div className="mb-1 flex flex-wrap gap-2">
            {/* Models will be passed down from parent component */}
          </div>
        </div>

        {/* Visibility Chart */}
        <div className="border-r pr-4 col-span-2 pt-4">
          <div className="pointer-events-none h-full">
            <div className="text-sm text-muted-foreground leading-relaxed">
              Visibility: <span className="font-medium text-foreground">{stats.visibilityScore}%</span>
            </div>
            <StatChart
              data={stats.visibilityData}
              color="blue-500"
              title="Visibility"
            />
          </div>
        </div>

        {/* Mentions Chart */}
        <div className="border-r pr-4 col-span-2 pt-4">
          <div className="pointer-events-none h-full w-full">
            <div className="text-sm text-muted-foreground leading-relaxed">
              Mentions: <span className="font-medium text-foreground">{stats.mentions}</span>
            </div>
            <StatChart
              data={stats.mentionsData}
              color="orange-500"
              title="Mentions"
            />
          </div>
        </div>

        {/* Citation Rank Chart */}
        <div className="col-span-2 pt-4">
          <div className="pointer-events-none h-full w-full">
            <div className="text-sm text-muted-foreground leading-relaxed">
              Avg. Citation Rank: <span className="font-medium text-foreground">{stats.avgCitationRank}</span>
            </div>
            <StatChart
              data={stats.citationData}
              color="purple-500"
              title="Citation Rank"
            />
          </div>
        </div>
      </div>
    )
  }

  // Render individual chart based on type with proper titles
  if (type === 'visibility') {
    return <StatChart data={stats.visibilityData} color="blue-500" title="Visibility" />
  }

  if (type === 'mentions') {
    return <StatChart data={stats.mentionsData} color="orange-500" title="Mentions" />
  }

  if (type === 'citation') {
    return <StatChart data={stats.citationData} color="purple-500" title="Citation Rank" />
  }

  return null
}