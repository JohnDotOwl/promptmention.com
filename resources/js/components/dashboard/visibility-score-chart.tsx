import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { type VisibilityScorePoint } from "@/types/dashboard"

const generateDefaultData = (): VisibilityScorePoint[] => {
  const dates = ["26 Sep", "27 Sep", "28 Sep", "29 Sep", "30 Sep", "01 Oct", "02 Oct"]
  return dates.map((date, index) => ({
    date,
    visibilityScore: index === 4 ? 30.5 : 0, // Only 30 Sep has data
    responses: index === 4 ? 69 : 0,
  }))
}

const defaultData = generateDefaultData()

const chartConfig = {
  visibilityScore: {
    label: "Visibility Score",
    color: "#3B82F6", // blue-500
  },
  responses: {
    label: "Responses",
    color: "#6B7280", // gray-500
  },
}

interface VisibilityScoreChartProps {
  data?: VisibilityScorePoint[]
  currentScore?: number
}

export function VisibilityScoreChart({
  data = defaultData,
  currentScore = 30.5
}: VisibilityScoreChartProps) {
  return (
    <Card className="col-span-8">
      <CardHeader className="@container/card-header relative grid auto-rows-min grid-rows-[auto_auto] items-start px-6 has-[data-slot=card-action]:grid-cols-[1fr_auto]">
        <CardTitle className="text-lg font-semibold truncate">
          Visibility Score & Responses
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm truncate">
          Brand visibility and responses over time from all monitors
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0 h-[284px]">
        <div className="space-y-4">
          {/* Current score display */}
          <div className="flex items-center gap-1 mb-4">
            <div className="text-2xl font-bold">
              {currentScore}%{" "}
              <span className="text-base font-normal text-muted-foreground">
                Visibility Score
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="relative h-[210px] w-full">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 80, left: 0, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="fillVisibility" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillResponses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B7280" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="0"
                  className="stroke-gray-200 stroke-1"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  className="text-xs fill-gray-500"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />

                {/* Left Y-axis for Visibility Score (percentage) */}
                <YAxis
                  yAxisId="left"
                  className="text-xs fill-gray-500"
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 1]}
                />

                {/* Right Y-axis for Responses (count) */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs fill-gray-500"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                />

                <ChartTooltip content={<ChartTooltipContent />} />

                {/* Visibility Score Area */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="visibilityScore"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#fillVisibility)"
                  fillOpacity={1}
                />

                {/* Responses Area (dashed line) */}
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="responses"
                  stroke="#6B7280"
                  strokeWidth={2}
                  strokeDasharray="5 8"
                  fill="url(#fillResponses)"
                  fillOpacity={0}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
