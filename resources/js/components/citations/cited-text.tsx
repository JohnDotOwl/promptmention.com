import React from 'react'
import { CitationTooltip } from './citation-tooltip'
import { CitationSource } from '@/types/response'

interface CitedTextProps {
  text: string
  citations?: {
    sources: CitationSource[]
    mapping: Record<string, number>
  }
}

export function CitedText({ text, citations }: CitedTextProps) {
  if (!citations || !citations.sources.length) {
    return <span>{text}</span>
  }

  // Split text by citation markers and replace with tooltip components
  const parts = text.split(/(\[\d+(?:,\s*\d+)*\])/g)

  return (
    <span>
      {parts.map((part, index) => {
        // Check if this part is a citation marker
        const citationMatch = part.match(/^\[(\d+(?:,\s*\d+)*)\]$/)

        if (citationMatch && citations) {
          // Handle multiple citations like [1,2,3]
          const citationNumbers = citationMatch[1].split(',').map(n => parseInt(n.trim()))

          return (
            <span key={index} className="inline-flex gap-1">
              {citationNumbers.map((num) => {
                const sourceIndex = citations.mapping[num.toString()]
                const source = citations.sources[sourceIndex]

                if (!source) {
                  return <span key={num} className="text-gray-400">[{num}]</span>
                }

                return (
                  <CitationTooltip
                    key={num}
                    citationNumber={num}
                    source={source}
                  >
                    <span>[{num}]</span>
                  </CitationTooltip>
                )
              })}
            </span>
          )
        }

        return <span key={index}>{part}</span>
      })}
    </span>
  )
}