import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useSmartPolling } from '@/hooks/use-smart-polling'

interface QueueInfo {
  name: string
  length: number
  estimated_time: number
}

interface QueueStatus {
  success: boolean
  queues: {
    domain_analysis: QueueInfo
    prompt_generation: QueueInfo
    monitor_setup: QueueInfo
  }
  total_jobs: number
  timestamp: string
}

interface MonitorStatusInfo {
  success: boolean
  monitor_id: number
  status: string
  message: string
  setup_status: string
  prompts_generated: number
  prompts_generated_at: string | null
  has_pending_domain_analysis: boolean
  has_pending_prompt_generation: boolean
  timestamp: string
}

interface Monitor {
  id: number
  name: string
  setup_status: string
  prompts_generated: number
  prompts_generated_at: string | null
}

interface RedisStatusIndicatorProps {
  monitors: Monitor[]
}

export default function RedisStatusIndicator({ monitors }: RedisStatusIndicatorProps) {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
  const [monitorStatuses, setMonitorStatuses] = useState<Record<number, MonitorStatusInfo>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchQueueStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/redis/queue-status')
      const data = await response.json()
      setQueueStatus(data)
    } catch (error) {
      console.error('Failed to fetch queue status:', error)
    }
  }, [])

  const fetchMonitorStatus = useCallback(async (monitorId: number) => {
    try {
      const response = await fetch(`/api/monitors/${monitorId}/status`)
      const data = await response.json()
      setMonitorStatuses(prev => ({
        ...prev,
        [monitorId]: data
      }))
    } catch (error) {
      console.error(`Failed to fetch status for monitor ${monitorId}:`, error)
    }
  }, [])

  const fetchAllStatuses = useCallback(async () => {
    setIsLoading(true)
    await fetchQueueStatus()

    // Fetch status for monitors that might be processing
    const pendingMonitors = monitors.filter(m =>
      m.setup_status === 'pending' || m.prompts_generated === 0
    )

    await Promise.all(
      pendingMonitors.map(monitor => fetchMonitorStatus(monitor.id))
    )

    setLastUpdated(new Date())
    setIsLoading(false)
  }, [monitors, fetchQueueStatus, fetchMonitorStatus])

  // Smart polling for queue status updates
  const queuePolling = useSmartPolling({
    interval: 5000,
    priority: 'high', // High priority for queue monitoring
    pauseWhenHidden: true,
    maxFailures: 3,
    shouldPoll: () => {
      // Only poll if there are pending jobs or processing monitors
      const hasPendingJobs = (queueStatus?.total_jobs ?? 0) > 0 || 
        Object.values(monitorStatuses).some(status => 
          status.status !== 'completed'
        );
      return hasPendingJobs;
    },
    onSuccess: () => {
      setLastUpdated(new Date());
    },
    onError: (error) => {
      console.error('Queue polling failed:', error);
    }
  });

  useEffect(() => {
    // Initial fetch
    fetchAllStatuses()

    // Polling disabled - causing spam requests
    // Users can manually refresh using the button
    /*
    queuePolling.startPolling(async () => {
      await fetchAllStatuses();
    });

    return () => {
      queuePolling.stopPolling();
    };
    */
  }, [monitors, fetchAllStatuses])

  // Restart polling when queue status changes
  // Polling disabled - causing spam requests
  // Users can manually refresh using the button
  /*
  useEffect(() => {
    const hasPendingJobs = (queueStatus?.total_jobs ?? 0) > 0 ||
      Object.values(monitorStatuses).some(status =>
        status.status !== 'completed'
      );

    if (hasPendingJobs && !queuePolling.isPolling) {
      queuePolling.startPolling(async () => {
        await fetchAllStatuses();
      });
    } else if (!hasPendingJobs && queuePolling.isPolling) {
      queuePolling.stopPolling();
    }
  }, [queueStatus?.total_jobs, monitorStatuses, queuePolling.isPolling, queuePolling, fetchAllStatuses])
  */

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'analyzing_domain':
      case 'generating_prompts':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'analyzing_domain':
      case 'generating_prompts':
        return 'secondary'
      case 'pending':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (!queueStatus && !isLoading) {
    return null
  }

  const hasActiveProcessing = (queueStatus?.total_jobs ?? 0) > 0 || 
    Object.values(monitorStatuses).some(status => 
      status.status !== 'completed'
    )

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Processing Status</h3>
            {hasActiveProcessing && (
              <Badge variant="secondary" className="text-xs">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllStatuses}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Queue Status */}
        {queueStatus && queueStatus.total_jobs > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border">
            <h4 className="text-sm font-medium mb-2 text-blue-900">Active Queues</h4>
            <div className="space-y-2">
              {Object.entries(queueStatus.queues).map(([key, queue]) => 
                queue.length > 0 && (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-blue-800">{queue.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {queue.length} jobs
                      </Badge>
                      <span className="text-xs text-blue-600">
                        ~{formatTime(queue.estimated_time)}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Monitor Status */}
        {Object.keys(monitorStatuses).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Monitor Setup</h4>
            {Object.values(monitorStatuses).map((status) => {
              const monitor = monitors.find(m => m.id === status.monitor_id)
              if (!monitor) return null

              return (
                <div key={status.monitor_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.status)}
                    <span className="text-sm font-medium">{monitor.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(status.status)} className="text-xs">
                      {status.message}
                    </Badge>
                    {status.prompts_generated > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {status.prompts_generated} prompts
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* No active processing */}
        {!hasActiveProcessing && !isLoading && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            All processing complete
          </div>
        )}
      </CardContent>
    </Card>
  )
}