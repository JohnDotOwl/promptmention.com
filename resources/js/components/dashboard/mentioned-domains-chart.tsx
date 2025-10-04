import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { type MentionedDomain } from "@/types/dashboard"

interface MentionedDomainsChartProps {
  domains?: MentionedDomain[]
}

export function MentionedDomainsChart({ domains = [] }: MentionedDomainsChartProps) {
  // Calculate better width scaling using a combination of min-max and logarithmic approach
  const calculateWidth = (percentage: number, maxPercentage: number, minPercentage: number): string => {
    // Ensure minimum width of 30% for visibility
    const minWidth = 30;

    // For small values, use more aggressive scaling
    if (percentage < 20) {
      // Scale small values to be more visible
      const scaledWidth = minWidth + (percentage / 20) * 40;
      return `${Math.min(scaledWidth, 70)}%`;
    }

    // For larger values, use normal scaling but ensure they're not too close
    const range = maxPercentage - minPercentage;
    const normalized = (percentage - minPercentage) / range;
    const scaledWidth = minWidth + normalized * 60; // Scale between 30% and 90%

    return `${Math.min(scaledWidth, 90)}%`;
  };

  const maxPercentage = Math.max(...domains.map(d => d.percentage));
  const minPercentage = Math.min(...domains.map(d => d.percentage));

  if (domains.length === 0) {
    return (
      <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shrink-0 ring-muted/60 border shadow-sm ring-3">
        <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 pt-4 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-2">
          <CardTitle className="leading-none font-semibold">Top Mentioned Domains</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            The domains that are most frequently mentioned in your AI responses.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-4 min-h-[280px]">
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No domain mentions available yet</p>
              <p className="text-xs mt-1">Domain mentions will appear as AI responses are generated</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shrink-0 ring-muted/60 border shadow-sm ring-3">
      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 pt-4 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-2">
        <CardTitle className="leading-none font-semibold">Top Mentioned Domains</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          The domains that are most frequently mentioned in your AI responses.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-4 pt-0 h-[284px]">
        <div className="flex flex-1 justify-between space-x-6 relative h-full">
          <div className="relative w-full space-y-1.5 z-0">
            {domains.map((domain) => (
              <div
                key={domain.domain}
                className="block group w-full rounded-sm outline-offset-2 outline-0 focus-visible:outline-2 outline-blue-500"
              >
                <div
                  className="flex items-center rounded-sm transition-all h-8 bg-blue-200"
                  style={{ width: calculateWidth(domain.percentage, maxPercentage, minPercentage) }}
                >
                  <div className="absolute left-2 flex gap-2 max-w-full pr-2">
                    <div className="relative rounded-sm overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-300 flex items-center justify-center shadow-xs size-5">
                      <img
                        alt={domain.domain}
                        loading="eager"
                        width={64}
                        height={64}
                        decoding="async"
                        className="object-contain rounded-[5px] w-4 h-4"
                        src={domain.favicon}
                        style={{ color: 'transparent' }}
                      />
                    </div>
                    <div className="truncate whitespace-nowrap text-sm">{domain.domain}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {domains.map((domain) => (
              <div key={`count-${domain.domain}`} className="flex items-center justify-end h-8">
                <p className="truncate whitespace-nowrap text-sm leading-none text-muted-foreground">
                  {domain.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}