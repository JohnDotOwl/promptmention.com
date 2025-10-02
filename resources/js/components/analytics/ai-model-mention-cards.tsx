import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { type ModelMention } from "@/types/analytics"
import { ArrowUp, ArrowDown } from "lucide-react"

interface AIModelMentionCardsProps {
  mentions: ModelMention[]
  onboardingCompleted: boolean
}

export function AIModelMentionCards({
  mentions,
  onboardingCompleted
}: AIModelMentionCardsProps) {
  const hasNoData = mentions.every(m => m.count === 0)

  return (
    <Card className="bg-white border rounded-lg overflow-hidden">
      <CardContent className="p-0">
        <h2 className="text-lg font-semibold mb-4 px-6">AI Model Mentions</h2>
        <div className="relative overflow-hidden rounded-xl">
          {/* Overlay for setup CTA when onboarding not complete */}
          {!onboardingCompleted && (
            <div className="flex items-center justify-center h-full w-full absolute inset-0 z-10 bg-white/80 backdrop-grayscale">
              <div className="text-sm leading-none bg-white py-1.5 pl-5 pr-2 rounded-full z-20 border shadow-md text-center flex flex-row items-center gap-4">
                <div>Complete onboarding to track AI model mentions</div>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full h-7 px-3 text-xs cursor-pointer"
                >
                  <Link href="/onboarding">Complete Onboarding</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Overlay when onboarding complete but no data yet */}
          {onboardingCompleted && hasNoData && (
            <div className="flex items-center justify-center h-full w-full absolute inset-0 z-10 bg-white/80 backdrop-grayscale">
              <div className="text-sm leading-none bg-white py-1.5 pl-5 pr-2 rounded-full z-20 border shadow-md text-center flex flex-row items-center gap-4">
                <div>No mentions data yet. Start monitoring to see results.</div>
              </div>
            </div>
          )}

          {/* Model mention cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {mentions.map((mention, index) => (
              <div
                key={mention.model}
                className={`w-full px-6 py-6 h-36 flex flex-col justify-between ${
                  index !== mentions.length - 1
                    ? 'border-b sm:border-b-0 sm:border-r lg:last:border-r-0'
                    : ''
                }`}
              >
                {/* Model header with favicon */}
                <h3 className="flex items-center gap-2 font-semibold">
                  <div className="bg-white rounded-sm overflow-hidden flex items-center justify-center border shrink-0 size-6">
                    <img
                      alt={mention.domain}
                      loading="eager"
                      width="16"
                      height="16"
                      decoding="async"
                      className="rounded-sm"
                      src={mention.favicon}
                    />
                  </div>
                  <span className="truncate text-sm">{mention.model}</span>
                </h3>

                {/* Metrics */}
                <div className="mt-4">
                  <strong className="text-2xl block mb-1">{mention.count}</strong>
                  <p className="text-muted-foreground text-xs truncate flex items-center gap-1">
                    {mention.changePercent > 0 ? (
                      <>
                        {mention.isPositive ? (
                          <ArrowUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`font-semibold ${mention.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {mention.changePercent}%
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground font-semibold">0%</span>
                    )}
                    {" "}from last 7 days
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
