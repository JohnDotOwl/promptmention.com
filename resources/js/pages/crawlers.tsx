import { useState } from 'react'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import type { BreadcrumbItem } from '@/types'
import { generateCrawlerData, generateCrawlerLogs } from '@/data/crawler'
import { CrawlerChart } from '@/components/analytics/crawler-chart'
import { CrawlerLogsTable } from '@/components/analytics/crawler-logs-table'
import { CrawlerSettings } from '@/components/analytics/crawler-settings'

type TimePeriod = '1d' | '7d' | '30d' | '90d'

interface Monitor {
  name: string
  website_name: string
  website_url: string
}

interface CrawlersPageProps {
  monitors?: Monitor[]
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Crawler Analytics', href: '/crawlers' }
]

export default function Crawlers({ monitors = [] }: CrawlersPageProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  const getDaysFromPeriod = (period: TimePeriod): number => {
    switch (period) {
      case '1d': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  };

  const crawlerData = generateCrawlerData(getDaysFromPeriod(timePeriod));
  const crawlerLogs = generateCrawlerLogs(20);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crawler Analytics" />
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <div className="relative z-10 py-6">
          <div>
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">Crawler Analytics</h1>
                  <Badge variant="secondary" className="text-xs">Demo</Badge>
                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 dark:text-blue-400">Coming Soon</Badge>
                </div>
                <div className="flex items-center gap-2"></div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b px-6 pb-1">
              <div className="relative">
                <div className="relative">
                  <div 
                    className="absolute h-[30px] transition-all duration-300 ease-out bg-blue-100/75 dark:bg-[#ffffff1a] rounded-[6px] flex items-center"
                    style={{ 
                      opacity: 1,
                      left: activeTab === 'overview' ? '0px' : '91px',
                      width: activeTab === 'overview' ? '85px' : '73px'
                    }}
                  />
                  <div 
                    className="absolute bottom-[-6px] h-[2px] bg-blue-600 dark:bg-white transition-all duration-300 ease-out"
                    style={{ 
                      left: activeTab === 'overview' ? '0px' : '91px',
                      width: activeTab === 'overview' ? '85px' : '73px'
                    }}
                  />
                  <div className="relative flex space-x-[6px] items-center">
                    <button
                      type="button"
                      className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] rounded-[6px] ${
                        activeTab === 'overview' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                      }`}
                      onClick={() => setActiveTab('overview')}
                    >
                      <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
                        Overview
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] rounded-[6px] ${
                        activeTab === 'settings' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                      }`}
                      onClick={() => setActiveTab('settings')}
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

          <div className="py-6">
            <div className="relative">
              {activeTab === 'overview' ? (
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-semibold">Crawler Analytics</h1>
                      <p className="text-muted-foreground mt-1">Monitor traffic from known crawler bots.</p>
                    </div>
                    <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
                      <TabsList>
                        <TabsTrigger value="1d">Last 24 hours</TabsTrigger>
                        <TabsTrigger value="7d">Last 7 days</TabsTrigger>
                        <TabsTrigger value="30d">Last 30 days</TabsTrigger>
                        <TabsTrigger value="90d">Last 90 days</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <CrawlerChart data={crawlerData} />

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Crawler Logs</h3>
                    <CrawlerLogsTable logs={crawlerLogs} />
                  </div>
                </div>
              ) : (
                <CrawlerSettings monitors={monitors} />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}