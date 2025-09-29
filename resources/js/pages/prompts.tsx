import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, usePage } from '@inertiajs/react'
import { PromptsTable } from '@/components/prompts/prompts-table'
import RedisStatusIndicator from '@/components/prompts/redis-status-indicator'
import { useState } from 'react'
import { type Prompt, type PromptSortConfig, type PromptType } from '@/types/prompt'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ListFilter, Filter, ChevronFirst, ChevronLeft, ChevronRight, ChevronLast } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Prompts',
    href: '/prompts',
  },
]

interface Monitor {
  id: number
  name: string
  setup_status: string
  prompts_generated: number
  prompts_generated_at: string | null
}

interface PromptsPageProps {
  prompts: Prompt[]
  monitors: Monitor[]
}

export default function Prompts({ prompts = [], monitors = [] }: PromptsPageProps) {
  const [sortConfig, setSortConfig] = useState<PromptSortConfig>({
    column: null,
    direction: 'desc'
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<PromptType[]>([])

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortConfig({ column, direction })
  }

  const handleTypeToggle = (type: PromptType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }


  const sortedPrompts = [...prompts].sort((a, b) => {
    if (!sortConfig.column) return 0

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

  const filteredPrompts = sortedPrompts.filter(prompt => {
    const matchesSearch = prompt.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(prompt.type)
    return matchesSearch && matchesType
  })

  // Calculate statistics for the cards
  const typeStats = prompts.reduce((acc, prompt) => {
    acc[prompt.type] = (acc[prompt.type] || 0) + 1
    return acc
  }, {} as Record<PromptType, number>)

  const intentStats = prompts.reduce((acc, prompt) => {
    acc[prompt.intent] = (acc[prompt.intent] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Prompts" />
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <div className="relative z-10 py-6">
          <div className="px-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-semibold">All Prompts</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage prompts for your LLMs
              </p>
            </div>

            {/* Redis Status Indicator */}
            {monitors.some(m => m.setup_status === 'pending' || m.prompts_generated === 0) && (
              <div className="mt-6">
                <RedisStatusIndicator monitors={monitors} />
              </div>
            )}

            {/* Summary Cards */}
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card className="shrink-0 ring-muted/60 ring-3">
                  <CardContent className="px-5 pb-4">
                    <div className="mt-4 flex items-start justify-between gap-8">
                      <div>
                        <h4 className="text-sm font-semibold">Types</h4>
                      </div>
                      <div className="flex-shrink-0">
                        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <li className="flex items-center space-x-2">
                            <span className="size-2.5 shrink-0 rounded-sm bg-green-500" aria-hidden="true"></span>
                            <span className="text-muted-foreground text-sm">
                              <span className="font-medium text-foreground">{typeStats.organic || 0}</span> organic
                            </span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="size-2.5 shrink-0 rounded-sm bg-orange-500" aria-hidden="true"></span>
                            <span className="text-muted-foreground text-sm">
                              <span className="font-medium text-foreground">{typeStats.competitor || 0}</span> competitor comparison
                            </span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="size-2.5 shrink-0 rounded-sm bg-purple-500" aria-hidden="true"></span>
                            <span className="text-muted-foreground text-sm">
                              <span className="font-medium text-foreground">{typeStats['brand-specific'] || 0}</span> brand specific
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4" role="img" aria-label="Category bar">
                      <div className="relative flex h-2 w-full items-center">
                        <div className="flex h-full flex-1 items-center gap-1 overflow-hidden rounded-full">
                          <div 
                            className="h-full rounded-full bg-green-500" 
                            style={{ width: `${prompts.length > 0 ? ((typeStats.organic || 0) / prompts.length) * 100 : 0}%` }}
                          />
                          <div 
                            className="h-full rounded-full bg-orange-500" 
                            style={{ width: `${prompts.length > 0 ? ((typeStats.competitor || 0) / prompts.length) * 100 : 0}%` }}
                          />
                          <div 
                            className="h-full rounded-full bg-purple-500" 
                            style={{ width: `${prompts.length > 0 ? ((typeStats['brand-specific'] || 0) / prompts.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shrink-0 ring-muted/60 ring-3">
                  <CardContent className="px-5 pb-4">
                    <div className="mt-4 flex items-start justify-between gap-8">
                      <div>
                        <h4 className="text-sm font-semibold">Intents</h4>
                      </div>
                      <div className="flex-shrink-0">
                        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <li className="flex items-center space-x-2">
                            <span className="size-2.5 shrink-0 rounded-sm bg-cyan-500" aria-hidden="true"></span>
                            <span className="text-muted-foreground text-sm">
                              <span className="font-medium text-foreground">{intentStats.informational || 0}</span> informational
                            </span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="size-2.5 shrink-0 rounded-sm bg-pink-500" aria-hidden="true"></span>
                            <span className="text-muted-foreground text-sm">
                              <span className="font-medium text-foreground">{intentStats.commercial || 0}</span> commercial
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4" role="img" aria-label="Category bar">
                      <div className="relative flex h-2 w-full items-center">
                        <div className="flex h-full flex-1 items-center gap-1 overflow-hidden rounded-full">
                          <div 
                            className="h-full rounded-full bg-cyan-500" 
                            style={{ width: `${prompts.length > 0 ? ((intentStats.informational || 0) / prompts.length) * 100 : 0}%` }}
                          />
                          <div 
                            className="h-full rounded-full bg-pink-500" 
                            style={{ width: `${prompts.length > 0 ? ((intentStats.commercial || 0) / prompts.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Search */}
              <div className="animate-in fade-in space-y-4 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Input
                        className="min-w-60 ps-9"
                        placeholder="Filter by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
                        <ListFilter className="h-4 w-4" />
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 py-2 cursor-pointer"
                        >
                          <Filter className="-ms-1 me-2 h-4 w-4 opacity-60" />
                          Type
                          {selectedTypes.length > 0 && (
                            <Badge variant="secondary" className="ms-3 -me-1 h-5 px-1 text-[0.625rem]">
                              {selectedTypes.length}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[200px]">
                        <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={selectedTypes.includes('organic')}
                          onCheckedChange={() => handleTypeToggle('organic')}
                        >
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-green-500" />
                            Organic
                          </span>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={selectedTypes.includes('competitor')}
                          onCheckedChange={() => handleTypeToggle('competitor')}
                        >
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-orange-500" />
                            Competitor
                          </span>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={selectedTypes.includes('brand-specific')}
                          onCheckedChange={() => handleTypeToggle('brand-specific')}
                        >
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-purple-500" />
                            Brand Specific
                          </span>
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      {filteredPrompts.length} Prompts
                    </div>
                  </div>
                </div>

                {/* Prompts Table */}
                <PromptsTable 
                  prompts={filteredPrompts}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                />

                {/* Pagination */}
                <div className="flex items-center justify-between gap-8">
                  <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
                    <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
                      <span className="text-foreground">1-{filteredPrompts.length}</span> of{' '}
                      <span className="text-foreground">{filteredPrompts.length}</span>
                    </p>
                  </div>
                  <div>
                    <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
                      <ul className="flex flex-row items-center gap-1">
                        <li>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full border-gray-300/80"
                            disabled
                            aria-label="Go to first page"
                          >
                            <ChevronFirst className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full border-gray-300/80"
                            disabled
                            aria-label="Go to previous page"
                          >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full border-gray-300/80"
                            disabled
                            aria-label="Go to next page"
                          >
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full border-gray-300/80"
                            disabled
                            aria-label="Go to last page"
                          >
                            <ChevronLast className="h-4 w-4" aria-hidden="true" />
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
      </div>

    </AppLayout>
  )
}