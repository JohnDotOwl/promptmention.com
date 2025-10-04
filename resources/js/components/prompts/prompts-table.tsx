import { type Prompt, type PromptSortConfig } from '@/types/prompt'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronUp, ChevronDown, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from '@inertiajs/react'

interface PromptsTableProps {
  prompts: Prompt[]
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortConfig?: PromptSortConfig
}

/**
 * Safely format a date for display in the table
 */
function safeFormatDateForTable(dateValue: string | undefined | null): string {
  if (!dateValue) {
    return 'N/A'
  }

  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) {
      return 'N/A'
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch (error) {
    return 'N/A'
  }
}

interface SortableHeaderProps {
  column: string
  children: React.ReactNode
  sortConfig?: PromptSortConfig
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
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (value / 100) * circumference

  let colorClass = 'stroke-blue-500 dark:stroke-blue-500'
  let bgColorClass = 'stroke-blue-200 dark:stroke-blue-500/30'

  if (value >= 70) {
    colorClass = 'stroke-yellow-500 dark:stroke-yellow-500'
    bgColorClass = 'stroke-yellow-200 dark:stroke-yellow-500/30'
  }

  if (value >= 90) {
    colorClass = 'stroke-red-500 dark:stroke-red-500'
    bgColorClass = 'stroke-red-200 dark:stroke-red-500/30'
  }

  return (
    <div className="relative" role="progressbar" aria-label="Progress circle" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} data-max="100" data-value={value} tremor-id="tremor-raw">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90 transform w-5 h-5">
        <circle
          r={radius}
          cx="32"
          cy="32"
          strokeWidth="10"
          fill="transparent"
          stroke=""
          strokeLinecap="round"
          className={`transition-colors ease-linear ${bgColorClass}`}
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
          className={`${colorClass} transform-gpu transition-all duration-300 ease-in-out`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-900 -ml-2">{value}%</span>
      </div>
    </div>
  )
}

