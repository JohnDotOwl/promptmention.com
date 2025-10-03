import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus, TrendingUp, TrendingDown } from "lucide-react"
import { type BrandMention } from "@/types/dashboard"

interface BrandMentionsListProps {
  mentions?: BrandMention[]
}

export function BrandMentionsList({ mentions = [] }: BrandMentionsListProps) {
  const hasData = mentions && mentions.length > 0

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
          {hasData ? (
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
                      {mention.trend > 0 ? (
                        mention.isPositive ? (
                          <TrendingUp className="size-3 shrink-0 text-green-600" />
                        ) : (
                          <TrendingDown className="size-3 shrink-0 text-red-600" />
                        )
                      ) : (
                        <Minus className="size-3 shrink-0" />
                      )}
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
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="text-muted-foreground mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-3 opacity-50"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">No competitor mentions yet</p>
              <p className="text-xs text-muted-foreground/70 max-w-[200px]">
                Competitor mentions will appear here once AI responses are collected.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}