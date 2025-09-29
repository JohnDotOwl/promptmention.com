import { LocationData } from '@/types/analytics'

interface TopLocationsCardProps {
  data: LocationData[]
}

export function TopLocationsCard({ data }: TopLocationsCardProps) {
  const maxVisitors = Math.max(...data.map(d => d.visitors))
  
  return (
    <div className="h-[495px] space-y-4 border-r border-b p-8">
      <div>
        <h2 className="text-base font-semibold leading-none">Top Locations</h2>
      </div>
      <div className="h-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Country</span>
            <span className="text-muted-foreground text-sm">Visitors</span>
          </div>
          <div>
            <div className="flex justify-between space-x-6 relative">
              <div className="relative w-full space-y-1.5 z-0">
                {data.map((location, index) => (
                  <div key={location.countryCode} className="group w-full rounded-sm outline-offset-2 outline-0 focus-visible:outline-2 outline-blue-500 dark:outline-blue-500">
                    <div 
                      className={`flex items-center rounded-sm transition-all h-8 bg-blue-100 hover:bg-blue-200 ${index === data.length - 1 ? 'mb-0' : ''}`} 
                      style={{ width: `${(location.visitors / maxVisitors) * 100}%` }}
                    >
                      <div className="absolute left-2 flex gap-2 max-w-full pr-2">
                        <div className="flex items-center gap-2 bg-white rounded-sm p-0.5 size-5">
                          <img 
                            alt={location.country} 
                            className="aspect-square object-contain mr-2 rounded-[4px]" 
                            src={`https://flagpedia.net/data/flags/icon/32x24/${location.countryCode}.webp`}
                          />
                        </div>
                        <p className="truncate whitespace-nowrap text-sm">{location.country}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                {data.map((location, index) => (
                  <div key={`${location.countryCode}-count`} className={`flex items-center justify-end h-8 ${index === data.length - 1 ? 'mb-0' : 'mb-1.5'}`}>
                    <p className="truncate whitespace-nowrap text-sm leading-none text-muted-foreground">
                      {(location.visitors / 1000).toFixed(1)}k
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