function ModelBadge({ modelName, displayName }: { modelName: string, displayName: string }) {
  const getModelInfo = (model: string) => {
    switch (model) {
      case 'gemini-2.5-flash':
        return { name: 'Gemini', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700' }
      case 'gpt-oss-120b':
        return { name: 'GPT-OSS', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700' }
      case 'llama-4-scout-17b-16e-instruct':
        return { name: 'Llama-4', color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-700' }
      default:
        return { name: displayName, color: 'gray', bgColor: 'bg-gray-50', textColor: 'text-gray-700' }
    }
  }

  const modelInfo = getModelInfo(modelName)

  return (
    <Badge
      variant="secondary"
      className={`${modelInfo.bgColor} ${modelInfo.textColor} border-0`}
    >
      {modelInfo.name}
    </Badge>
  )
}

export function PromptsTable({ prompts, onSort, sortConfig }: PromptsTableProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])

  const handleSelectAll = () => {
    if (selectedPrompts.length === prompts.length) {
      setSelectedPrompts([])
    } else {
      setSelectedPrompts(prompts.map(p => p.id))
    }
  }

  const handleSelectPrompt = (promptId: string) => {
    setSelectedPrompts(prev => {
      if (prev.includes(promptId)) {
        return prev.filter(id => id !== promptId)
      } else {
        return [...prev, promptId]
      }
    })
  }


  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'brand-specific':
        return <Badge variant="secondary" className="bg-purple-50 hover:bg-purple-50">Brand Specific</Badge>
      case 'organic':
        return <Badge variant="secondary" className="bg-green-50 hover:bg-green-50">Organic</Badge>
      case 'competitor':
        return <Badge variant="secondary" className="bg-orange-50 hover:bg-orange-50">Competitor</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getIntentBadge = (intent: string) => {
    switch (intent) {
      case 'informational':
        return <Badge variant="secondary">Informational</Badge>
      case 'commercial':
        return <Badge variant="secondary">Commercial</Badge>
      default:
        return <Badge variant="secondary">{intent}</Badge>
    }
  }

  return (
    <div className="border-border bg-background overflow-hidden rounded-lg border">
      <div className="relative w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm table-fixed">
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr className="border-b transition-colors hover:bg-transparent">
              <th className="text-muted-foreground px-2 text-left align-middle font-medium whitespace-nowrap h-11" style={{width: '28px'}}>
                <Checkbox
                  checked={selectedPrompts.length === prompts.length && prompts.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                  data-state={selectedPrompts.length > 0 && selectedPrompts.length < prompts.length ? 'indeterminate' : undefined}
                />
              </th>
              <th className="text-muted-foreground px-2 text-left align-middle font-medium whitespace-nowrap h-11" style={{width: '320px'}}>
                Prompt
              </th>
              <th className="text-muted-foreground px-2 text-left align-middle font-medium whitespace-nowrap h-11" style={{width: '80px'}}>
                <SortableHeader column="type" sortConfig={sortConfig} onSort={onSort} tooltip="Prompt classification based on origin and intent">
                  Type
                </SortableHeader>
              </th>
              <th className="text-muted-foreground px-2 text-left align-middle font-medium whitespace-nowrap h-11" style={{width: '80px'}}>
                <SortableHeader column="intent" sortConfig={sortConfig} onSort={onSort} tooltip="The primary intent behind the prompt">
                  Intent
                </SortableHeader>
              </th>
              <th className="text-muted-foreground px-2 text-left align-middle font-medium whitespace-nowrap h-11" style={{width: '120px'}}>
                Model
              </th>
              <th className="text-muted-foreground px-2 text-left align-middle font-medium whitespace-nowrap h-11" style={{width: '65px'}}>
                <div className="flex items-center gap-1.5">
                  Visibility
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
                </div>
              </th>
              <th className="text-muted-foreground px-2 text-left align-middle font-medium whitespace-nowrap h-11" style={{width: '70px'}}>
                Language
              </th>
              <th className="text-muted-foreground px-2 text-left align-middle font-medium whitespace-nowrap h-11" style={{width: '100px'}}>
                Monitor
              </th>
              <th className="text-muted-foreground px-2 text-left align-middle font-medium whitespace-nowrap h-11" style={{width: '55px'}}>
                <SortableHeader column="created" sortConfig={sortConfig} onSort={onSort}>
                  Created
                </SortableHeader>
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {prompts.map((prompt) => (
              <tr 
                key={prompt.id} 
                className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors" 
                data-state={selectedPrompts.includes(prompt.id) ? 'selected' : 'false'}
              >
                <td className="p-2 align-middle whitespace-nowrap">
                  <Checkbox
                    checked={selectedPrompts.includes(prompt.id)}
                    onCheckedChange={() => handleSelectPrompt(prompt.id)}
                    aria-label="Select row"
                    data-no-click
                  />
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  <Link 
                    href={`/prompts/${prompt.id || '#'}`}
                    className="block truncate hover:text-primary hover:underline"
                    title={prompt.text || 'Untitled Prompt'}
                  >
                    {prompt.text || 'Untitled Prompt'}
                  </Link>
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  {getTypeBadge(prompt.type || 'brand-specific')}
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  {getIntentBadge(prompt.intent || 'informational')}
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  <ModelBadge
                    modelName={prompt.model_name || 'Unknown Model'}
                    displayName={prompt.model_display_name || 'Unknown Model'}
                  />
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  <ProgressCircle value={prompt.visibility || 0} />
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span 
                      title={prompt.language?.code || 'en'}
                      className="inline-block w-4 h-4 text-center"
                    >
                      {prompt.language?.flag || '🇺🇸'}
                    </span>
                    <span className="text-xs capitalize">{prompt.language?.name || 'English'}</span>
                  </div>
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  <Link 
                    href={`/monitors/${prompt.monitor?.id || '#'}`}
                    className="truncate hover:text-primary hover:underline" 
                    title={prompt.monitor?.name || 'Unknown Monitor'}
                  >
                    {prompt.monitor?.name || 'Unknown Monitor'}
                  </Link>
                </td>
                <td className="p-2 align-middle whitespace-nowrap">
                  {safeFormatDateForTable(prompt.created)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}