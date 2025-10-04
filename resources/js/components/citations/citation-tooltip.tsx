import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { ExternalLink, Info } from 'lucide-react'
import { CitationSource } from '@/types/response'

interface CitationTooltipProps {
  citationNumber: number
  source: CitationSource
}

export function CitationTooltip({ citationNumber, source }: CitationTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer transition-colors"
            >
              [{citationNumber}]
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm" side="top">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Source {citationNumber}</span>
            </div>
            <div className="text-sm">
              <p className="font-medium mb-1">{source.title}</p>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
              >
                <ExternalLink className="h-3 w-3" />
                Visit Source
              </a>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}