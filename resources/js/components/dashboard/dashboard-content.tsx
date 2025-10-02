import { AIPlatformCards } from "./ai-platform-cards"
import { BrandVisibilityChart } from "./brand-visibility-chart"
import { TopBrandsList } from "./top-brands-list"
import { ModelUsageChart } from "./model-usage-chart"
import { CitedDomainsChart } from "./cited-domains-chart"
import { BrandMentionsList } from "./brand-mentions-list"
import { ShareOfVoiceChart } from "./share-of-voice-chart"
import { VisibilityScoreChart } from "./visibility-score-chart"
import { DateRangeFilter } from "./date-range-filter"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { type DashboardData, type DateRange } from "@/types/dashboard"

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
  dashboardData?: Partial<DashboardData>;
  projectName?: string;
}

export function DashboardContent({
  metrics,
  chartData,
  recentActivity,
  queueStatus,
  isPolling,
  dashboardData,
  projectName = "Your Project"
}: DashboardContentProps) {
  const handleDateRangeChange = (range: DateRange) => {
    // TODO: Implement date range filtering
    console.log("Date range changed:", range)
  }

  return (
    <div className="transition-all duration-300 animate-in fade-in flex flex-col gap-6 h-full">
      {/* Header Section */}
      <div className="flex items-center border-b pt-6 pb-6 px-6 gap-4 bg-white mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="max-w-xl text-sm text-gray-500">
            Overview of your project's performance and AI interactions for{" "}
            <span className="font-semibold">{projectName}</span>.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
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
          <DateRangeFilter onChange={handleDateRangeChange} />
        </div>
      </div>

      {/* AI Platform Visitor Cards */}
      <div className="px-6">
        <AIPlatformCards
          platforms={dashboardData?.aiPlatformVisitors}
          setupUrl="/analytics"
        />
      </div>

      {/* Brand Visibility Chart + Top Brands */}
      <div className="px-6">
        <div className="grid grid-cols-12 gap-6">
          <BrandVisibilityChart
            data={dashboardData?.brandVisibility}
          />
          <TopBrandsList
            brands={dashboardData?.topBrands}
          />
        </div>
      </div>

      {/* Three Column Section: Cited Domains + Organic Mentions + Model Usage */}
      <div className="px-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <CitedDomainsChart domains={chartData?.citedDomains} />
          </div>
          <div className="col-span-4">
            <BrandMentionsList
              mentions={(recentActivity || []).filter(activity => activity.type === 'mention')}
            />
          </div>
          <div className="col-span-4">
            <ModelUsageChart data={chartData?.modelUsage} />
          </div>
        </div>
      </div>

      {/* Share of Voice + Visibility Score */}
      <div className="px-6">
        <div className="grid grid-cols-12 gap-6">
          <ShareOfVoiceChart
            data={dashboardData?.shareOfVoice}
          />
          <VisibilityScoreChart
            data={dashboardData?.visibilityScoreTimeline}
          />
        </div>
      </div>
    </div>
  )
}