import { RecentActivity } from '@/types/analytics'
import { formatDistanceToNow } from 'date-fns'

interface RecentActivityCardProps {
  data: RecentActivity[]
}

export function RecentActivityCard({ data }: RecentActivityCardProps) {
  const domainColors = {
    google: '#4285f4',
    chatgpt: '#10a37f',
    claude: '#ff6b35',
    perplexity: '#20b2aa',
  }
  
  return (
    <div className="h-[495px] space-y-4 border-r border-b p-8">
      <div>
        <h2 className="text-base font-semibold leading-none">Recent Activity</h2>
      </div>
      <div className="h-full overflow-y-auto">
        <div className="space-y-3">
          {data.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
              <div 
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" 
                style={{ backgroundColor: domainColors[activity.source] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {activity.page.replace('/prompts/', '')}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span className="capitalize">{activity.source}</span>
                  <span>•</span>
                  <span>{activity.location}</span>
                  <span>•</span>
                  <span>{activity.device}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}