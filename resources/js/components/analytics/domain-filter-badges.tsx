import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { DomainFilter, AIDomain } from '@/types/analytics'

interface DomainFilterBadgesProps {
  domains: DomainFilter[]
  activeDomains: AIDomain[]
  onDomainToggle: (domainId: AIDomain) => void
  onClearAll: () => void
}

export function DomainFilterBadges({ 
  domains, 
  activeDomains, 
  onDomainToggle,
  onClearAll 
}: DomainFilterBadgesProps) {
  const activeDomainFilters = domains.filter(domain => activeDomains.includes(domain.id))
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {activeDomainFilters.map((domain) => (
        <Badge
          key={domain.id}
          variant="secondary"
          className="h-7 px-3 cursor-pointer hover:bg-muted transition-colors"
          style={{
            backgroundColor: `${domain.color}20`,
            borderColor: `${domain.color}40`,
            color: domain.color,
          }}
          onClick={() => onDomainToggle(domain.id)}
        >
          <div 
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: domain.color }}
          />
          {domain.name}
          <X className="w-3 h-3 ml-2 hover:text-destructive" />
        </Badge>
      ))}
      
      {activeDomains.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
      
      {activeDomains.length === 0 && (
        <span className="text-sm text-muted-foreground">
          No domains selected
        </span>
      )}
    </div>
  )
}