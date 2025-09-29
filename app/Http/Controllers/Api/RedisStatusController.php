<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;

class RedisStatusController extends Controller
{
    public function queueStatus()
    {
        try {
            $domainQueueLength = Redis::llen('promptmention_database_domain_search_queue');
            $promptQueueLength = Redis::llen('promptmention_database_prompt_generation_queue');
            $monitorSetupQueueLength = Redis::llen('promptmention_database_monitor_setup_queue');

            return response()->json([
                'success' => true,
                'queues' => [
                    'domain_analysis' => [
                        'name' => 'Domain Analysis',
                        'length' => $domainQueueLength,
                        'estimated_time' => $domainQueueLength * 10, // ~10 seconds per job
                    ],
                    'prompt_generation' => [
                        'name' => 'Prompt Generation',
                        'length' => $promptQueueLength,
                        'estimated_time' => $promptQueueLength * 4, // ~4 seconds per job (optimized)
                    ],
                    'monitor_setup' => [
                        'name' => 'Monitor Setup',
                        'length' => $monitorSetupQueueLength,
                        'estimated_time' => $monitorSetupQueueLength * 15, // ~15 seconds per job
                    ],
                ],
                'total_jobs' => $domainQueueLength + $promptQueueLength + $monitorSetupQueueLength,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Unable to connect to Redis',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function monitorStatus($monitorId)
    {
        try {
            $monitor = DB::table('monitors')->where('id', $monitorId)->first();
            
            if (!$monitor) {
                return response()->json([
                    'success' => false,
                    'error' => 'Monitor not found'
                ], 404);
            }

            $promptsCount = DB::table('prompts')->where('monitor_id', $monitorId)->count();
            
            // Check if there are any pending jobs for this monitor
            $domainQueue = Redis::lrange('promptmention_database_domain_search_queue', 0, -1);
            $promptQueue = Redis::lrange('promptmention_database_prompt_generation_queue', 0, -1);
            
            $hasPendingDomainAnalysis = collect($domainQueue)->contains(function ($job) use ($monitorId) {
                $data = json_decode($job, true);
                return isset($data['monitor_id']) && $data['monitor_id'] == $monitorId;
            });
            
            $hasPendingPromptGeneration = collect($promptQueue)->contains(function ($job) use ($monitorId) {
                $data = json_decode($job, true);
                return isset($data['monitor_id']) && $data['monitor_id'] == $monitorId;
            });

            $status = 'completed';
            $message = 'Setup completed';
            
            if ($hasPendingDomainAnalysis) {
                $status = 'analyzing_domain';
                $message = 'Analyzing company website...';
            } elseif ($hasPendingPromptGeneration) {
                $status = 'generating_prompts';
                $message = 'Generating brand monitoring prompts...';
            } elseif ($monitor->setup_status === 'pending' && $promptsCount === 0) {
                $status = 'pending';
                $message = 'Setup queued for processing...';
            } elseif ($promptsCount > 0) {
                $status = 'completed';
                $message = "Setup completed with {$promptsCount} prompts generated";
            }

            return response()->json([
                'success' => true,
                'monitor_id' => $monitorId,
                'status' => $status,
                'message' => $message,
                'setup_status' => $monitor->setup_status,
                'prompts_generated' => $promptsCount,
                'prompts_generated_at' => $monitor->prompts_generated_at,
                'has_pending_domain_analysis' => $hasPendingDomainAnalysis,
                'has_pending_prompt_generation' => $hasPendingPromptGeneration,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Unable to check monitor status',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}