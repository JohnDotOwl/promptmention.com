import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, ExternalLink, BookOpen } from 'lucide-react'
import { CitationSource } from '@/types/response'

interface SourcesListProps {
  sources: CitationSource[]
  count?: number
}

export function SourcesList({ sources, count }: SourcesListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!sources || sources.length === 0) {
    return null
  }

  const displaySources = isExpanded ? sources : sources.slice(0, 3)

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-medium">
              Sources ({count || sources.length})
            </CardTitle>
          </div>
          {sources.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2 text-xs"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show {sources.length - 3} More
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {displaySources.map((source, index) => (
            <div key={index} className="flex items-start gap-3 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <Badge variant="secondary" className="text-xs mt-0.5">
                {index + 1}
              </Badge>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 leading-tight mb-1">
                  {source.title}
                </h4>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Visit Source
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}