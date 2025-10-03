import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Dot } from "recharts"
import { type BrandVisibilityData } from "@/types/dashboard"

const defaultColors = [
  "#84CC16", // lime-500
  "#6B7280", // gray-500
  "#3B82F6", // blue-500
  "#F59E0B", // amber-500
  "#06B6D4", // cyan-500
  "#EC4899", // pink-500
  "#EF4444", // red-500
  "#10B981", // green-500
  "#8B5CF6", // purple-500
]

interface BrandVisibilityChartProps {
  data?: BrandVisibilityData[]
  brands?: string[]
}

export function BrandVisibilityChart({
  data = [],
  brands = []
}: BrandVisibilityChartProps) {
  // Generate chart config dynamically based on brands
  const chartConfig = brands.reduce((config, brand, index) => {
    config[brand] = {
      label: brand,
      color: defaultColors[index % defaultColors.length],
    }
    return config
  }, {} as Record<string, { label: string; color: string }>)
  return (
    <Card className="col-span-8">
      <CardHeader className="@container/card-header relative grid auto-rows-min grid-rows-[auto_auto] items-start px-6 has-[data-slot=card-action]:grid-cols-[1fr_auto] border-b pb-5">
        <CardTitle className="text-lg font-semibold truncate">
          Brand Visibility Over Time
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm truncate">
          Track how your brand performs over time compared to competitors
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 h-[427px] pt-6 relative">
        <div className="py-4 h-[380px]">
          {brands.length === 0 || data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="text-sm">No brand data available</div>
                <div className="text-xs mt-1">Chart will appear once brands are imported</div>
              </div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="w-full h-full">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
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
                <YAxis
                  className="text-xs fill-gray-500"
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />

                {/* Render lines for each brand */}
                {brands.map((brand) => (
                  <Line
                    key={brand}
                    type="monotone"
                    dataKey={brand}
                    stroke={chartConfig[brand]?.color || "#3B82F6"}
                    strokeWidth={2}
                    dot={(props) => (
                      <Dot
                        {...props}
                        r={5}
                        fill={chartConfig[brand]?.color || "#3B82F6"}
                        stroke="white"
                        strokeWidth={2}
                      />
                    )}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
