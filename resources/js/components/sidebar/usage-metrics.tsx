import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Link } from "@inertiajs/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UsageMetric {
  name: string
  current: number
  max: number
  unit?: string
}

interface UsageMetricsProps {
  metrics?: UsageMetric[]
  showUpgradeButton?: boolean
}

export function UsageMetrics({
  metrics = [],
  showUpgradeButton = true
}: UsageMetricsProps) {
  const [showComingSoonDialog, setShowComingSoonDialog] = React.useState(false)
  // Default metrics for demo
  const defaultMetrics: UsageMetric[] = [
    {
      name: "Prompt Responses",
      current: 30,
      max: 100,
    },
    {
      name: "Analytics Events",
      current: 0,
      max: 0,
    }
  ]

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics

  return (
    <div className="p-2 space-y-3">
      <Link
        href="/settings/billing"
        className="text-sm text-muted-foreground flex items-center gap-1 font-medium hover:text-primary"
      >
        Usage <ChevronRight className="size-3" />
      </Link>

      <div className="space-y-3">
        <div className="space-y-4">
          {displayMetrics.map((metric) => (
            <div key={metric.name}>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 col-span-1">
                    {metric.name}
                  </span>
                  <div className="flex gap-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-right tabular-nums">
                      {metric.current} / {metric.max}
                      {metric.unit && ` ${metric.unit}`}
                    </p>
                  </div>
                </div>
                <div
                  className="flex w-full items-center"
                  role="progressbar"
                  aria-label="Progress bar"
                  aria-valuenow={metric.current}
                  aria-valuemin={0}
                  aria-valuemax={metric.max}
                >
                  <div className="relative flex w-full items-center rounded-full bg-blue-200 dark:bg-blue-500/30 h-1">
                    <div
                      className="h-full flex-col rounded-full bg-blue-500 dark:bg-blue-500"
                      style={{
                        width: metric.max > 0
                          ? `${(metric.current / metric.max) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showUpgradeButton && (
        <div>
          <Button
            className="w-full h-7 text-xs cursor-pointer"
            size="sm"
            onClick={() => setShowComingSoonDialog(true)}
          >
            Start Free 7-day Trial
          </Button>
        </div>
      )}

      <Dialog open={showComingSoonDialog} onOpenChange={setShowComingSoonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coming Soon!</DialogTitle>
            <DialogDescription>
              Our trial and billing features are currently in development.
              Stay tuned for exciting upgrades and subscription plans that will unlock
              additional features and higher usage limits.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}