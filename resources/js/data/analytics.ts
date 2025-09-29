import type { 
  AnalyticsData, 
  AnalyticsDataPoint, 
  DomainFilter, 
  TimePeriod,
  LocationData,
  PageData,
  DeviceData,
  TrafficSource,
  RecentActivity,
  AIDomain
} from '@/types/analytics'

export const domainFilters: DomainFilter[] = [
  { id: 'google', name: 'Google', color: '#4285f4', active: true },
  { id: 'chatgpt', name: 'ChatGPT', color: '#10a37f', active: true },
  { id: 'claude', name: 'Claude', color: '#ff6b35', active: true },
  { id: 'perplexity', name: 'Perplexity', color: '#20b2aa', active: true },
]

const generateTimeSeriesData = (period: TimePeriod): AnalyticsDataPoint[] => {
  const now = new Date()
  const dataPoints: AnalyticsDataPoint[] = []
  
  let days = 1
  switch (period) {
    case '24h': days = 1; break
    case '7d': days = 7; break
    case '14d': days = 14; break
    case '30d': days = 30; break
    case '90d': days = 90; break
  }
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Generate realistic random data with some trends
    const baseValue = 100 + Math.sin(i * 0.1) * 20
    const variance = Math.random() * 40 - 20
    
    const google = Math.max(0, Math.floor(baseValue * 0.35 + variance))
    const chatgpt = Math.max(0, Math.floor(baseValue * 0.3 + variance))
    const claude = Math.max(0, Math.floor(baseValue * 0.25 + variance))
    const perplexity = Math.max(0, Math.floor(baseValue * 0.1 + variance))
    
    dataPoints.push({
      timestamp: date.toISOString(),
      date: date.toLocaleDateString(),
      total: google + chatgpt + claude + perplexity,
      google,
      chatgpt,
      claude,
      perplexity,
    })
  }
  
  return dataPoints
}

export const getAnalyticsData = (period: TimePeriod = '7d'): AnalyticsData => {
  const timeSeries = generateTimeSeriesData(period)
  const totalMentions = timeSeries.reduce((sum, point) => sum + point.total, 0)
  const dailyAverage = Math.floor(totalMentions / timeSeries.length)
  
  // Calculate weekly growth (mock data)
  const weeklyGrowth = Math.floor(Math.random() * 20) - 5 // -5% to +15%
  
  // Find top domain
  const domainTotals = timeSeries.reduce(
    (acc, point) => ({
      google: acc.google + point.google,
      chatgpt: acc.chatgpt + point.chatgpt,
      claude: acc.claude + point.claude,
      perplexity: acc.perplexity + point.perplexity,
    }),
    { google: 0, chatgpt: 0, claude: 0, perplexity: 0 }
  )
  
  const topDomain = Object.entries(domainTotals).reduce((a, b) => 
    domainTotals[a[0] as keyof typeof domainTotals] > domainTotals[b[0] as keyof typeof domainTotals] ? a : b
  )[0] as 'google' | 'chatgpt' | 'claude' | 'perplexity'
  
  return {
    metrics: {
      totalMentions,
      dailyAverage,
      weeklyGrowth,
      topDomain,
    },
    timeSeries,
    filters: {
      timePeriod: period,
      activeDomains: ['google', 'chatgpt', 'claude', 'perplexity'],
    },
  }
}

export const chartConfig = {
  google: {
    label: 'Google',
    color: '#4285f4',
  },
  chatgpt: {
    label: 'ChatGPT',
    color: '#10a37f',
  },
  claude: {
    label: 'Claude',
    color: '#ff6b35',
  },
  perplexity: {
    label: 'Perplexity',
    color: '#20b2aa',
  },
  total: {
    label: 'Total',
    color: '#6b7280',
  },
}

// Generate mock location data
export const getLocationData = (): LocationData[] => {
  const locations = [
    { country: 'United States', countryCode: 'us', visitors: 24600, percentage: 45.2 },
    { country: 'United Kingdom', countryCode: 'gb', visitors: 12300, percentage: 22.6 },
    { country: 'Brazil', countryCode: 'br', visitors: 8900, percentage: 16.4 },
  ]
  return locations
}

// Generate mock page data
export const getPageData = (): PageData[] => {
  const pages = [
    { url: '/prompts/seo-meta-description', title: 'SEO Meta Description Generator', mentions: 3420, percentage: 28.5 },
    { url: '/prompts/email-subject-lines', title: 'Email Subject Line Writer', mentions: 2890, percentage: 24.1 },
    { url: '/prompts/product-descriptions', title: 'Product Description Creator', mentions: 2340, percentage: 19.5 },
  ]
  return pages
}

// Generate mock device data
export const getDeviceData = (): DeviceData[] => {
  const devices = [
    { device: 'Desktop', count: 45320, percentage: 62.5 },
    { device: 'Mobile', count: 22100, percentage: 30.5 },
    { device: 'Tablet', count: 5080, percentage: 7.0 },
  ]
  return devices
}

// Generate mock traffic source data
export const getTrafficSourceData = (): TrafficSource[] => {
  const sources = [
    { source: 'Direct', count: 28900, percentage: 38.5 },
    { source: 'Search', count: 24300, percentage: 32.4 },
    { source: 'Social', count: 12800, percentage: 17.1 },
    { source: 'Referral', count: 9000, percentage: 12.0 },
  ]
  return sources
}

// Generate mock recent activity data
export const getRecentActivity = (): RecentActivity[] => {
  const domains: AIDomain[] = ['google', 'chatgpt', 'claude', 'perplexity']
  const pages = [
    '/prompts/seo-meta-description',
    '/prompts/email-subject-lines',
    '/prompts/product-descriptions',
    '/prompts/blog-post-ideas',
    '/prompts/social-media-captions',
  ]
  const locations = ['United States', 'United Kingdom', 'Brazil', 'Germany', 'Japan']
  const devices = ['Desktop', 'Mobile', 'Tablet']
  
  const activities: RecentActivity[] = []
  const now = new Date()
  
  for (let i = 0; i < 3; i++) {
    const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000) // 5 minutes apart
    activities.push({
      id: `activity-${i}`,
      timestamp: timestamp.toISOString(),
      source: domains[Math.floor(Math.random() * domains.length)],
      page: pages[Math.floor(Math.random() * pages.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
    })
  }
  
  return activities
}