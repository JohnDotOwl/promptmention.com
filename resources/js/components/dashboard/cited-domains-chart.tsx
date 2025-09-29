import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type CitedDomain } from "@/types/dashboard"

const defaultDomains: CitedDomain[] = [
  {
    domain: "reddit.com",
    favicon: "https://www.google.com/s2/favicons?domain=reddit.com&size=64",
    count: 9,
    percentage: 100,
  },
  {
    domain: "selecthub.com",
    favicon: "https://www.google.com/s2/favicons?domain=selecthub.com&size=64",
    count: 4,
    percentage: 44.4444,
  },
  {
    domain: "wise.com",
    favicon: "https://www.google.com/s2/favicons?domain=wise.com&size=64",
    count: 2,
    percentage: 22.2222,
  },
  {
    domain: "volopay.com",
    favicon: "https://www.google.com/s2/favicons?domain=volopay.com&size=64",
    count: 2,
    percentage: 22.2222,
  },
  {
    domain: "hrtech.sg",
    favicon: "https://www.google.com/s2/favicons?domain=hrtech.sg&size=64",
    count: 2,
    percentage: 22.2222,
  },
  {
    domain: "payboy.sg",
    favicon: "https://www.google.com/s2/favicons?domain=payboy.sg&size=64",
    count: 2,
    percentage: 22.2222,
  },
  {
    domain: "funempire.com",
    favicon: "https://www.google.com/s2/favicons?domain=funempire.com&size=64",
    count: 1,
    percentage: 11.1111,
  },
]

interface CitedDomainsChartProps {
  domains?: CitedDomain[]
}

export function CitedDomainsChart({ domains = defaultDomains }: CitedDomainsChartProps) {
  return (
    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shrink-0 ring-muted/60 border shadow-sm ring-3">
      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 pt-4 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-2">
        <CardTitle className="leading-none font-semibold pt-2">Top Cited Domains</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          The domains that are most frequently cited in your responses.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-4 min-h-[280px]">
        <div className="flex justify-between space-x-6 relative h-full">
          <div className="relative w-full space-y-1.5 z-0">
            {domains.map((domain) => (
              <div
                key={domain.domain}
                className="group w-full rounded-sm outline-offset-2 outline-0 focus-visible:outline-2 outline-blue-500 dark:outline-blue-500"
              >
                <div
                  className="flex items-center rounded-sm transition-all h-8 bg-blue-200 dark:bg-blue-900"
                  style={{ width: `${domain.percentage}%` }}
                >
                  <div className="absolute left-2 flex gap-2 max-w-full pr-2">
                    <div className="flex items-center gap-2 bg-white rounded-sm p-0.5 size-5">
                      <img
                        alt={domain.domain}
                        className="aspect-square object-contain mr-2 rounded-[4px]"
                        src={domain.favicon}
                      />
                    </div>
                    <p className="truncate whitespace-nowrap text-sm">{domain.domain}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            {domains.map((domain) => (
              <div key={`count-${domain.domain}`} className="flex items-center justify-end h-8 mb-1.5">
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