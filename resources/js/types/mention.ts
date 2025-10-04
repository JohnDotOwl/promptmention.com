export interface MentionModel {
  id: string
  name: string
  icon: string
  color: string
}

export interface Mention {
  id: string
  domain: string
  url: string
  title: string
  domainRating: number
  pageRank: number
  position: number
  estimatedTraffic: number | null
  model: MentionModel
  firstSeen: string
  isExternal: boolean
  responseId?: number
  promptId?: number
  monitorName?: string
}

export interface MentionTableProps {
  mentions: Mention[]
  onSort?: (column: string, direction: 'asc' | 'desc') => void
}

export interface MentionSortConfig {
  column: string | null
  direction: 'asc' | 'desc'
}

export interface MentionStats {
  totalMentions: number
  averageDomainRating: number
  averagePosition: number
  topDomains: string[]
  modelBreakdown: { model: string; count: number }[]
}