import { TrialAlert } from "./trial-alert"
import { MetricsCards } from "./metrics-cards"
import { ModelUsageChart } from "./model-usage-chart"
import { CitedDomainsChart } from "./cited-domains-chart"
import { BrandMentionsList } from "./brand-mentions-list"
import { ResponseTimelineChart } from "./response-timeline-chart"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DashboardMetrics {
  totalMonitors: number;
  totalPrompts: number;
  totalResponses: number;
  visibilityScore: number;
  mentionsThisWeek: number;
  responseRate: number;
}

interface DashboardChartData {
  timeline: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
  modelUsage: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  citedDomains: Array<{
    domain: string;
    mentions: number;
    percentage: number;
  }>;
}

interface DashboardActivity {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
}

interface DashboardContentProps {
  metrics?: DashboardMetrics;
  chartData?: DashboardChartData;
  recentActivity?: DashboardActivity[];
  monitorStatus?: {
    active: number;
    pending: number;
    failed: number;
    total: number;
  };
  queueStatus?: {
    domain_analysis: { pending: number; processing: number };
    prompt_generation: { pending: number; processing: number };
    monitor_setup: { pending: number; processing: number };
    total_jobs: number;
  };
  isPolling?: boolean;
  onStartTrial?: () => void;
}

export function DashboardContent({
  metrics,
  chartData,
  recentActivity,
  monitorStatus,
  queueStatus,
  isPolling,
  onStartTrial
}: DashboardContentProps) {
  return (
    <div className="transition-all duration-300 animate-in fade-in">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {isPolling && (
            <Badge variant="secondary" className="text-xs">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Live Updates
            </Badge>
          )}
          {(queueStatus?.total_jobs ?? 0) > 0 && (
            <Badge variant="outline" className="text-xs">
              {queueStatus?.total_jobs} jobs processing
            </Badge>
          )}
        </div>
        <p className="max-w-xl text-sm text-gray-500">
          Overview of your project's performance and AI interactions for{" "}
          <span className="font-semibold">Pay Boy</span>.
        </p>
      </div>

      <MetricsCards metrics={metrics as any} />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ModelUsageChart data={chartData?.modelUsage as any} />
        <CitedDomainsChart domains={chartData?.citedDomains as any} />
        <BrandMentionsList
          mentions={recentActivity?.filter(activity => activity.type === 'mention') as any}
        />
      </div>

      <div className="mt-6">
        <ResponseTimelineChart data={chartData?.timeline as any} />
      </div>
    </div>
  )
}