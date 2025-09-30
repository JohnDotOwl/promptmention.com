import { type MonitorStats } from '@/types/monitor'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

interface MonitorStatsProps {
  stats: MonitorStats
  type?: 'visibility' | 'mentions' | 'citation'
}

interface StatChartProps {
  data: Array<{ value: number }>
  color: string
  dataKey?: string
}

function StatChart({ data, color, dataKey = 'value' }: StatChartProps) {
  const gradientId = `«r3${color.charAt(0)}»-${dataKey}`
  
  return (
    <div className="h-12 mt-3">
      <div className="relative h-full w-full" tremor-id="tremor-raw">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 1, right: 1, left: 1, bottom: 1 }}>
            <defs>
              <clipPath id={`recharts-clip-${gradientId}`}>
                <rect x="1" y="1" height="46" width="100%"></rect>
              </clipPath>
            </defs>
            <defs>
              <linearGradient className={`text-${color}`} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="currentColor" stopOpacity="0.4" />
                <stop offset="95%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g className={`recharts-layer recharts-area stroke-${color}`}>
              <g className="recharts-layer">
                <Area
                  strokeOpacity="1"
                  name={dataKey}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill={`url(#${gradientId})`}
                  fillOpacity="0.6"
                  stroke=""
                  dataKey={dataKey}
                  type="monotone"
                />
              </g>
            </g>
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
            />
          </div>
        </div>
      </div>
    )
  }

  // Render individual chart based on type
  if (type === 'visibility') {
    return <StatChart data={stats.visibilityData} color="blue-500" />
  }
  
  if (type === 'mentions') {
    return <StatChart data={stats.mentionsData} color="orange-500" />
  }
  
  if (type === 'citation') {
    return <StatChart data={stats.citationData} color="purple-500" />
  }

  return null
}