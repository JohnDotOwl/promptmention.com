import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, ChevronDown } from "lucide-react"
import { type DateRange } from "@/types/dashboard"

const dateRanges: DateRange[] = [
  { label: "Last 7 days", value: "7d", days: 7 },
  { label: "Last 30 days", value: "30d", days: 30 },
  { label: "Last 90 days", value: "90d", days: 90 },
]

interface DateRangeFilterProps {
  defaultValue?: string
  onChange?: (range: DateRange) => void
}

export function DateRangeFilter({
  defaultValue = "7d",
  onChange
}: DateRangeFilterProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>(
    dateRanges.find(r => r.value === defaultValue) || dateRanges[0]
  )

  const handleSelect = (range: DateRange) => {
    setSelectedRange(range)
    onChange?.(range)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 rounded-md font-normal cursor-pointer"
        >
          <Calendar className="size-4" aria-hidden="true" />
          {selectedRange.label}
          <ChevronDown className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {dateRanges.map((range) => (
          <DropdownMenuItem
            key={range.value}
            onClick={() => handleSelect(range)}
            className="cursor-pointer"
          >
            {range.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
