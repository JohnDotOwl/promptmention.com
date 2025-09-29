import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type Citation } from '@/types/citation'
import { useMemo } from 'react'

interface TopDomainsCardProps {
  citations: Citation[]
}

interface DomainStats {
  domain: string
  count: number
  percentage: number
}

export function TopDomainsCard({ citations }: TopDomainsCardProps) {
  const domainStats = useMemo(() => {
    // Group citations by domain and count them
    const domainCounts = citations.reduce((acc, citation) => {
      acc[citation.domain] = (acc[citation.domain] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Convert to array and sort by count
    const stats = Object.entries(domainCounts)
      .map(([domain, count]) => ({
        domain,
        count,
        percentage: (count / citations.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 domains

    return stats
  }, [citations])

  const maxCount = Math.max(...domainStats.map(d => d.count))

  return (
    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shrink-0 ring-muted/60 border shadow-sm ring-3">
      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 pt-4 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-2">
        <CardTitle className="leading-none font-semibold">Top Domains</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Most frequently cited domains
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="h-96">
          <div className="flex justify-between space-x-6 relative">
            <div className="relative w-full space-y-1.5 z-0">
              {domainStats.map((stat) => (
                <div
                  key={stat.domain}
                  className="group w-full rounded-sm outline-offset-2 outline-0 focus-visible:outline-2 outline-blue-500 dark:outline-blue-500"
                >
                  <div
                    className="flex items-center rounded-sm transition-all h-8 bg-blue-200 dark:bg-blue-900"
                    style={{ width: `${(stat.count / maxCount) * 100}%` }}
                  >
                    <div className="absolute left-2 flex gap-2 max-w-full pr-2">
                      <div className="flex items-center gap-2 bg-white rounded-sm p-0.5 size-5">
                        <img
                          alt={stat.domain}
                          loading="lazy"
                          width="64"
                          height="64"
                          className="aspect-square object-contain mr-2 rounded-[4px] w-4 h-4"
                          src={`https://www.google.com/s2/favicons?domain=${stat.domain}&size=256`}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                      <p className="truncate whitespace-nowrap text-sm">{stat.domain}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              {domainStats.map((stat, index) => (
                <div
                  key={stat.domain}
                  className={`flex items-center justify-end h-8 ${
                    index === domainStats.length - 1 ? 'mb-0' : 'mb-1.5'
                  }`}
                >
                  <p className="truncate whitespace-nowrap text-sm leading-none text-muted-foreground">
                    {stat.count} citations
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}