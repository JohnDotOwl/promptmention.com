export interface MonitorModel {
  id: string
  name: string
  icon: string
}

export interface MonitorStats {
  visibilityScore: number
  totalPrompts: number
  totalResponses: number
  mentions: number
  avgCitationRank: number
  visibilityData: ChartDataPoint[]
  mentionsData: ChartDataPoint[]
  citationData: ChartDataPoint[]
}

export interface ChartDataPoint {
  date: string
  value: number
}

export interface Website {
  name: string
  url: string
}

export interface Monitor {
  id: string
  name: string
  website: Website
  status: 'active' | 'inactive'
  lastUpdated: string
  createdAt: string
  stats: MonitorStats
  models: MonitorModel[]
}

export interface MonitorCardProps {
  monitor: Monitor
  onClick?: (monitor: Monitor) => void
}