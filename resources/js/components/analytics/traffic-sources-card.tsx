import { TrafficSource } from '@/types/analytics'

interface TrafficSourcesCardProps {
  data: TrafficSource[]
}

export function TrafficSourcesCard({ data }: TrafficSourcesCardProps) {
  const maxCount = Math.max(...data.map(d => d.count))
  
  return (
    <div className="h-[495px] space-y-4 border-r border-b p-8">
      <div>
        <h2 className="text-base font-semibold leading-none">Traffic Sources</h2>
      </div>
      <div className="h-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Source</span>
            <span className="text-muted-foreground text-sm">Visitors</span>
          </div>
          <div>
            <div className="flex justify-between space-x-6 relative">
              <div className="relative w-full space-y-1.5 z-0">
                {data.map((source, index) => (
                  <div key={source.source} className="group w-full rounded-sm outline-offset-2 outline-0 focus-visible:outline-2 outline-blue-500 dark:outline-blue-500">
                    <div 
                      className={`flex items-center rounded-sm transition-all h-8 bg-purple-100 hover:bg-purple-200 ${index === data.length - 1 ? 'mb-0' : ''}`} 
                      style={{ width: `${(source.count / maxCount) * 100}%` }}
                    >
                      <div className="absolute left-2 flex gap-2 max-w-full pr-2">
                        <p className="truncate whitespace-nowrap text-sm">{source.source}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                {data.map((source, index) => (
                  <div key={`${source.source}-count`} className={`flex items-center justify-end h-8 ${index === data.length - 1 ? 'mb-0' : 'mb-1.5'}`}>
                    <p className="truncate whitespace-nowrap text-sm leading-none text-muted-foreground">
                      {(source.count / 1000).toFixed(1)}k ({source.percentage}%)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}