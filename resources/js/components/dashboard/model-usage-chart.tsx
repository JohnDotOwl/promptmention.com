import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { type ModelUsageData } from "@/types/dashboard"

const defaultData: ModelUsageData[] = [
  { name: "gemini-2.0-flash", value: 10, fill: "#3B82F6" }, // blue-500
  { name: "gpt-4o-search", value: 10, fill: "#10B981" }, // emerald-500
  { name: "mistral-small-latest", value: 10, fill: "#8B5CF6" }, // violet-500
]

const chartConfig = {
  "gemini-2.0-flash": {
    label: "Gemini 2.0 Flash",
    color: "#3B82F6",
  },
  "gpt-4o-search": {
    label: "GPT-4o Search",
    color: "#10B981",
  },
  "mistral-small-latest": {
    label: "Mistral Small",
    color: "#8B5CF6",
  },
}

interface ModelUsageChartProps {
  data?: ModelUsageData[]
}

export function ModelUsageChart({ data = defaultData }: ModelUsageChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shrink-0 ring-muted/60 border shadow-sm ring-3">
      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 pt-4 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-2">
        <CardTitle className="leading-none font-semibold pt-2">Model Usage</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">Last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-4 min-h-[280px] h-full">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px] w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              strokeWidth={2}
              stroke="hsl(var(--background))"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-700 dark:fill-gray-300 text-2xl font-bold"
            >
              {total}
            </text>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}