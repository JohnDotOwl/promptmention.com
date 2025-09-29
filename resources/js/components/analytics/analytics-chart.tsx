import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, Line, LineChart, XAxis, YAxis } from 'recharts'
import type { AnalyticsDataPoint, AIDomain, ChartConfig } from '@/types/analytics'

interface AnalyticsChartProps {
  title: string
  description?: string
  data: AnalyticsDataPoint[]
  activeDomains: AIDomain[]
  chartConfig: ChartConfig
  type?: 'line' | 'area'
  className?: string
}

export function AnalyticsChart({
  title,
  description,
  data,
  activeDomains,
  chartConfig,
  type = 'area',
  className = ''
}: AnalyticsChartProps) {
  const ChartComponent = type === 'area' ? AreaChart : LineChart
  const ChartElement = type === 'area' ? Area : Line

  // If no title, render chart without card wrapper
  if (!title) {
    return (
      <ChartContainer config={chartConfig} className={`w-full h-full ${className}`}>
        <ChartComponent data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <XAxis 
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            className="fill-gray-500 dark:fill-gray-500"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            className="fill-gray-500 dark:fill-gray-500"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          
          {activeDomains.includes('google') && (
            <ChartElement
              type="monotone"
              dataKey="google"
              stroke={chartConfig.google.color}
              fill={type === 'area' ? `${chartConfig.google.color}20` : undefined}
              strokeWidth={2}
              dot={false}
            />
          )}
          
          {activeDomains.includes('chatgpt') && (
            <ChartElement
              type="monotone"
              dataKey="chatgpt"
              stroke={chartConfig.chatgpt.color}
              fill={type === 'area' ? `${chartConfig.chatgpt.color}20` : undefined}
              strokeWidth={2}
              dot={false}
            />
          )}
          
          {activeDomains.includes('claude') && (
            <ChartElement
              type="monotone"
              dataKey="claude"
              stroke={chartConfig.claude.color}
              fill={type === 'area' ? `${chartConfig.claude.color}20` : undefined}
              strokeWidth={2}
              dot={false}
            />
          )}
          
          {activeDomains.includes('perplexity') && (
            <ChartElement
              type="monotone"
              dataKey="perplexity"
              stroke={chartConfig.perplexity.color}
              fill={type === 'area' ? `${chartConfig.perplexity.color}20` : undefined}
              strokeWidth={2}
              dot={false}
            />
          )}
        </ChartComponent>
      </ChartContainer>
    )
  }

  return (
    <Card className={`bg-card text-card-foreground flex flex-col gap-6 rounded-xl shrink-0 ring-muted/60 border shadow-sm ring-3 ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[280px]">
          <ChartComponent data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis 
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            
            {activeDomains.includes('google') && (
              <ChartElement
                type="monotone"
                dataKey="google"
                stroke={chartConfig.google.color}
                fill={type === 'area' ? `${chartConfig.google.color}20` : undefined}
                strokeWidth={2}
                dot={false}
              />
            )}
            
            {activeDomains.includes('chatgpt') && (
              <ChartElement
                type="monotone"
                dataKey="chatgpt"
                stroke={chartConfig.chatgpt.color}
                fill={type === 'area' ? `${chartConfig.chatgpt.color}20` : undefined}
                strokeWidth={2}
                dot={false}
              />
            )}
            
            {activeDomains.includes('claude') && (
              <ChartElement
                type="monotone"
                dataKey="claude"
                stroke={chartConfig.claude.color}
                fill={type === 'area' ? `${chartConfig.claude.color}20` : undefined}
                strokeWidth={2}
                dot={false}
              />
            )}
            
            {activeDomains.includes('perplexity') && (
              <ChartElement
                type="monotone"
                dataKey="perplexity"
                stroke={chartConfig.perplexity.color}
                fill={type === 'area' ? `${chartConfig.perplexity.color}20` : undefined}
                strokeWidth={2}
                dot={false}
              />
            )}
          </ChartComponent>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}