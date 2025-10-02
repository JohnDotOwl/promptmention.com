import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus } from "lucide-react"
import { type BrandMention } from "@/types/dashboard"

const defaultMentions: BrandMention[] = [
  {
    rank: 1,
    name: "Xero",
    mentions: 7,
    trend: 0,
    isPositive: false,
  },
  {
    rank: 2,
    name: "Talenox",
    mentions: 5,
    trend: 0,
    isPositive: false,
  },
  {
    rank: 3,
    name: "QuickBooks",
    mentions: 5,
    trend: 0,
    isPositive: false,
  },
  {
    rank: 4,
    name: "BambooHR",
    mentions: 5,
    trend: 0,
    isPositive: false,
  },
  {
    rank: 5,
    name: "Swingvy",
    mentions: 4,
    trend: 0,
    isPositive: false,
  },
  {
    rank: 6,
    name: "Pay Boy (Us)",
    mentions: 4,
    trend: 0,
    isPositive: false,
  },
  {
    rank: 7,
    name: "Workday",
    mentions: 4,
    trend: 0,
    isPositive: false,
  },
]

interface BrandMentionsListProps {
  mentions?: BrandMention[]
}

export function BrandMentionsList({ mentions = defaultMentions }: BrandMentionsListProps) {
  return (
    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shrink-0 ring-muted/60 border shadow-sm ring-3">
      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 pt-4 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-2">
        <CardTitle className="leading-none font-semibold">Organic Brand Mentions</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Competitor mention frequency in organic responses.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-4 min-h-[280px]">
        <div className="relative h-full">
          <ol className="divide-y divide-border">
            {mentions.map((mention) => (
              <li
                key={mention.name}
                className="flex items-center gap-4 first:border-t mt-[2px] mb-[2px] last:border-b justify-between py-[7px]"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="text-muted-foreground text-sm text-left tabular-nums w-4 shrink-0">
                    {mention.rank}
                  </div>
                  <strong className="font-medium text-sm truncate">
                    {mention.name}
                  </strong>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-sm tabular-nums max-w-20 w-full text-right flex items-center gap-1 justify-end text-muted-foreground">
                    <Minus className="size-3 shrink-0" />
                    {mention.trend}%
                  </div>
                  <div className="text-foreground text-sm tabular-nums w-20 text-right shrink-0">
                    {mention.mentions}{" "}
                    <span className="font-normal text-muted-foreground/80">Ment.</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}