import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { type ShareOfVoiceData } from "@/types/dashboard"

const defaultData: ShareOfVoiceData = {
  ourBrand: 48,
  otherBrands: 52,
  trend: 48,
  isPositive: true,
}

const chartConfig = {
  ourBrand: {
    label: "Our brand",
    color: "#10B981", // emerald-500
  },
  otherBrands: {
    label: "Other brands",
    color: "#D1D5DB", // gray-300
  },
}

interface ShareOfVoiceChartProps {
  data?: ShareOfVoiceData
}

export function ShareOfVoiceChart({ data = defaultData }: ShareOfVoiceChartProps) {
  const chartData = [
    { name: "Our brand", value: data.ourBrand, fill: chartConfig.ourBrand.color },
    { name: "Other brands", value: data.otherBrands, fill: chartConfig.otherBrands.color },
  ]

  const TrendIcon = data.isPositive ? TrendingUp : TrendingDown
  const trendColor = data.isPositive ? "text-emerald-600" : "text-red-600"

  return (
    <Card className="col-span-4">
      <CardHeader className="@container/card-header relative grid auto-rows-min grid-rows-[auto_auto] items-start px-6 has-[data-slot=card-action]:grid-cols-[1fr_auto]">
        <CardTitle className="text-lg font-semibold truncate">
          Share of Voice
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm truncate">
          How often your brand is mentioned in all responses
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[284px] flex-1 flex items-center justify-center">
        <div className="mx-auto aspect-square h-[200px] w-full relative">
          {/* Centered text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground pl-3 pt-3">
                  {data.ourBrand}
                  <span className="text-base pl-1">%</span>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-medium ${trendColor}`}>
                  <TrendIcon className="w-4 h-4" aria-hidden="true" />
                  {data.trend}%
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <ChartContainer config={chartConfig} className="size-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                strokeWidth={4}
                stroke="white"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
