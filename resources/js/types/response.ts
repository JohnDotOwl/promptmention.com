export interface ResponseModel {
  id: string
  name: string
  displayName: string
  icon: string
  color: string
}

export type BrandSentiment = 'positive' | 'neutral' | 'negative'

export interface BrandMention {
  brandName: string
  sentiment: BrandSentiment
  mentioned: boolean
}

export interface CompetitorMention {
  competitorName: string
  mentioned: boolean
}

export interface CitationSource {
  url: string
  title: string
}

export interface CitationPosition {
  marker: string
  numbers: number[]
  position: number
  end_position: number
  source_index?: number
}

export interface Response {
  id: string
  text: string
  textWithCitations?: string // Text with inline [1], [2,3] markers
  model: ResponseModel
  visibility: number // percentage
  brandMentions: BrandMention[]
  competitorMentions: CompetitorMention[]
  answered: string
  promptId?: string
  tokens?: number
  cost?: number
  citations?: {
    sources: CitationSource[]
    mapping: Record<string, number>
    positions: CitationPosition[]
    count: number
    fingerprint?: any
  }
}

export interface ResponseTableProps {
  responses: Response[]
  onSort?: (column: string, direction: 'asc' | 'desc') => void
}

export interface ResponseSortConfig {
  column: string | null
  direction: 'asc' | 'desc'
}

export interface ResponseStats {
  totalResponses: number
  averageVisibility: number
  modelBreakdown: { model: string; count: number; percentage: number }[]
  sentimentBreakdown: { sentiment: BrandSentiment; count: number }[]
  topBrands: string[]
  topCompetitors: string[]
  totalCost: number
  totalTokens: number
}

export interface ResponseFilterState {
  brandSentiment: BrandSentiment[]
  models: string[]
  types: string[]
  dateRange?: {
    start: string
    end: string
  }
}

export interface ModelUsageData {
  name: string
  count: number
  color: string
}

export interface ResponseTimelineData {
  date: string
  [modelName: string]: string | number
}