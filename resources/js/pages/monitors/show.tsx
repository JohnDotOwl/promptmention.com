import { useState, useMemo, useRef, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Bot,
  ChevronDown,
  Info,
  ListFilter,
  Filter,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from 'recharts'
import type { BreadcrumbItem } from '@/types'
import type { PromptSortConfig } from '@/types/prompt'
import { mockPrompts } from '@/data/prompts'
import { PromptsTable } from '@/components/prompts/prompts-table'
import { mockResponses } from '@/data/responses'
import { ResponsesTable } from '@/components/responses/responses-table'
import type { Response, ResponseSortConfig } from '@/types/response'
import { MentionsTable } from '@/components/mentions/mentions-table'
import { mockMentions } from '@/data/mentions'
import type { Mention, MentionSortConfig } from '@/types/mention'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Copy, CircleHelp } from 'lucide-react'

interface PageProps {
  id: string
  monitor: {
    id: string
    name: string
    website: {
      name: string
      url: string
    }
    status: string
    stats: {
      visibilityScore: number
      mentions: number
      avgMentionRank: number
      totalPrompts: number
      totalResponses: number
    }
    models: Array<{
      id: string
      name: string
      icon: string
    }>
    lastUpdated: string
    createdAt: string
  }
}

// Heatmap data interface
interface HeatmapData {
  competitor: string
  isUs?: boolean
  visibility: {
    [model: string]: number | null
  }
}

// Generate heatmap data
const generateHeatmapData = (): HeatmapData[] => {
  const competitors = [
    { name: 'Pay Boy (Us)', isUs: true },
    { name: 'BambooHR', isUs: false },
    { name: 'Xero', isUs: false },
    { name: 'Workday', isUs: false },
    { name: 'QuickBooks', isUs: false },
    { name: 'Talenox', isUs: false },
    { name: 'Deputy', isUs: false },
    { name: 'Gusto', isUs: false },
  ]

  // Mock visibility data based on the heatmap.md structure
  const visibilityData: { [key: string]: { [model: string]: number | null } } = {
    'Pay Boy (Us)': { 'mistral-small': 16.7, 'chatgpt-search': 20, 'gemini-2-flash': 16.7 },
    'BambooHR': { 'mistral-small': 20, 'chatgpt-search': 3.3, 'gemini-2-flash': 10 },
    'Xero': { 'mistral-small': 13.3, 'chatgpt-search': 13.3, 'gemini-2-flash': 3.3 },
    'Workday': { 'mistral-small': 20, 'chatgpt-search': null, 'gemini-2-flash': 6.7 },
    'QuickBooks': { 'mistral-small': 13.3, 'chatgpt-search': 6.7, 'gemini-2-flash': 3.3 },
    'Talenox': { 'mistral-small': 6.7, 'chatgpt-search': 6.7, 'gemini-2-flash': 6.7 },
    'Deputy': { 'mistral-small': 10, 'chatgpt-search': 3.3, 'gemini-2-flash': 3.3 },
    'Gusto': { 'mistral-small': 13.3, 'chatgpt-search': 3.3, 'gemini-2-flash': null },
  }

  return competitors.map(competitor => ({
    competitor: competitor.name,
    isUs: competitor.isUs,
    visibility: visibilityData[competitor.name] || {}
  }))
}

// Get color class based on visibility percentage
const getVisibilityColor = (value: number | null): string => {
  if (value === null) return 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600'
  if (value >= 20) return 'bg-emerald-600 text-white dark:text-white'
  if (value >= 16.7) return 'bg-emerald-500 text-white dark:text-white'
  if (value >= 13) return 'bg-emerald-400 text-gray-900 dark:text-gray-50'
  if (value >= 10) return 'bg-emerald-200 text-gray-900 dark:text-gray-50'
  if (value >= 6.7) return 'bg-emerald-100 text-gray-900 dark:text-gray-50'
  if (value > 0) return 'bg-emerald-50 text-gray-900 dark:text-gray-50'
  return 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600'
}

// Mock mention data for the middle section
const mockMentionDomains = [
  { domain: 'reddit.com', count: 9, percentage: 100, favicon: 'https://www.google.com/s2/favicons?domain=reddit.com&size=64' },
  { domain: 'selecthub.com', count: 4, percentage: 44.4, favicon: 'https://www.google.com/s2/favicons?domain=selecthub.com&size=64' },
  { domain: 'wise.com', count: 2, percentage: 22.2, favicon: 'https://www.google.com/s2/favicons?domain=wise.com&size=64' },
  { domain: 'volopay.com', count: 2, percentage: 22.2, favicon: 'https://www.google.com/s2/favicons?domain=volopay.com&size=64' },
  { domain: 'hrtech.sg', count: 2, percentage: 22.2, favicon: 'https://www.google.com/s2/favicons?domain=hrtech.sg&size=64' },
  { domain: 'payboy.sg', count: 2, percentage: 22.2, favicon: 'https://www.google.com/s2/favicons?domain=payboy.sg&size=64' },
  { domain: 'funempire.com', count: 1, percentage: 11.1, favicon: 'https://www.google.com/s2/favicons?domain=funempire.com&size=64' },
  { domain: 'omnihr.co', count: 1, percentage: 11.1, favicon: 'https://www.google.com/s2/favicons?domain=omnihr.co&size=64' },
]

// Generate visibility chart data (showing recent spike)
const generateVisibilityData = () => {
  const dates = []
  const today = new Date()
  
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    let value = 0
    if (i <= 4) { // Recent activity spike
      value = 42.8
    }
    
    dates.push({
      date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      value
    })
  }
  
  return dates
}

// Generate mention rank performance data
const generateMentionRankData = () => {
  const dates = []
  const today = new Date()
  
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    let position = 0
    if (i <= 4) { // Recent mentions
      position = 5.0
    }
    
    dates.push({
      date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      Position: position
    })
  }
  
  return dates
}

