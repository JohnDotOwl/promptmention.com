import { Button } from '@/components/ui/button'
import type { TimePeriod } from '@/types/analytics'

interface TimePeriodFilterProps {
  activePeriod: TimePeriod
  onPeriodChange: (period: TimePeriod) => void
}

const timePeriods: { value: TimePeriod; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '14d', label: '14d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
]

export function TimePeriodFilter({ activePeriod, onPeriodChange }: TimePeriodFilterProps) {
  return (
    <div className="flex items-center gap-1">
      {timePeriods.map((period) => (
        <Button
          key={period.value}
          variant={activePeriod === period.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodChange(period.value)}
          className="h-8 px-3"
        >
          {period.label}
        </Button>
      ))}
    </div>
  )
}