import { type Citation, type CitationSortConfig } from '@/types/citation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronUp, ChevronDown, HelpCircle, ChevronFirst, ChevronLeft, ChevronRight, ChevronLast } from 'lucide-react'
import { useState } from 'react'

interface CitationsTableEnhancedProps {
  citations: Citation[]
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortConfig?: CitationSortConfig
  itemsPerPage?: number
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

  return (
    <div 
      className={`flex h-full cursor-pointer items-center justify-between gap-2 select-none ${className}`}
      role="button"
      tabIndex={0}
      onClick={handleSort}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {isActive && (
        direction === 'asc' ? 
          <ChevronUp className="shrink-0 opacity-60" size={16} /> : 
          <ChevronDown className="shrink-0 opacity-60" size={16} />
      )}
    </div>
  )
}

function DomainFavicon({ domain }: { domain: string }) {
  const [imgError, setImgError] = useState(false)
  
  if (imgError) {
    return (
      <div className="flex items-center justify-center bg-muted rounded-md w-6 h-6 p-0.5 ml-2">
        <span className="text-xs text-muted-foreground">
          {domain.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center bg-muted rounded-md w-6 h-6 p-0.5 ml-2">
      <img
        alt={`Favicon for ${domain}`}
        loading="lazy"
        width="17"
        height="17"
        className="rounded"
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        onError={() => setImgError(true)}
      />
    </div>
  )
}

function MetricProgress({ value, max = 100 }: { value: number; max?: number }) {
  const percentage = (value / max) * 100
  
  let colorClass = 'stroke-red-500 dark:stroke-red-500'
  let bgColorClass = 'stroke-red-200 dark:stroke-red-500/30'
  
  if (percentage < 30) {
    colorClass = 'stroke-emerald-500 dark:stroke-emerald-500'
    bgColorClass = 'stroke-emerald-200 dark:stroke-emerald-500/30'
  } else if (percentage < 70) {
    colorClass = 'stroke-yellow-500 dark:stroke-yellow-500'
    bgColorClass = 'stroke-yellow-200 dark:stroke-yellow-500/30'
  }

  return (
    <div className="relative" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax={max}>
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90 transform w-5 h-5">
        <circle
          r="27"
          cx="32"
          cy="32"
          strokeWidth="10"
          fill="transparent"
          stroke=""
          strokeLinecap="round"
          className={`transition-colors ease-linear ${bgColorClass}`}
        />
        <circle
          r="27"
          cx="32"
          cy="32"
          strokeWidth="10"
          strokeDasharray="169.64600329384882 169.64600329384882"
          strokeDashoffset={169.64600329384882 * (1 - percentage / 100)}
          fill="transparent"
          stroke=""
          strokeLinecap="round"
          className={`${colorClass} transform-gpu transition-all duration-300 ease-in-out`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-900">
          {value > 0 ? value : '-'}
        </span>
      </div>
    </div>
  )
}

function ModelBadge({ model }: { model: Citation['model'] }) {
  return (
    <div className="bg-muted flex items-center gap-1.5 rounded-full px-2 py-1 text-xs shrink-0">
      <img src={model.icon} alt="" width="14" height="14" />
      {model.name}
    </div>
  )
}

export function CitationsTableEnhanced({ 
  citations, 
  onSort, 
  sortConfig,
  itemsPerPage = 25 
}: CitationsTableEnhancedProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalPages = Math.ceil(citations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCitations = citations.slice(startIndex, endIndex)

  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1))
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1))

  return (
    <div className="animate-in fade-in space-y-4 duration-300">
      <div className="border-border bg-background overflow-hidden rounded-lg border overflow-x-auto">
        <div className="relative w-full overflow-x-auto">
          <table className="w-full caption-bottom text-sm table-fixed">
            <thead className="[&_tr]:border-b bg-muted/50">
              <tr className="data-[state=selected]:bg-muted border-b transition-colors hover:bg-transparent">
                <th className="text-muted-foreground text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] h-11 px-2 first:px-1" style={{ width: '20px', minWidth: '20px' }}></th>
                <th className="text-muted-foreground text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] h-11 px-2 first:px-1" style={{ width: '60px', minWidth: '60px' }}>
                  <SortableHeader column="domain" sortConfig={sortConfig} onSort={onSort}>
                    Domain
                  </SortableHeader>
                </th>
                <th className="text-muted-foreground text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] h-11 px-2 first:px-1" style={{ width: '45px', minWidth: '45px' }}>
                  <div className="flex items-center gap-1.5">
                    DR
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Domain Rating - A measure of the strength of a domain's backlink profile</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </th>
                <th className="text-muted-foreground text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] h-11 px-2 first:px-1" style={{ width: '180px', minWidth: '150px' }}>
                  <SortableHeader column="url" sortConfig={sortConfig} onSort={onSort}>
                    URL
                  </SortableHeader>
                </th>
                <th className="text-muted-foreground text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] h-11 px-2 first:px-1" style={{ width: '80px', minWidth: '20px' }}>
                  Model
                </th>
                <th className="text-muted-foreground text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] h-11 px-2 first:px-1" style={{ width: '60px', minWidth: '60px' }}>
                  <SortableHeader column="estimatedTraffic" sortConfig={sortConfig} onSort={onSort}>
                    <div className="flex items-center gap-1.5">
                      Est. Traffic
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Estimated monthly organic traffic</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </SortableHeader>
                </th>
                <th className="text-muted-foreground text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] h-11 px-2 first:px-1" style={{ width: '45px', minWidth: '45px' }}>
                  <SortableHeader column="pageRank" sortConfig={sortConfig} onSort={onSort}>
                    <div className="flex items-center gap-1.5">
                      PR
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Page Rank - A measure of the importance of a specific page</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </SortableHeader>
                </th>
                <th className="text-muted-foreground text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] h-11 px-2 first:px-1" style={{ width: '50px', minWidth: '20px' }}>
                  <SortableHeader column="position" sortConfig={sortConfig} onSort={onSort}>
                    <div className="flex items-center gap-1.5">
                      Pos.
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Position in search results</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </SortableHeader>
                </th>
                <th className="text-muted-foreground text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] h-11 px-2 first:px-1" style={{ width: '80px', minWidth: '20px' }}>
                  <SortableHeader column="firstSeen" sortConfig={sortConfig} onSort={onSort}>
                    First seen
                  </SortableHeader>
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {paginatedCitations.map((citation) => (
                <tr 
                  key={citation.id} 
                  className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors cursor-pointer"
                >
                  <td className="p-2 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] min-w-0 py-2 align-top px-2 first:px-1">
                    <DomainFavicon domain={citation.domain} />
                  </td>
                  <td className="p-2 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] min-w-0 py-2 align-top px-2 first:px-1">
                    <div className="truncate">{citation.domain}</div>
                  </td>
                  <td className="p-2 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] min-w-0 py-2 align-top px-2 first:px-1">
                    <MetricProgress value={citation.domainRating} />
                  </td>
                  <td className="p-2 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] min-w-0 py-2 align-top px-2 first:px-1">
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate block"
                      title={citation.url}
                    >
                      {citation.title}
                    </a>
                  </td>
                  <td className="p-2 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] min-w-0 py-2 align-top px-2 first:px-1">
                    <div className="flex items-center gap-2">
                      <ModelBadge model={citation.model} />
                    </div>
                  </td>
                  <td className="p-2 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] min-w-0 py-2 align-top px-2 first:px-1">
                    <div>{citation.estimatedTraffic ? citation.estimatedTraffic.toLocaleString() : '-'}</div>
                  </td>
                  <td className="p-2 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] min-w-0 py-2 align-top px-2 first:px-1">
                    <MetricProgress value={citation.pageRank || 0} />
                  </td>
                  <td className="p-2 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] min-w-0 py-2 align-top px-2 first:px-1">
                    {citation.position}
                  </td>
                  <td className="p-2 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] min-w-0 py-2 align-top px-2 first:px-1">
                    {new Date(citation.firstSeen).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-8 pt-2">
        <div className="text-muted-foreground flex-1 text-sm">
          Showing <span className="text-foreground font-medium">{startIndex + 1} - {Math.min(endIndex, citations.length)}</span> of{' '}
          <span className="text-foreground font-medium">{citations.length}</span> citations
        </div>
        <div className="flex items-center space-x-2">
          <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
            <ul className="flex flex-row items-center gap-1">
              <li>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  aria-label="Go to first page"
                >
                  <ChevronFirst className="h-4 w-4" />
                </Button>
              </li>
              <li>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </li>
              <li>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  aria-label="Go to next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </li>
              <li>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  aria-label="Go to last page"
                >
                  <ChevronLast className="h-4 w-4" />
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}