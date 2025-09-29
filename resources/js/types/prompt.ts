export interface PromptModel {
  id: string
  name: string
  icon: string
  color: string
}

export type PromptType = 'brand-specific' | 'organic' | 'competitor'
export type PromptIntent = 'informational' | 'commercial'
export type ResponseSentiment = 'positive' | 'neutral' | 'negative' | 'mixed'

export interface Monitor {
  id: string
  name: string
  website?: {
    name: string
    url: string
  }
}

export interface Response {
  id: string
  model_name: string
  response_text: string
  brand_mentioned: boolean
  sentiment: ResponseSentiment | null
  visibility_score: number
  competitors_mentioned: string[]
  citation_sources: string[]
  tokens_used?: number
  cost?: number
  created_at: string
}

export interface Prompt {
  id: string
  text: string
  type: PromptType
  intent: PromptIntent
  responseCount: number
  visibility: number // percentage
  language: {
    code: string
    name: string
    flag: string
  }
  monitor: Monitor
  responses: Response[]
  created: string
  updated?: string
}

export interface PromptTableProps {
  prompts: Prompt[]
  onSort?: (column: string, direction: 'asc' | 'desc') => void
}

export interface PromptSortConfig {
  column: string | null
  direction: 'asc' | 'desc'
}

export interface PromptStats {
  totalPrompts: number
  averageVisibility: number
  typeBreakdown: { type: PromptType; count: number }[]
  intentBreakdown: { intent: PromptIntent; count: number }[]
  topMonitors: string[]
}

export interface PromptFilterState {
  search: string
  types: PromptType[]
  intents: PromptIntent[]
  monitors: string[]
  dateRange?: {
    start: string
    end: string
  }
}