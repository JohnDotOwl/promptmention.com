import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { type Citation } from '@/types/citation'
import { useMemo } from 'react'

interface DomainRankDistributionCardProps {
  citations: Citation[]
}

interface RankBin {
  range: string
  count: number
}

export function DomainRankDistributionCard({ citations }: DomainRankDistributionCardProps) {
  const chartData = useMemo(() => {
    // Create bins for domain ratings (0-10, 10-20, etc.)
    const bins: RankBin[] = []
    const binSize = 9.3 // To create 10 bins from 0-93
    
    for (let i = 0; i < 10; i++) {
      const start = Math.floor(i * binSize)
      const end = Math.floor((i + 1) * binSize)
      bins.push({
        range: `${start}-${end}`,
        count: 0
      })
    }

    // Count citations in each bin
    citations.forEach(citation => {
      const binIndex = Math.min(Math.floor(citation.domainRating / binSize), 9)
      bins[binIndex].count++
    })

    return bins
  }, [citations])

  const stats = useMemo(() => {
    const uniqueDomains = new Set(citations.map(c => c.domain)).size
    const avgRank = citations.reduce((sum, c) => sum + c.domainRating, 0) / citations.length || 0
    return {
      uniqueDomains,
      avgRank: avgRank.toFixed(2)
    }
  }, [citations])

  const chartConfig = {
    count: {
      label: 'Citations',
      color: 'hsl(var(--primary))'
    }
  }

  return (
    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shrink-0 ring-muted/60 border shadow-sm ring-3">
      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 pt-4 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-2">
        <CardTitle className="leading-none font-semibold">Domain Rank Distribution</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {stats.uniqueDomains} unique domains • Average rank: {stats.avgRank}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <ChartContainer config={chartConfig} className="h-96">
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
            <CartesianGrid 
              strokeDasharray="0" 
              stroke="hsl(var(--border))" 
              vertical={false}
              className="stroke-gray-200 stroke-1 dark:stroke-gray-800"
            />
            <XAxis 
              dataKey="range"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-xs fill-gray-500 dark:fill-gray-500"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-xs fill-gray-500 dark:fill-gray-500"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="count" 
              fill="hsl(217 91% 60%)"
              radius={[4, 4, 0, 0]}
              className="fill-blue-500"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}