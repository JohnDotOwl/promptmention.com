import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Radar, SquareChevronRight, MessageCircleMore, Megaphone } from "lucide-react"
import { type DashboardMetric } from "@/types/dashboard"

const defaultMetrics: DashboardMetric[] = [
  {
    title: "Active Monitors",
    value: "1",
    description: "1 total projects",
    icon: Radar,
  },
  {
    title: "Active Prompts",
    value: "10",
    description: "10 total prompts",
    icon: SquareChevronRight,
  },
  {
    title: "Total Responses",
    value: "30",
    description: "Total responses",
    icon: MessageCircleMore,
  },
  {
    title: "Organic Brand Mentions",
    value: "4",
    description: "Total organic brand mentions",
    icon: Megaphone,
  },
]

interface MetricsCardsProps {
  metrics?: DashboardMetric[]
}

export function MetricsCards({ metrics = defaultMetrics }: MetricsCardsProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shrink-0 ring-muted/60 border shadow-sm ring-3">
          <CardHeader className="@container/card-header auto-rows-min grid-rows-[auto_auto] gap-1.5 px-5 pt-4 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-2 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-muted-foreground/80 mt-2 text-xs">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}