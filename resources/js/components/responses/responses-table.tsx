import { type Response, type ResponseSortConfig } from '@/types/response'
import { Badge } from '@/components/ui/badge'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronUp, ChevronDown, HelpCircle, ExternalLink } from 'lucide-react'
import { router } from '@inertiajs/react'

interface ResponsesTableProps {
  responses: Response[]
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortConfig?: ResponseSortConfig
}

interface SortableHeaderProps {
  column: string
  children: React.ReactNode
  sortConfig?: ResponseSortConfig
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  className?: string
  tooltip?: string
}

function SortableHeader({ column, children, sortConfig, onSort, tooltip }: SortableHeaderProps) {
  const isActive = sortConfig?.column === column
  const direction = isActive ? sortConfig.direction : 'desc'

  const handleSort = () => {
    if (!onSort) return
    const newDirection = isActive && direction === 'desc' ? 'asc' : 'desc'
    onSort(column, newDirection)
  }

  const header = (
    <div className="flex h-full cursor-pointer items-center justify-between gap-2 select-none" tabIndex={0} onClick={handleSort}>
      <div className="flex items-center gap-1.5">
        {children}
        {tooltip && (
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
        )}
      </div>
      {isActive && (
        direction === 'asc' ?
          <ChevronUp className="shrink-0 opacity-60 h-4 w-4" /> :
          <ChevronDown className="shrink-0 opacity-60 h-4 w-4" />
      )}
    </div>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {header}
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

function ProgressCircle({ value }: { value: number }) {
  const radius = 27
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative" role="progressbar" aria-label="Progress circle" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} data-max="100" data-value={value}>
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90 transform w-5 h-5">
        <circle
          r={radius}
          cx="32"
          cy="32"
          strokeWidth="10"
          fill="transparent"
          stroke=""
          strokeLinecap="round"
          className="transition-colors ease-linear stroke-blue-200 dark:stroke-blue-500/30"
        />
        <circle
          r={radius}
          cx="32"
          cy="32"
          strokeWidth="10"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
          stroke=""
          strokeLinecap="round"
          className="stroke-blue-500 dark:stroke-blue-500 transform-gpu transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-900 -ml-2">{value}%</span>
      </div>
    </div>
  )
}

export function ResponsesTable({ responses, onSort, sortConfig }: ResponsesTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleResponseClick = (response: Response) => {
    if (response.promptId) {
      router.visit(`/prompts/${response.promptId}`)
    }
  }

  return (
    <div className="border-border bg-background overflow-hidden rounded-lg border">
      <div className="relative w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm table-fixed">
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11" style={{width: '330px'}}>
                Response
              </TableHead>
              <TableHead className="h-11" style={{width: '70px'}}>
                <SortableHeader column="model" sortConfig={sortConfig} onSort={onSort}>
                  Model
                </SortableHeader>
              </TableHead>
              <TableHead className="h-11" style={{width: '55px'}}>
                <SortableHeader column="visibility" sortConfig={sortConfig} onSort={onSort} tooltip="Percentage of visibility across platforms">
                  Visibility
                </SortableHeader>
              </TableHead>
              <TableHead className="h-11" style={{width: '60px'}}>
                <SortableHeader column="mentioned" sortConfig={sortConfig} onSort={onSort} tooltip="Whether brands were mentioned in the response">
                  Mentioned
                </SortableHeader>
              </TableHead>
              <TableHead className="h-11" style={{width: '60px'}}>
                <SortableHeader column="competitors" sortConfig={sortConfig} onSort={onSort} tooltip="Whether competitors were mentioned">
                  Competitors
                </SortableHeader>
              </TableHead>
              <TableHead className="h-11" style={{width: '60px'}}>
                <SortableHeader column="answered" sortConfig={sortConfig} onSort={onSort}>
                  Answered
                </SortableHeader>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response) => (
              <TableRow
                key={response.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => handleResponseClick(response)}
                data-state="false"
              >
                <TableCell className="last:py-0">
                  <div className="ml-1 flex items-center justify-between group">
                    <div className="line-clamp-1 flex-1">
                      <p className="text-sm">
                        {truncateText(response.text, 200)}
                      </p>
                    </div>
                    {response.promptId && (
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="last:py-0">
                  <div className="line-clamp-1 flex items-center gap-2 truncate">
                    <div className="bg-muted flex items-center gap-1.5 rounded-full px-2 py-1 text-xs shrink-0">
                      <img
                        alt=""
                        loading="lazy"
                        width="14"
                        height="14"
                        decoding="async"
                        data-nimg="1"
                        src={response.model.icon}
                        style={{ color: 'transparent' }}
                      />
                      {response.model.displayName}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="last:py-0">
                  <ProgressCircle value={response.visibility} />
                </TableCell>
                <TableCell className="last:py-0">
                  <Badge variant={response.brandMentions.some(b => b.mentioned) ? "default" : "secondary"}>
                    {response.brandMentions.some(b => b.mentioned) ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell className="last:py-0">
                  <Badge variant={response.competitorMentions.some(c => c.mentioned) ? "default" : "secondary"}>
                    {response.competitorMentions.some(c => c.mentioned) ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell className="last:py-0">
                  {formatDate(response.answered)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
    </div>
  )
}