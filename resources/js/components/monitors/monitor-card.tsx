import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MonitorStats } from './monitor-stats'
import { type MonitorCardProps } from '@/types/monitor'
import { RefreshCcw, Calendar, FileText, MessageSquareReply } from 'lucide-react'

export function MonitorCard({ monitor }: MonitorCardProps) {

  return (
    <a className="block" href={`/monitors/${monitor.id}`}>
      <Card 
        id="monitor-card"
        className="group w-full transition-all duration-200 hover:shadow-md gap-0 mb-0 py-0"
      >
        <CardHeader className="border-b bg-gray-50 py-3 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <div className="group-hover:text-primary text-lg transition-colors font-semibold">
                  {monitor.website.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {monitor.website.url} • {monitor.name}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 capitalize">
                  <RefreshCcw className="size-3.5" aria-hidden="true" />
                  <span>{monitor.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" aria-hidden="true" />
                  <span>{monitor.createdAt}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="min-w-[14px] size-3.5" aria-hidden="true" />
                  <span>{monitor.stats.totalPrompts} Prompts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquareReply className="min-w-[14px] size-3.5" aria-hidden="true" />
                  <span>{monitor.stats.totalResponses} Responses</span>
                </div>
                <div className="text-left">
                  <Badge 
                    className={
                      monitor.status === 'active' 
                        ? "rounded-full border-green-500 bg-green-500 text-white hover:bg-green-500/90" 
                        : "rounded-full border-gray-500 bg-gray-500 text-white hover:bg-gray-500/90"
                    }
                  >
                    {monitor.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-0">
          <div className="grid grid-cols-9 gap-4">
            {/* Visibility Score */}
            <div className="border-r pr-4 col-span-1 pt-3 pb-2">
              <div className="text-sm text-muted-foreground leading-relaxed">Visibility Score</div>
              <div className="text-2xl font-semibold leading-relaxed tabular-nums">{monitor.stats.visibilityScore}%</div>
              <div className="text-muted-foreground mb-4 text-xs">Based on {monitor.stats.totalPrompts} prompts</div>
            </div>

            {/* Models */}
            <div className="border-r pr-4 col-span-2 pt-4">
              <div className="mb-2 text-sm text-muted-foreground leading-relaxed">Models</div>
              <div className="mb-1 flex flex-wrap gap-2">
                {monitor.models.map((model) => (
                  <div key={model.id} className="bg-muted flex items-center gap-1.5 rounded-full px-2 py-1 text-xs shrink-0">
                    <img 
                      alt=""
                      loading="lazy" 
                      width="14" 
                      height="14" 
                      decoding="async" 
                      data-nimg="1"
                      src={model.icon}
                      className="w-[14px] h-[14px]"
                      style={{ color: 'transparent' }}
                    />
                    {model.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Visibility Chart */}
            <div className="border-r pr-4 col-span-2 pt-4">
              <div className="pointer-events-none h-full">
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Visibility: <span className="font-medium text-foreground">{monitor.stats.visibilityScore}%</span>
                </div>
                <MonitorStats stats={monitor.stats} type="visibility" />
              </div>
            </div>

            {/* Mentions Chart */}
            <div className="border-r pr-4 col-span-2 pt-4">
              <div className="pointer-events-none h-full w-full">
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Mentions: <span className="font-medium text-foreground">{monitor.stats.mentions}</span>
                </div>
                <MonitorStats stats={monitor.stats} type="mentions" />
              </div>
            </div>

            {/* Citation Rank Chart */}
            <div className="col-span-2 pt-4">
              <div className="pointer-events-none h-full w-full">
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Avg. Citation Rank: <span className="font-medium text-foreground">{monitor.stats.avgCitationRank}</span>
                </div>
                <MonitorStats stats={monitor.stats} type="citation" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}