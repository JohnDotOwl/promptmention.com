import { type Citation, type CitationSortConfig } from '@/types/citation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronUp, ChevronDown, ExternalLink, HelpCircle } from 'lucide-react'
import { useState } from 'react'

interface CitationsTableProps {
  citations: Citation[]
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortConfig?: CitationSortConfig
}

interface SortableHeaderProps {
  column: string
  children: React.ReactNode
  sortConfig?: CitationSortConfig
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  className?: string
  tooltip?: string
}

function SortableHeader({ column, children, sortConfig, onSort, className = '', tooltip }: SortableHeaderProps) {
  const isActive = sortConfig?.column === column
  const direction = isActive ? sortConfig.direction : 'desc'
  
  const handleSort = () => {
    if (!onSort) return
    const newDirection = isActive && direction === 'desc' ? 'asc' : 'desc'
    onSort(column, newDirection)
  }

  const header = (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSort}
      className={`h-8 px-2 font-medium text-muted-foreground hover:text-foreground justify-start ${className}`}
    >
      {children}
      {isActive && (
        direction === 'asc' ? 
          <ChevronUp className="ml-1 h-3 w-3" /> : 
          <ChevronDown className="ml-1 h-3 w-3" />
      )}
    </Button>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              {header}
              <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return header
}

function DomainFavicon({ domain }: { domain: string }) {
  const [imgError, setImgError] = useState(false)
  
  if (imgError) {
    return (
      <div className="w-5 h-5 bg-muted rounded-sm flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          {domain.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt={`${domain} favicon`}
      className="w-5 h-5"
      onError={() => setImgError(true)}
    />
  )
}

function MetricProgress({ value, max = 100 }: { value: number; max?: number }) {
  const percentage = (value / max) * 100
  
  let colorClass = 'text-red-600'
  if (percentage >= 70) colorClass = 'text-red-600'
  else if (percentage >= 40) colorClass = 'text-blue-600'
  else colorClass = 'text-gray-400'

  return (
    <div className="flex items-center space-x-2">
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-muted-foreground/20"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${percentage * 0.628} 62.8`}
            className={colorClass}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-medium ${colorClass}`}>
            {value}
          </span>
        </div>
      </div>
    </div>
  )
}

function ModelBadge({ model }: { model: Citation['model'] }) {
  return (
    <Badge variant="secondary" className={`${model.color} text-xs px-2 py-1 flex items-center space-x-1`}>
      <img src={model.icon} alt={model.name} className="w-3 h-3" />
      <span>{model.name}</span>
    </Badge>
  )
}

function CitationTitle({ citation }: { citation: Citation }) {
  const maxLength = 80
  const truncated = citation.title.length > maxLength ? `${citation.title.substring(0, maxLength)}...` : citation.title
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1 cursor-pointer"
          >
            <span className="font-medium">{truncated}</span>
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium">{citation.title}</p>
            <p className="text-xs text-muted-foreground">{citation.url}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function CitationsTable({ citations, onSort, sortConfig }: CitationsTableProps) {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-[24px] px-3 py-3 text-left"></th>
              <th className="w-[60px] px-3 py-3 text-left">
                <SortableHeader column="domain" sortConfig={sortConfig} onSort={onSort}>
                  Domain
                </SortableHeader>
              </th>
              <th className="w-[45px] px-3 py-3 text-left">
                <SortableHeader 
                  column="domainRating" 
                  sortConfig={sortConfig} 
                  onSort={onSort}
                  tooltip="Domain Rating - A measure of the strength of a domain's backlink profile"
                >
                  DR
                </SortableHeader>
              </th>
              <th className="w-[200px] px-3 py-3 text-left">
                <SortableHeader column="url" sortConfig={sortConfig} onSort={onSort}>
                  Title
                </SortableHeader>
              </th>
              <th className="w-[80px] px-3 py-3 text-left">
                <span className="text-sm font-medium text-muted-foreground">Model</span>
              </th>
              <th className="w-[60px] px-3 py-3 text-left">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-muted-foreground">Est. Traffic</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Estimated monthly organic traffic</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </th>
              <th className="w-[45px] px-3 py-3 text-left">
                <SortableHeader 
                  column="pageRank" 
                  sortConfig={sortConfig} 
                  onSort={onSort}
                  tooltip="Page Rank - A measure of the importance of a specific page"
                >
                  PR
                </SortableHeader>
              </th>
              <th className="w-[50px] px-3 py-3 text-left">
                <div className="flex items-center">
                  <SortableHeader column="position" sortConfig={sortConfig} onSort={onSort}>
                    Pos.
                  </SortableHeader>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Position in search results</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </th>
              <th className="w-[80px] px-3 py-3 text-left">
                <SortableHeader column="firstSeen" sortConfig={sortConfig} onSort={onSort}>
                  First seen
                </SortableHeader>
              </th>
            </tr>
          </thead>
          <tbody>
            {citations.map((citation) => (
              <tr key={citation.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="px-3 py-3">
                  <DomainFavicon domain={citation.domain} />
                </td>
                <td className="px-3 py-3 text-sm font-medium">
                  {citation.domain}
                </td>
                <td className="px-3 py-3">
                  <MetricProgress value={citation.domainRating} />
                </td>
                <td className="px-3 py-3">
                  <CitationTitle citation={citation} />
                </td>
                <td className="px-3 py-3">
                  <ModelBadge model={citation.model} />
                </td>
                <td className="px-3 py-3 text-sm text-muted-foreground">
                  {citation.estimatedTraffic ? citation.estimatedTraffic.toLocaleString() : '—'}
                </td>
                <td className="px-3 py-3">
                  <MetricProgress value={citation.pageRank} />
                </td>
                <td className="px-3 py-3 text-sm font-medium">
                  {citation.position}
                </td>
                <td className="px-3 py-3 text-sm text-muted-foreground">
                  {citation.firstSeen}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}