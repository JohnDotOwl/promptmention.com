<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class MonitorSetupService
{
    /**
     * Queue monitor setup for processing (domain analysis + prompt generation)
     * 
     * @param int $monitorId
     * @param string $companyName
     * @param string $companyWebsite
     * @return bool
     */
    public function queueMonitorSetup(int $monitorId, string $companyName, string $companyWebsite): bool
    {
        try {
            // Prepare job payload
            $payload = [
                'monitor_id' => $monitorId,
                'company_name' => $companyName,
                'company_website' => $companyWebsite,
                'timestamp' => now()->toISOString(),
            ];

            // Push to Redis queue (using facade to apply prefix automatically)
            Redis::rpush('monitor_setup_queue', json_encode($payload));

            Log::info("Queued monitor setup", [
                'monitor_id' => $monitorId,
                'company_name' => $companyName,
                'queue_name' => 'monitor_setup_queue'
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error("Failed to queue monitor setup", [
                'monitor_id' => $monitorId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get monitor setup status
     * 
     * @param int $monitorId
     * @return array
     */
    public function getSetupStatus(int $monitorId): array
    {
        $monitor = DB::table('monitors')
            ->where('id', $monitorId)
            ->first();

        if (!$monitor) {
            return [
                'status' => 'not_found',
                'message' => 'Monitor not found',
            ];
        }

        switch ($monitor->setup_status) {
            case 'pending':
                return [
                    'status' => 'pending',
                    'message' => 'Monitor setup is queued for processing',
                ];
            case 'analyzing':
                return [
                    'status' => 'analyzing',
                    'message' => 'Analyzing company information',
                ];
            case 'generating_prompts':
                return [
                    'status' => 'generating_prompts',
                    'message' => 'Generating monitoring prompts',
                ];
            case 'completed':
                return [
                    'status' => 'completed',
                    'message' => 'Setup completed successfully',
                    'data' => [
                        'summary' => $monitor->company_summary,
                        'industry' => $monitor->industry,
                        'keywords' => json_decode($monitor->keywords, true) ?? [],
                        'competitors' => json_decode($monitor->competitors, true) ?? [],
                        'prompts_generated' => $monitor->prompts_generated,
                    ]
                ];
            case 'failed':
                return [
                    'status' => 'failed',
                    'message' => $monitor->setup_error ?? 'Setup failed',
                ];
            default:
                return [
                    'status' => 'unknown',
                    'message' => 'Unknown status',
                ];
        }
    }
}