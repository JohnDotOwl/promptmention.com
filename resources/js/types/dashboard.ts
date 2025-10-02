export interface DashboardMetric {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
}

export interface ModelUsageData {
  name: string
  value: number
  fill: string
}

export interface CitedDomain {
  domain: string
  favicon: string
  count: number
  percentage: number
}

export interface BrandMention {
  rank: number
  name: string
  mentions: number
  trend: number
  isPositive: boolean
}

export interface TimelineData {
  date: string
  'gemini-2.0-flash': number
  'gpt-4o-search': number
  'mistral-small-latest': number
}

export interface AIPlatformVisitor {
  platform: string
  domain: string
  favicon: string
  count: number
  changePercent: number
  isPositive: boolean
}

export interface BrandVisibilityData {
  date: string
  [brandName: string]: number | string
}

export interface TopBrand {
  name: string
  domain: string
  favicon?: string
  visibilityScore: number
  mentions: number
  color: string
}

export interface ShareOfVoiceData {
  ourBrand: number
  otherBrands: number
  trend: number
  isPositive: boolean
}

export interface VisibilityScorePoint {
  date: string
  visibilityScore: number
  responses: number
}

export interface DateRange {
  label: string
  value: string
  days: number
}

export interface DashboardData {
  metrics: DashboardMetric[]
  modelUsage: ModelUsageData[]
  citedDomains: CitedDomain[]
  brandMentions: BrandMention[]
  timeline: TimelineData[]
  aiPlatformVisitors?: AIPlatformVisitor[]
  brandVisibility?: BrandVisibilityData[]
  topBrands?: TopBrand[]
  shareOfVoice?: ShareOfVoiceData
  visibilityScoreTimeline?: VisibilityScorePoint[]
}