import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"

interface TrialAlertProps {
  onStartTrial?: () => void
}

export function TrialAlert({ onStartTrial }: TrialAlertProps) {
  return (
    <Alert className="bg-blue-50 text-blue-600 border-blue-200 *:data-[slot=alert-description]:text-blue-600">
      <AlertDescription className="text-muted-foreground col-start-2 grid justify-items-start gap-1 [&_p]:leading-relaxed text-base w-full cursor-pointer">
        <div className="flex items-center justify-between w-full gap-4">
          <div>
            <strong className="font-semibold">Start your 7-day free trial.</strong>{" "}
            Select a plan to start your 7-day free trial.
          </div>
          <Button
            className="ml-2 cursor-pointer"
            onClick={onStartTrial}
          >
            Start 7-day free trial{" "}
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}