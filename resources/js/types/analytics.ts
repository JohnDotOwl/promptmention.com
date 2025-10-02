export type TimePeriod = '24h' | '7d' | '14d' | '30d' | '90d'

export type AIDomain = 'google' | 'chatgpt' | 'claude' | 'perplexity'

export interface DomainFilter {
  id: AIDomain
  name: string
  color: string
  active: boolean
}

export interface AnalyticsDataPoint {
  timestamp: string
  date: string
  total: number
  google: number
  chatgpt: number
  claude: number
  perplexity: number
}

export interface AnalyticsMetrics {
  totalMentions: number
  dailyAverage: number
  weeklyGrowth: number
  topDomain: AIDomain
}

export interface AnalyticsFilters {
  timePeriod: TimePeriod
  activeDomains: AIDomain[]
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics
  timeSeries: AnalyticsDataPoint[]
  filters: AnalyticsFilters
}

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

export interface LocationData {
  country: string
  countryCode: string
  visitors: number
  percentage: number
}

export interface PageData {
  url: string
  title: string
  mentions: number
  percentage: number
}

export interface DeviceData {
  device: string
  count: number
  percentage: number
}

export interface TrafficSource {
  source: string
  count: number
  percentage: number
}

export interface RecentActivity {
  id: string
  timestamp: string
  source: AIDomain
  page: string
  location: string
  device: string
}

export interface ModelMention {
  model: string
  domain: string
  favicon: string
  count: number
  changePercent: number
  isPositive: boolean
}

export interface VisitorAnalytic {
  platform: string
  domain: string
  favicon: string
  count: number
  changePercent: number
  isPositive: boolean
}