// Generate mention data over time for multiple domains
const generateMentionOverTimeData = (period: string = '7d') => {
  const dates = []
  const today = new Date()
  let days = 7
  
  switch (period) {
    case '14d': days = 14; break
    case '30d': days = 30; break
    case '90d': days = 90; break
    default: days = 7; break
  }
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Create mock data for different domains with some recent activity
    const dataPoint: {
      date: string
      [key: string]: number | string
    } = {
      date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
    }
    
    // Add data for top domains from mockMentionDomains
    mockMentionDomains.forEach((domain) => {
      let value = 0
      if (i <= 4) { // Recent activity
        // Give different values based on domain popularity
        value = Math.max(0, domain.count - Math.floor(Math.random() * 2))
      }
      dataPoint[domain.domain] = value
    })
    
    dates.push(dataPoint)
  }
  
  return dates
}

// Custom Tab Navigation Component
function MonitorTabs({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const [tabPositions, setTabPositions] = useState<{ left: number; width: number }>({ left: 0, width: 0 })

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'prompts', label: 'Prompts' },
    { id: 'responses', label: 'Responses' },
    { id: 'mentions', label: 'Mentions' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'answer-gap', label: 'Answer Gap' },
    { id: 'settings', label: 'Settings' },
  ]

  // Calculate tab positions dynamically
  useEffect(() => {
    if (!tabsContainerRef.current) return

    const activeTabElement = tabsContainerRef.current.querySelector(`#${activeTab}`) as HTMLElement
    if (activeTabElement) {
      const containerRect = tabsContainerRef.current.getBoundingClientRect()
      const tabRect = activeTabElement.getBoundingClientRect()
      
      setTabPositions({
        left: tabRect.left - containerRect.left,
        width: tabRect.width
      })
    }
  }, [activeTab])

  return (
    <div className="flex items-center gap-2 border-b px-6 pb-1">
      <div className="relative">
        <div className="relative" ref={tabsContainerRef}>
          <div 
            className="absolute h-[30px] transition-all duration-300 ease-out bg-blue-100/75 dark:bg-[#ffffff1a] rounded-[6px] flex items-center" 
            style={{ 
              opacity: activeTab ? 1 : 0,
              left: `${tabPositions.left}px`,
              width: `${tabPositions.width}px`
            }}
          />
          <div 
            className="absolute bottom-[-6px] h-[2px] bg-blue-600 dark:bg-white transition-all duration-300 ease-out"
            style={{ 
              left: `${tabPositions.left}px`, 
              width: `${tabPositions.width}px`
            }}
          />
          <div className="relative flex space-x-[6px] items-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                id={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] rounded-[6px] ${
                  activeTab === tab.id 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
                  {tab.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


export default function MonitorShow({ id, monitor }: PageProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [activeFilter, setActiveFilter] = useState('7d')
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState<PromptSortConfig>({
    column: null,
    direction: 'desc'
  })
  const [typeFilters, setTypeFilters] = useState<string[]>([])
  const [showTypeFilter, setShowTypeFilter] = useState(false)
  
  // Response tab states
  const [responseSortConfig, setResponseSortConfig] = useState<ResponseSortConfig>({
    column: null,
    direction: 'desc'
  })
  const [responseBrandSentiment, setResponseBrandSentiment] = useState<string[]>([])
  const [responseModel, setResponseModel] = useState('all-models')
  const [responseType, setResponseType] = useState('all-types')
  const [sentimentPopoverOpen, setSentimentPopoverOpen] = useState(false)
  
  // Mentions tab states
  const [mentionsTimeFilter, setMentionsTimeFilter] = useState('7d')
  const [mentionsSortConfig, setMentionsSortConfig] = useState<MentionSortConfig>({
    column: null,
    direction: 'desc'
  })
  const [mentionsModelFilter, setMentionsModelFilter] = useState('all-models')
  const [mentionsTypeFilter, setMentionsTypeFilter] = useState('all-types')
  const [mentionsCompetitorFilter, setMentionsCompetitorFilter] = useState('all-competitors')
  
  // Heatmap tab states
  const [heatmapTimeFilter, setHeatmapTimeFilter] = useState('7d')
  const [heatmapTypeFilter, setHeatmapTypeFilter] = useState('all-types')
  
  // Settings tab states
  const [monitorName, setMonitorName] = useState('Demo Monitor')
  const [monitorDescription, setMonitorDescription] = useState('A variety of prompts to track your brand across AI models.')
  const [monitorLanguage, setMonitorLanguage] = useState('en-US')
  const [monitorCountry, setMonitorCountry] = useState('US')
  const [selectedModels, setSelectedModels] = useState(['chatgpt-search', 'gemini-2-flash', 'mistral-small'])
  
  // Monitor data is passed as prop from controller

  // Filter prompts for this monitor
  const monitorPrompts = useMemo(() => {
    return mockPrompts.filter(prompt => prompt.monitor.id === id)
  }, [id])

  // Get responses for this monitor (for now, we'll use all mock responses)
  const monitorResponses = useMemo(() => {
    // In a real app, you'd filter by monitor ID
    // For now, we'll just return all responses as examples
    return mockResponses
  }, [])

  // Handle sorting
  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortConfig({ column, direction })
  }

  // Apply sorting to prompts
  const sortedPrompts = useMemo(() => {
    if (!sortConfig.column) return monitorPrompts

    return [...monitorPrompts].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortConfig.column) {
        case 'text':
          aValue = a.text
          bValue = b.text
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'intent':
          aValue = a.intent
          bValue = b.intent
          break
        case 'responseCount':
          aValue = a.responseCount
          bValue = b.responseCount
          break
        case 'visibility':
          aValue = a.visibility
          bValue = b.visibility
          break
        case 'created':
          aValue = new Date(a.created)
          bValue = new Date(b.created)
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [monitorPrompts, sortConfig])

  // Apply search and type filters
  const filteredPrompts = useMemo(() => {
    return sortedPrompts.filter(prompt => {
      const matchesSearch = prompt.text.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilters.length === 0 || typeFilters.includes(prompt.type)
      return matchesSearch && matchesType
    })
  }, [sortedPrompts, search, typeFilters])

  // Handle type filter toggle
  const handleTypeFilterToggle = (type: string) => {
    setTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Handle sentiment filter toggle
  const handleSentimentFilterToggle = (sentiment: string) => {
    setResponseBrandSentiment(prev => 
      prev.includes(sentiment) 
        ? prev.filter(s => s !== sentiment)
        : [...prev, sentiment]
    )
  }

  // Get available prompt types
  const availableTypes = useMemo(() => {
    const types = [...new Set(monitorPrompts.map(p => p.type))]
    return types.map(type => ({
      value: type,
      label: type === 'brand-specific' ? 'Brand Specific' : 
             type === 'organic' ? 'Organic' : 
             type === 'competitor' ? 'Competitor' : type,
      count: monitorPrompts.filter(p => p.type === type).length
    }))
  }, [monitorPrompts])

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Monitors', href: '/monitors' },
    { title: 'Details', href: `/monitors/${id}` },
  ]

  // Handle response sorting
  const handleResponseSort = (column: string, direction: 'asc' | 'desc') => {
    setResponseSortConfig({ column, direction })
  }

  // Apply sorting to responses
  const sortedResponses = useMemo(() => {
    if (!responseSortConfig.column) return monitorResponses

    return [...monitorResponses].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (responseSortConfig.column) {
        case 'model':
          aValue = a.model.name
          bValue = b.model.name
          break
        case 'visibility':
          aValue = a.visibility
          bValue = b.visibility
          break
        case 'mentioned':
          aValue = a.brandMentions.some(b => b.mentioned) ? 1 : 0
          bValue = b.brandMentions.some(b => b.mentioned) ? 1 : 0
          break
        case 'competitors':
          aValue = a.competitorMentions.some(c => c.mentioned) ? 1 : 0
          bValue = b.competitorMentions.some(c => c.mentioned) ? 1 : 0
          break
        case 'answered':
          aValue = new Date(a.answered)
          bValue = new Date(b.answered)
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return responseSortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return responseSortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [monitorResponses, responseSortConfig])

  // Apply filters to responses
  const filteredResponses = useMemo(() => {
    return sortedResponses.filter(response => {
      // Brand sentiment filter
      if (responseBrandSentiment.length > 0) {
        const hasSentiment = response.brandMentions.some(b => 
          b.mentioned && responseBrandSentiment.includes(b.sentiment)
        )
        if (!hasSentiment) return false
      }

      // Model filter
      if (responseModel !== 'all-models' && response.model.id !== responseModel) {
        return false
      }

      // Type filter would go here if responses had types

      return true
    })
  }, [sortedResponses, responseBrandSentiment, responseModel])

  const visibilityData = useMemo(() => generateVisibilityData(), [])
  const mentionRankData = useMemo(() => generateMentionRankData(), [])
  const heatmapData = useMemo(() => generateHeatmapData(), [])
  
  // Mentions data and handlers
  const mentionOverTimeData = useMemo(() => generateMentionOverTimeData(mentionsTimeFilter), [mentionsTimeFilter])
  
  // Handle mention sorting
  const handleMentionSort = (column: string, direction: 'asc' | 'desc') => {
    setMentionsSortConfig({ column, direction })
  }
  
  // Get mentions for this monitor (using mock data for now)
  const monitorMentions = useMemo(() => {
    // In a real app, you'd filter by monitor ID
    return mockMentions
  }, [])
  
  // Apply sorting to mentions
  const sortedMentions = useMemo(() => {
    if (!mentionsSortConfig.column) return monitorMentions

    return [...monitorMentions].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (mentionsSortConfig.column) {
        case 'domain':
          aValue = a.domain
          bValue = b.domain
          break
        case 'domainRating':
          aValue = a.domainRating
          bValue = b.domainRating
          break
        case 'pageRank':
          aValue = a.pageRank
          bValue = b.pageRank
          break
        case 'position':
          aValue = a.position
          bValue = b.position
          break
        case 'url':
          aValue = a.title
          bValue = b.title
          break
        case 'firstSeen':
          aValue = new Date(a.firstSeen)
          bValue = new Date(b.firstSeen)
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return mentionsSortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return mentionsSortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [monitorMentions, mentionsSortConfig])
  
  // Apply filters to mentions
  const filteredMentions = useMemo(() => {
    return sortedMentions.filter(mention => {
      // Model filter
      if (mentionsModelFilter !== 'all-models' && mention.model.id !== mentionsModelFilter) {
        return false
      }
      
      // Add additional filters here as needed
      return true
    })
  }, [sortedMentions, mentionsModelFilter])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Monitor - ${monitor.name}`} />
      
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <div className="relative z-10 py-6">
          <div>
            {/* Header Section */}
            <div className="px-6 pb-6">
              <div className="mb-6" />
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{monitor.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center flex-wrap gap-2 gap-y-1 justify-end">
                    {monitor.models.map((model) => (
                      <div key={model.id} className="bg-muted flex items-center gap-1.5 rounded-full px-2 py-1 text-xs shrink-0">
                        <img 
                          alt=""
                          loading="lazy" 
                          width="14" 
                          height="14" 
                          decoding="async" 
                          data-nimg="1"
                          src={model.icon}
                          style={{ color: 'transparent' }}
                        />
                        {model.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <MonitorTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="py-6">
              <div className="transition-all duration-300 animate-in fade-in">
              {/* Filters */}
              <div className="flex items-center justify-between gap-2 pb-6 px-6">
                <Tabs value={activeFilter} onValueChange={setActiveFilter} className="flex flex-col gap-2">
                  <TabsList className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]">
                    <TabsTrigger value="7d" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Last 7 days</TabsTrigger>
                    <TabsTrigger value="14d" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Last 14 days</TabsTrigger>
                    <TabsTrigger value="30d" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Last 30 days</TabsTrigger>
                    <TabsTrigger value="90d" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Last 90 days</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex items-center gap-2">
                  <Select defaultValue="all-models">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          All Models
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-models">All Models</SelectItem>
                      {monitor.models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="all-types">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue>All Types</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-types">All Types</SelectItem>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="competitor">Competitor</SelectItem>
                      <SelectItem value="brand-specific">Brand Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Overview Charts */}
              <div className="border-y px-6">
                <div className="grid gap-6 grid-cols-3">
                  {/* Visibility Score Chart */}
                  <div className="col-span-1 py-6">
                    <div>
                      <div className="flex items-end gap-2">
                        <div>
                          <div className="flex items-center gap-1">
                            <h2 className="text-sm text-muted-foreground leading-relaxed">Visibility Score</h2>
                            <Button variant="ghost" size="sm" className="h-auto p-0">
                              <Info className="size-4 pl-1 text-muted-foreground" />
                            </Button>
                          </div>
                          <strong className="text-xl font-semibold leading-relaxed">
                            42.8% <span className="font-normal text-muted-foreground">Visibility</span>
                          </strong>
                        </div>
                      </div>
                      <div className="mt-4.5 relative" style={{ height: '310px' }}>
                        <div className="w-full relative h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={visibilityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                              <XAxis 
                                dataKey="date" 
                                className="text-xs fill-gray-500 dark:fill-gray-500"
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis 
                                className="text-xs fill-gray-500 dark:fill-gray-500"
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `${value}%`}
                              />
                              <defs>
                                <linearGradient id="visibilityGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="rgb(59 130 246)" stopOpacity="0.3" />
                                  <stop offset="95%" stopColor="rgb(59 130 246)" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke="rgb(59 130 246)"
                                strokeWidth={2}
                                fill="url(#visibilityGradient)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mentions */}
                  <div className="col-span-1 py-6 border-x border-border px-6">
                    <div>
                      <div className="flex items-end gap-2">
                        <div>
                          <div className="flex items-center gap-1">
                            <h2 className="text-sm text-muted-foreground leading-relaxed">Mentions</h2>
                            <Button variant="ghost" size="sm" className="h-auto p-0">
                              <Info className="size-4 pl-1 text-muted-foreground" />
                            </Button>
                          </div>
                          <strong className="text-xl font-semibold leading-relaxed">
                            52 <span className="font-normal text-muted-foreground">Domains</span>
                          </strong>
                        </div>
                      </div>
                      <div className="mt-4.5 relative" style={{ height: '310px' }}>
                        <div className="flex justify-between space-x-6 relative h-full">
                          <div className="relative w-full space-y-1.5 z-0">
                            {mockMentionDomains.map((domain) => (
                              <div key={domain.domain} className="group w-full rounded-sm outline-offset-2 outline-0 focus-visible:outline-2 outline-blue-500 dark:outline-blue-500">
                                <div 
                                  className="flex items-center rounded-sm transition-all h-8 bg-blue-200 dark:bg-blue-900"
                                  style={{ width: `${domain.percentage}%` }}
                                >
                                  <div className="absolute left-2 flex gap-2 max-w-full pr-2">
                                    <div className="flex items-center gap-2 bg-white rounded-sm p-0.5 size-5">
                                      <img 
                                        alt={domain.domain}
                                        loading="lazy" 
                                        width="64" 
                                        height="64" 
                                        decoding="async" 
                                        data-nimg="1"
                                        className="aspect-square object-contain mr-2 rounded-[4px] w-4 h-4"
                                        src={domain.favicon}
                                        style={{ color: 'transparent' }}
                                      />
                                    </div>
                                    <p className="truncate whitespace-nowrap text-sm">{domain.domain}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            {mockMentionDomains.map((domain) => (
                              <div key={domain.domain} className="flex items-center justify-end h-8 mb-1.5 last:mb-0">
                                <p className="truncate whitespace-nowrap text-sm leading-none text-muted-foreground">
                                  {domain.count}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mention Rank Performance */}
                  <div className="col-span-1 py-6">
                    <div>
                      <div className="flex items-end gap-2">
                        <div>
                          <div className="flex items-center gap-1">
                            <h2 className="text-sm text-muted-foreground leading-relaxed">Mention Rank Performance</h2>
                            <Button variant="ghost" size="sm" className="h-auto p-0">
                              <Info className="size-4 pl-1 text-muted-foreground" />
                            </Button>
                          </div>
                          <strong className="text-xl font-semibold leading-relaxed">
                            5.0<span className="font-normal text-muted-foreground"> Avg. Mention Rank</span>
                          </strong>
                        </div>
                      </div>
                      <div className="mt-4.5 relative" style={{ height: '310px' }}>
                        <div className="relative h-full w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mentionRankData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                              <XAxis 
                                dataKey="date" 
                                className="text-xs fill-gray-500 dark:fill-gray-500"
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis 
                                className="text-xs fill-gray-500 dark:fill-gray-500"
                                axisLine={false}
                                tickLine={false}
                                domain={[0, 6]}
                              />
                              <defs>
                                <linearGradient id="mentionGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="rgb(168 85 247)" stopOpacity="0.3" />
                                  <stop offset="95%" stopColor="rgb(168 85 247)" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              <Area
                                type="monotone"
                                dataKey="Position"
                                stroke="rgb(168 85 247)"
                                strokeWidth={2}
                                fill="url(#mentionGradient)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </div>
          )}

          {/* Prompts Tab */}
          {activeTab === 'prompts' && (
            <div className="py-6">
              <div className="space-y-6">
                <div className="grid gap-4 px-6">
                  <div className="animate-in fade-in space-y-4 duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Input
                            placeholder="Filter by name or description..."
                            className="min-w-60 ps-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <ListFilter className="h-4 w-4" />
                          </div>
                        </div>
                        <DropdownMenu open={showTypeFilter} onOpenChange={setShowTypeFilter}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="cursor-pointer">
                              <Filter className="-ms-1 me-2 opacity-60 h-4 w-4" />
                              Type
                              <Badge variant="secondary" className="ms-3 -me-1">
                                {typeFilters.length}
                              </Badge>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48">
                            {availableTypes.map((type) => (
                              <DropdownMenuItem
                                key={type.value}
                                onClick={() => handleTypeFilterToggle(type.value)}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 border rounded-sm ${typeFilters.includes(type.value) ? 'bg-primary border-primary' : 'border-input'}`} />
                                  {type.label}
                                </div>
                                <Badge variant="secondary" className="text-[0.625rem]">
                                  {type.count}
                                </Badge>
                              </DropdownMenuItem>
                            ))}
                            {typeFilters.length > 0 && (
                              <>
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem
                                  onClick={() => setTypeFilters([])}
                                  className="text-muted-foreground cursor-pointer"
                                >
                                  Clear filters
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-muted-foreground">{filteredPrompts.length} Prompts</div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="cursor-pointer">
                              Create Prompts
                              <ChevronDown className="ml-1.5 size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Create Single Prompt</DropdownMenuItem>
                            <DropdownMenuItem>Bulk Import Prompts</DropdownMenuItem>
                            <DropdownMenuItem>Generate from Keywords</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Reusable Prompts Table */}
                    <PromptsTable 
                      prompts={filteredPrompts}
                      onSort={handleSort}
                      sortConfig={sortConfig}
                    />

                    {/* Pagination */}
                    <div className="flex items-center justify-between gap-8">
                      <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
                        <p className="text-muted-foreground text-sm whitespace-nowrap">
                          <span className="text-foreground">1-{filteredPrompts.length}</span> of <span className="text-foreground">{filteredPrompts.length}</span>
                        </p>
                      </div>
                      <div>
                        <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
                          <ul className="flex flex-row items-center gap-1">
                            <li>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0" disabled>
                                <ChevronFirst className="h-4 w-4" />
                                <span className="sr-only">Go to first page</span>
                              </Button>
                            </li>
                            <li>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0" disabled>
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Go to previous page</span>
                              </Button>
                            </li>
                            <li>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0" disabled>
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Go to next page</span>
                              </Button>
                            </li>
                            <li>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0" disabled>
                                <ChevronLast className="h-4 w-4" />
                                <span className="sr-only">Go to last page</span>
                              </Button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Responses Tab */}
          {activeTab === 'responses' && (
            <div className="py-6">
              <div className="px-6">
                <div className="grid gap-4">
                  <div className="animate-in fade-in space-y-4 duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <DropdownMenu open={sentimentPopoverOpen} onOpenChange={setSentimentPopoverOpen}>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="cursor-pointer"
                            >
                              <Filter className="-ms-1 me-2 opacity-60 h-4 w-4" />
                              Brand Sentiment
                              {responseBrandSentiment.length > 0 && (
                                <Badge variant="secondary" className="ms-3 -me-1">
                                  {responseBrandSentiment.length}
                                </Badge>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <div className="p-2">
                              <h4 className="font-medium text-sm mb-2">Filter by sentiment</h4>
                              <div className="space-y-1">
                                {['positive', 'neutral', 'negative'].map((sentiment) => (
                                  <DropdownMenuItem
                                    key={sentiment}
                                    onClick={() => handleSentimentFilterToggle(sentiment)}
                                    className="flex items-center justify-between cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`w-3 h-3 border rounded-sm ${responseBrandSentiment.includes(sentiment) ? 'bg-primary border-primary' : 'border-input'}`} />
                                      <span className="capitalize">{sentiment}</span>
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </div>
                              {responseBrandSentiment.length > 0 && (
                                <>
                                  <div className="h-px bg-border my-1" />
                                  <DropdownMenuItem
                                    onClick={() => setResponseBrandSentiment([])}
                                    className="text-muted-foreground cursor-pointer"
                                  >
                                    Clear filters
                                  </DropdownMenuItem>
                                </>
                              )}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select value={responseModel} onValueChange={setResponseModel}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4" />
                                All Models
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-models">All Models</SelectItem>
                            {monitor.models.map((model) => (
                              <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select value={responseType} onValueChange={setResponseType}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue>All Types</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-types">All Types</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Reusable Responses Table */}
                    <ResponsesTable 
                      responses={filteredResponses}
                      onSort={handleResponseSort}
                      sortConfig={responseSortConfig}
                    />

                    {/* Pagination */}
                    <div className="flex items-center justify-between gap-8">
                      <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
                        <p className="text-muted-foreground text-sm whitespace-nowrap">
                          <span className="text-foreground">1-{Math.min(25, filteredResponses.length)}</span> of <span className="text-foreground">{filteredResponses.length}</span>
                        </p>
                      </div>
                      <div>
                        <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
                          <ul className="flex flex-row items-center gap-1">
                            <li>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0" disabled>
                                <ChevronFirst className="h-4 w-4" />
                                <span className="sr-only">Go to first page</span>
                              </Button>
                            </li>
                            <li>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0" disabled>
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Go to previous page</span>
                              </Button>
                            </li>
                            <li>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Go to next page</span>
                              </Button>
                            </li>
                            <li>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                                <ChevronLast className="h-4 w-4" />
                                <span className="sr-only">Go to last page</span>
                              </Button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mentions Tab */}
          {activeTab === 'mentions' && (
            <div className="py-6">
              <div className="transition-all duration-300 animate-in fade-in">
                {/* Filters */}
                <div className="flex items-center justify-between gap-2 pb-6 px-6">
                  <Tabs value={mentionsTimeFilter} onValueChange={setMentionsTimeFilter} className="flex flex-col gap-2">
                    <TabsList className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]">
                      <TabsTrigger value="7d" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Last 7 days</TabsTrigger>
                      <TabsTrigger value="14d" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Last 14 days</TabsTrigger>
                      <TabsTrigger value="30d" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Last 30 days</TabsTrigger>
                      <TabsTrigger value="90d" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Last 90 days</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="flex items-center gap-2">
                    <Select value={mentionsCompetitorFilter} onValueChange={setMentionsCompetitorFilter}>
                      <SelectTrigger className="w-[214px]">
                        <SelectValue>All competitors</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-competitors">All competitors</SelectItem>
                        <SelectItem value="wise">Wise</SelectItem>
                        <SelectItem value="volopay">Volopay</SelectItem>
                        <SelectItem value="hrtech">HR Tech</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={mentionsModelFilter} onValueChange={setMentionsModelFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4" />
                            All Models
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-models">All Models</SelectItem>
                        {monitor.models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={mentionsTypeFilter} onValueChange={setMentionsTypeFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>All Types</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-types">All Types</SelectItem>
                        <SelectItem value="organic">Organic</SelectItem>
                        <SelectItem value="competitor">Competitor</SelectItem>
                        <SelectItem value="brand-specific">Brand Specific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="border-y px-6">
                  <div className="grid grid-cols-3 gap-10 pt-6">
                    {/* Top Cited Domains Over Time Chart - 2/3 width */}
                    <div className="col-span-2">
                      <div>
                        <div className="flex items-end gap-2">
                          <div>
                            <h2 className="text-sm text-muted-foreground leading-relaxed">Top Cited Domains Over Time</h2>
                          </div>
                        </div>
                        <div className="mt-4.5 relative" style={{ height: '310px' }}>
                          <div className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={mentionOverTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                                <XAxis 
                                  dataKey="date" 
                                  className="text-xs fill-gray-500 dark:fill-gray-500"
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis 
                                  className="text-xs fill-gray-500 dark:fill-gray-500"
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <Legend 
                                  wrapperStyle={{ paddingTop: '10px' }}
                                  iconType="line"
                                />
                                {mockMentionDomains.slice(0, 7).map((domain, index) => {
                                  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16']
                                  return (
                                    <Line
                                      key={domain.domain}
                                      type="monotone"
                                      dataKey={domain.domain}
                                      stroke={colors[index]}
                                      strokeWidth={2}
                                      dot={false}
                                    />
                                  )
                                })}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Cited Domains Bar Chart - 1/3 width */}
                    <div className="col-span-1">
                      <div>
                        <div className="flex items-end gap-2">
                          <div>
                            <h2 className="text-sm text-muted-foreground leading-relaxed">Top Cited Domains</h2>
                            <strong className="text-xl font-semibold leading-relaxed">52</strong>
                          </div>
                        </div>
                        <div className="mt-4.5 relative" style={{ height: '310px' }}>
                          <div className="flex justify-between space-x-6 relative h-full">
                            <div className="relative w-full space-y-1.5 z-0">
                              {mockMentionDomains.map((domain) => (
                                <div key={domain.domain} className="group w-full rounded-sm outline-offset-2 outline-0 focus-visible:outline-2 outline-blue-500 dark:outline-blue-500">
                                  <div 
                                    className="flex items-center rounded-sm transition-all h-8 bg-blue-200 dark:bg-blue-900"
                                    style={{ width: `${domain.percentage}%` }}
                                  >
                                    <div className="absolute left-2 flex gap-2 max-w-full pr-2">
                                      <div className="flex items-center gap-2 bg-white rounded-sm p-0.5 size-5">
                                        <img 
                                          alt={domain.domain}
                                          loading="lazy" 
                                          width="64" 
                                          height="64" 
                                          decoding="async" 
                                          data-nimg="1"
                                          className="aspect-square object-contain mr-2 rounded-[4px] w-4 h-4"
                                          src={domain.favicon}
                                          style={{ color: 'transparent' }}
                                        />
                                      </div>
                                      <p className="truncate whitespace-nowrap text-sm">{domain.domain}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div>
                              {mockMentionDomains.map((domain) => (
                                <div key={domain.domain} className="flex items-center justify-end h-8 mb-1.5 last:mb-0">
                                  <p className="truncate whitespace-nowrap text-sm leading-none text-muted-foreground">
                                    {domain.count}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mentions Table */}
                <div className="p-6">
                  <div className="animate-in fade-in space-y-4 duration-300">
                    <MentionsTable 
                      mentions={filteredMentions}
                      onSort={handleMentionSort}
                      sortConfig={mentionsSortConfig}
                    />

                    {/* Pagination */}
                    <div className="flex items-center justify-between gap-8">
                      <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
                        <p className="text-muted-foreground text-sm whitespace-nowrap">
                          <span className="text-foreground">1-{Math.min(25, filteredMentions.length)}</span> of <span className="text-foreground">{filteredMentions.length}</span>
                        </p>
                      </div>
                      <div>
                        <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
                          <ul className="flex flex-row items-center gap-1">
                            <li>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0" disabled>
                                <ChevronFirst className="h-4 w-4" />
                                <span className="sr-only">Go to first page</span>
                              </Button>
                            </li>
                            <li>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0" disabled>
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Go to previous page</span>
                              </Button>
                            </li>
                            <li>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Go to next page</span>
                              </Button>
                            </li>
                            <li>
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                                <ChevronLast className="h-4 w-4" />
                                <span className="sr-only">Go to last page</span>
                              </Button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Heatmap Tab */}
          {activeTab === 'heatmap' && (
            <div className="py-6">
              <div className="flex flex-col h-full">
                {/* Filters */}
                <div className="flex items-center justify-between gap-2 pb-6 px-6">
                  <Tabs value={heatmapTimeFilter} onValueChange={setHeatmapTimeFilter} className="flex flex-col gap-2">
                    <TabsList className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]">
                      <TabsTrigger value="7d" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Last 7 days</TabsTrigger>
                      <TabsTrigger value="14d" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Last 14 days</TabsTrigger>
                      <TabsTrigger value="30d" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Last 30 days</TabsTrigger>
                      <TabsTrigger value="90d" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Last 90 days</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="flex items-center gap-2">
                    <Select value={heatmapTypeFilter} onValueChange={setHeatmapTypeFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>All Types</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-types">All Types</SelectItem>
                        <SelectItem value="organic">Organic</SelectItem>
                        <SelectItem value="competitor">Competitor</SelectItem>
                        <SelectItem value="brand-specific">Brand Specific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Heatmap Table */}
                <div className="flex-grow px-6 overflow-y-auto">
                  <Card className="ring-muted/60 border shadow-sm ring-3 overflow-hidden">
                    <div className="relative w-full overflow-x-auto">
                      <table className="w-full caption-bottom text-sm min-w-full border-collapse table-fixed">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-48 border-b border-r p-1 px-3 text-left font-medium dark:border-gray-800">
                              Competitor
                            </TableHead>
                            <TableHead className="p-0 text-center">
                              <div className="m-[1px] flex h-[36px] w-full items-center justify-center gap-2 rounded p-1 text-xs font-medium dark:bg-gray-800">
                                <img 
                                  alt="Mistral Small" 
                                  loading="lazy" 
                                  width="16" 
                                  height="16" 
                                  decoding="async" 
                                  data-nimg="1"
                                  src="/llm-icons/mistral.svg"
                                  style={{ color: 'transparent' }}
                                />
                                Mistral Small
                              </div>
                            </TableHead>
                            <TableHead className="p-0 text-center">
                              <div className="m-[1px] flex h-[36px] w-full items-center justify-center gap-2 rounded p-1 text-xs font-medium dark:bg-gray-800">
                                <img 
                                  alt="ChatGPT Search" 
                                  loading="lazy" 
                                  width="16" 
                                  height="16" 
                                  decoding="async" 
                                  data-nimg="1"
                                  src="/llm-icons/openai.svg"
                                  style={{ color: 'transparent' }}
                                />
                                ChatGPT Search
                              </div>
                            </TableHead>
                            <TableHead className="p-0 text-center">
                              <div className="m-[1px] flex h-[36px] w-full items-center justify-center gap-2 rounded p-1 text-xs font-medium dark:bg-gray-800">
                                <img 
                                  alt="Gemini 2.0 Flash" 
                                  loading="lazy" 
                                  width="16" 
                                  height="16" 
                                  decoding="async" 
                                  data-nimg="1"
                                  src="/llm-icons/gemini.svg"
                                  style={{ color: 'transparent' }}
                                />
                                Gemini 2.0 Flash
                              </div>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {heatmapData.map((row) => (
                            <TableRow key={row.competitor}>
                              <TableCell className="w-48 border-r bg-background p-1 px-3 font-medium dark:border-gray-800">
                                <div className="flex items-center gap-2 whitespace-nowrap truncate">
                                  {row.competitor}
                                </div>
                              </TableCell>
                              <TableCell className="p-0 text-center">
                                <div className={`m-[1px] flex h-[36px] items-center justify-center rounded p-1 text-xs ${getVisibilityColor(row.visibility['mistral-small'])}`}>
                                  {row.visibility['mistral-small'] !== null ? `${row.visibility['mistral-small']}%` : '-'}
                                </div>
                              </TableCell>
                              <TableCell className="p-0 text-center">
                                <div className={`m-[1px] flex h-[36px] items-center justify-center rounded p-1 text-xs ${getVisibilityColor(row.visibility['chatgpt-search'])}`}>
                                  {row.visibility['chatgpt-search'] !== null ? `${row.visibility['chatgpt-search']}%` : '-'}
                                </div>
                              </TableCell>
                              <TableCell className="p-0 text-center">
                                <div className={`m-[1px] flex h-[36px] items-center justify-center rounded p-1 text-xs ${getVisibilityColor(row.visibility['gemini-2-flash'])}`}>
                                  {row.visibility['gemini-2-flash'] !== null ? `${row.visibility['gemini-2-flash']}%` : '-'}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </table>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="py-6">
              <div className="px-6">
                <div className="space-y-6 max-w-3xl mx-auto pt-6">
                  {/* Alert */}
                  <Alert className="bg-blue-50 text-blue-600 border-blue-200 *:data-[slot=alert-description]:text-blue-600">
                    <AlertTitle>About changing monitor settings</AlertTitle>
                    <AlertDescription>
                      Changing settings on a running monitor could affect the analytics of the monitor. We recommend creating a new monitor to allow for accurate analytics.
                    </AlertDescription>
                  </Alert>

                  {/* Monitor Settings Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Monitor Settings</CardTitle>
                      <CardDescription>Manage your monitor settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-6">
                        {/* Monitor Name */}
                        <div className="grid gap-2">
                          <label htmlFor="monitor-name" className="text-sm font-medium">
                            Monitor Name
                          </label>
                          <Input
                            id="monitor-name"
                            placeholder="My Brand Monitor"
                            value={monitorName}
                            onChange={(e) => setMonitorName(e.target.value)}
                          />
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                          <label htmlFor="monitor-description" className="text-sm font-medium">
                            Description
                          </label>
                          <textarea
                            id="monitor-description"
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 min-h-[80px]"
                            placeholder="Describe what you want to monitor..."
                            value={monitorDescription}
                            onChange={(e) => setMonitorDescription(e.target.value)}
                          />
                        </div>

                        {/* Language and Country */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Language */}
                          <div className="grid gap-2">
                            <label htmlFor="monitor-language" className="text-sm font-medium flex items-center gap-2">
                              Language
                              <CircleHelp className="h-3.5 w-3.5 text-muted-foreground/60" />
                            </label>
                            <Select value={monitorLanguage} onValueChange={setMonitorLanguage}>
                              <SelectTrigger>
                                <SelectValue>
                                  <div className="flex items-center gap-2">
                                    <svg width="1em" height="1em" viewBox="0 0 512 336" xmlns="http://www.w3.org/2000/svg">
                                      <g fill="none">
                                        <path d="M503.172 335.724H8.828A8.829 8.829 0 010 326.896V9.103A8.829 8.829 0 018.828.275h494.345a8.829 8.829 0 018.828 8.828v317.793a8.83 8.83 0 01-8.829 8.828z" fill="#F5F5F5"/>
                                        <path d="M512.001 26.08H0V9.103A8.829 8.829 0 018.828.275h494.345a8.829 8.829 0 018.828 8.828V26.08zM0 103.492h512v25.804H0zm0-51.608h512v25.804H0zm512 129.018H8.828A8.829 8.829 0 010 172.074v-16.977h512v25.805zM0 258.317h512v25.804H0zm503.172 77.407H8.828A8.829 8.829 0 010 326.896V309.92h512v16.977a8.828 8.828 0 01-8.828 8.827zM0 206.709h512v25.804H0z" fill="#FF4B55"/>
                                        <path d="M229.517.276H8.828A8.828 8.828 0 000 9.103v162.97a8.829 8.829 0 008.828 8.828h220.69a8.829 8.829 0 008.828-8.828V9.103a8.83 8.83 0 00-8.829-8.827z" fill="#41479B"/>
                                      </g>
                                    </svg>
                                    <div className="flex flex-row items-center gap-2">
                                      <span>English (US)</span>
                                      <span className="text-xs text-muted-foreground">(English)</span>
                                    </div>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en-US">English (US) (English)</SelectItem>
                                <SelectItem value="en-GB">English (UK) (English)</SelectItem>
                                <SelectItem value="es-ES">Spanish (Spain) (Español)</SelectItem>
                                <SelectItem value="fr-FR">French (Français)</SelectItem>
                                <SelectItem value="de-DE">German (Deutsch)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Country */}
                          <div className="grid gap-2">
                            <label htmlFor="monitor-country" className="text-sm font-medium flex items-center gap-2">
                              Country
                              <CircleHelp className="h-3.5 w-3.5 text-muted-foreground/60" />
                            </label>
                            <Select value={monitorCountry} onValueChange={setMonitorCountry}>
                              <SelectTrigger>
                                <SelectValue>
                                  <div className="flex items-center gap-2">
                                    <svg width="1em" height="1em" viewBox="0 0 512 336" xmlns="http://www.w3.org/2000/svg">
                                      <g fill="none">
                                        <path d="M503.172 335.724H8.828A8.829 8.829 0 010 326.896V9.103A8.829 8.829 0 018.828.275h494.345a8.829 8.829 0 018.828 8.828v317.793a8.83 8.83 0 01-8.829 8.828z" fill="#F5F5F5"/>
                                        <path d="M512.001 26.08H0V9.103A8.829 8.829 0 018.828.275h494.345a8.829 8.829 0 018.828 8.828V26.08zM0 103.492h512v25.804H0zm0-51.608h512v25.804H0zm512 129.018H8.828A8.829 8.829 0 010 172.074v-16.977h512v25.805zM0 258.317h512v25.804H0zm503.172 77.407H8.828A8.829 8.829 0 010 326.896V309.92h512v16.977a8.828 8.828 0 01-8.828 8.827zM0 206.709h512v25.804H0z" fill="#FF4B55"/>
                                        <path d="M229.517.276H8.828A8.828 8.828 0 000 9.103v162.97a8.829 8.829 0 008.828 8.828h220.69a8.829 8.829 0 008.828-8.828V9.103a8.83 8.83 0 00-8.829-8.827z" fill="#41479B"/>
                                      </g>
                                    </svg>
                                    <div className="flex flex-row items-center gap-2">
                                      <span>United States</span>
                                      <span className="text-xs text-muted-foreground">(English)</span>
                                    </div>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="US">United States (English)</SelectItem>
                                <SelectItem value="CA">Canada (English)</SelectItem>
                                <SelectItem value="GB">United Kingdom (English)</SelectItem>
                                <SelectItem value="DE">Germany (German)</SelectItem>
                                <SelectItem value="FR">France (French)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <hr />

                        {/* Models Selection */}
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Models</label>
                          <p className="text-sm text-muted-foreground">Select the models you want to monitor.</p>
                          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 mt-4">
                            {[
                              { id: 'chatgpt-search', name: 'ChatGPT Search', description: 'Access web search results with ChatGPT', icon: '/llm-icons/openai.svg' },
                              { id: 'perplexity-search', name: 'Perplexity Search', description: 'Online model with real-time knowledge', icon: '/llm-icons/perplexity.svg' },
                              { id: 'google-ai', name: 'Google AI Overviews', description: 'Google AI Overviews inside Google Search', icon: '/llm-icons/google.svg' },
                              { id: 'gpt-4o', name: 'GPT 4o', description: 'For complex, multi-step tasks', icon: '/llm-icons/openai.svg' },
                              { id: 'gpt-4o-mini', name: 'GPT 4o mini', description: 'Small model for fast, lightweight tasks', icon: '/llm-icons/openai.svg' },
                              { id: 'perplexity', name: 'Perplexity', description: 'Offline model from Perplexity', icon: '/llm-icons/perplexity.svg' },
                              { id: 'deepseek', name: 'DeepSeek', description: 'DeepSeek Chat', icon: '/llm-icons/deepseek.svg' },
                              { id: 'llama-3-3', name: 'Llama 3.3 70B', description: "Facebook's Llama 3.3 70B", icon: '/llm-icons/meta.svg' },
                              { id: 'qwen-32b', name: 'Qwen 32B', description: 'Reinforcement Learning model', icon: '/llm-icons/qwen.svg' },
                              { id: 'gemini-2-flash', name: 'Gemini 2.0 Flash', description: 'Model for complex reasoning from Google', icon: '/llm-icons/gemini.svg' },
                              { id: 'grok-3', name: 'Grok 3', description: 'Model for general tasks', icon: '/llm-icons/grok.svg' },
                              { id: 'mistral-large', name: 'Mistral Large', description: 'Mistral Large', icon: '/llm-icons/mistral.svg' },
                              { id: 'mistral-small', name: 'Mistral Small', description: 'Mistral Small', icon: '/llm-icons/mistral.svg' },
                              { id: 'claude-3-7', name: 'Claude 3.7 Sonnet', description: 'For complex, multi-step tasks', icon: '/llm-icons/claude.svg' },
                            ].map((model) => (
                              <button
                                key={model.id}
                                type="button"
                                onClick={() => {
                                  setSelectedModels(prev =>
                                    prev.includes(model.id)
                                      ? prev.filter(id => id !== model.id)
                                      : [...prev, model.id]
                                  )
                                }}
                                className={`relative cursor-pointer rounded-lg border p-4 transition-colors text-left ${
                                  selectedModels.includes(model.id)
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative h-8 w-8">
                                    <img
                                      alt={model.name}
                                      loading="lazy"
                                      className="object-contain"
                                      src={model.icon}
                                      width={32}
                                      height={32}
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">{model.name}</div>
                                    <div className="text-muted-foreground text-xs">{model.description}</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between border-t pt-4 -mx-5 px-5">
                          <Button variant="outline" type="button">
                            <Copy className="w-4 h-4 mr-2" />
                            Copy to new monitor
                          </Button>
                          <Button type="submit">Save changes</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Delete Monitor Card */}
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle>Delete Monitor</CardTitle>
                      <CardDescription>
                        Deleting this monitor will remove all data associated with it. This action is irreversible.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end border-t border-destructive/20 pt-4 -mx-5 px-5">
                        <Button 
                          variant="outline" 
                          className="hover:bg-destructive/10 hover:border-destructive text-destructive"
                          type="button"
                        >
                          Delete monitor
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content */}
          {activeTab !== 'overview' && activeTab !== 'prompts' && activeTab !== 'responses' && activeTab !== 'mentions' && activeTab !== 'heatmap' && activeTab !== 'settings' && (
            <div className="px-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  The {activeTab} tab is currently under development.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}