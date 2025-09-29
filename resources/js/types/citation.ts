export interface CitationModel {
  id: string
  name: string
  icon: string
  color: string
}

export interface Citation {
  id: string
  domain: string
  url: string
  title: string
  domainRating: number
  pageRank: number
  position: number
  estimatedTraffic: number | null
  model: CitationModel
  firstSeen: string
  isExternal: boolean
}

export interface CitationTableProps {
  citations: Citation[]
  onSort?: (column: string, direction: 'asc' | 'desc') => void
}

export interface CitationSortConfig {
  column: string | null
  direction: 'asc' | 'desc'
}

export interface CitationStats {
  totalCitations: number
  averageDomainRating: number
  averagePosition: number
  topDomains: string[]
  modelBreakdown: { model: string; count: number }[]
}