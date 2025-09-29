import { useState, useMemo } from 'react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import type { BreadcrumbItem } from '@/types'
import type { AnalyticsDataPoint, TimePeriod, AIDomain } from '@/types/analytics'
import { getAnalyticsData, chartConfig, getLocationData, getPageData, getDeviceData, getTrafficSourceData, getRecentActivity } from '@/data/analytics'
import { AnalyticsChart } from '@/components/analytics/analytics-chart'
import { TopLocationsCard } from '@/components/analytics/top-locations-card'
import { TopPagesCard } from '@/components/analytics/top-pages-card'
import { DeviceBreakdownCard } from '@/components/analytics/device-breakdown-card'
import { TrafficSourcesCard } from '@/components/analytics/traffic-sources-card'
import { RecentActivityCard } from '@/components/analytics/recent-activity-card'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Analytics', href: '/analytics' }
]

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')
  const [activeDomains, setActiveDomains] = useState<AIDomain[]>(['google', 'chatgpt', 'claude', 'perplexity'])
  const [isLoading] = useState(false)

  const analyticsData = useMemo(() => {
    return getAnalyticsData(timePeriod)
  }, [timePeriod])
  
  const locationData = useMemo(() => getLocationData(), [])
  const pageData = useMemo(() => getPageData(), [])
  const deviceData = useMemo(() => getDeviceData(), [])
  const trafficSourceData = useMemo(() => getTrafficSourceData(), [])
  const recentActivityData = useMemo(() => getRecentActivity(), [])

  const filteredData = useMemo(() => {
    return analyticsData.timeSeries.map(point => {
      const filtered = { ...point }
      const inactiveDomains = ['google', 'chatgpt', 'claude', 'perplexity'].filter(
        domain => !activeDomains.includes(domain as AIDomain)
      )
      
      inactiveDomains.forEach(domain => {
        const domainKey = domain as keyof AnalyticsDataPoint
        if (domainKey in filtered && typeof filtered[domainKey] === 'number') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (filtered as any)[domainKey] = 0
        }
      })
      
      filtered.total = activeDomains.reduce((sum, domain) => sum + point[domain], 0)
      
      return filtered
    })
  }, [analyticsData.timeSeries, activeDomains])

  const handleDomainToggle = (domainId: AIDomain) => {
    setActiveDomains(prev => 
      prev.includes(domainId) 
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    )
  }

  const domains = [
    { id: 'google' as AIDomain, name: 'gemini.google.com', domain: 'gemini.google.com' },
    { id: 'google' as AIDomain, name: 'google.com', domain: 'google.com' },
    { id: 'chatgpt' as AIDomain, name: 'chatgpt.com', domain: 'chatgpt.com' },
    { id: 'claude' as AIDomain, name: 'claude.ai', domain: 'claude.ai' },
    { id: 'perplexity' as AIDomain, name: 'perplexity.ai', domain: 'perplexity.ai' }
  ]


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Analytics" />
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <div className="relative z-10 py-6">
          <div className="px-6 pb-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Analytics</h1>
              <div className="flex items-center gap-2"></div>
            </div>
          </div>
          
          {/* Custom Tab Navigation */}
          <div className="flex items-center gap-2 border-b px-6 pb-1">
            <div className="relative">
              <div className="relative">
                <div 
                  className={`absolute h-[30px] transition-all duration-300 ease-out bg-blue-100/75 dark:bg-[#ffffff1a] rounded-[6px] flex items-center ${
                    activeTab === 'overview' ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ left: activeTab === 'overview' ? '0px' : '95px', width: '85px' }}
                ></div>
                <div 
                  className={`absolute bottom-[-6px] h-[2px] bg-blue-600 dark:bg-white transition-all duration-300 ease-out`}
                  style={{ left: activeTab === 'overview' ? '0px' : '95px', width: '85px' }}
                ></div>
                <div className="relative flex space-x-[6px] items-center">
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] rounded-[6px] ${
                      activeTab === 'overview' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
                      Overview
                    </div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('settings')} 
                    className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] rounded-[6px] ${
                      activeTab === 'settings' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
                      Settings
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="py-6">
          {activeTab === 'overview' ? (
            <div>
              {/* Filters */}
              <div className="border-b px-6 pb-6 flex justify-between items-center w-full">
                <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)} className="flex flex-col gap-2">
                  <TabsList>
                    <TabsTrigger value="24h">Last 24 hours</TabsTrigger>
                    <TabsTrigger value="7d">Last 7 days</TabsTrigger>
                    <TabsTrigger value="14d">Last 14 days</TabsTrigger>
                    <TabsTrigger value="30d">Last 30 days</TabsTrigger>
                    <TabsTrigger value="90d">Last 90 days</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex gap-2 justify-end">
                  {domains.map((domain) => (
                    <Badge
                      key={domain.domain}
                      className="inline-flex items-center justify-center border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 gap-1 text-sm rounded-sm cursor-pointer bg-blue-100 border-blue-500 hover:bg-blue-200 text-foreground"
                      onClick={() => handleDomainToggle(domain.id)}
                    >
                      <img 
                        alt={domain.domain} 
                        loading="lazy" 
                        width="16" 
                        height="16" 
                        src={`https://www.google.com/s2/favicons?domain=${domain.domain}&sz=32`}
                        className="w-4 h-4"
                      />
                      {domain.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Chart */}
              <div className="w-full p-6 border-b">
                <div className="h-[340px] relative">
                  <div className="w-full relative h-full">
                    {isLoading && (
                      <div className="flex items-center justify-center h-full w-full absolute inset-0 z-10 bg-white/50">
                        <div className="text-muted-foreground text-sm bg-white py-1.5 px-3 rounded-md z-20 border shadow text-center flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Waiting for data...
                        </div>
                      </div>
                    )}
                    <AnalyticsChart
                      title=""
                      data={filteredData}
                      activeDomains={activeDomains}
                      chartConfig={chartConfig}
                      type="area"
                      className="h-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Analytics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <TopLocationsCard data={locationData} />
                <TopPagesCard data={pageData} />
                <DeviceBreakdownCard data={deviceData} />
                <TrafficSourcesCard data={trafficSourceData} />
                <RecentActivityCard data={recentActivityData} />
                <div className="h-[495px] space-y-4 border-r border-b p-8">
                  <div>
                    <h2 className="text-base font-semibold leading-none">Conversion Rate</h2>
                  </div>
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold">3.2%</div>
                      <div className="text-sm text-muted-foreground mt-2">+0.5% from last period</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-muted-foreground mt-2">
                  Analytics settings will be available soon
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}