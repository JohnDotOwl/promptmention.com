<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PromptGenerationService
{
    private $redis;
    private $queueName = 'prompt_generation_queue';

    public function __construct()
    {
        $this->redis = Redis::connection();
    }

    /**
     * Create a new prompt generation request
     * 
     * @param int $userId
     * @param string $companyName
     * @param string $companyWebsite
     * @param array $analysisData
     * @return string|null Request ID
     */
    public function createRequest($userId, $companyName, $companyWebsite, $analysisData = [])
    {
        try {
            $requestId = Str::uuid()->toString();
            
            // Prepare request data
            $requestData = [
                'id' => $requestId,
                'user_id' => $userId,
                'company_name' => $companyName,
                'company_website' => $companyWebsite,
                'industry' => $analysisData['industry'] ?? null,
                'keywords' => json_encode($analysisData['keywords'] ?? []),
                'competitors' => json_encode($analysisData['competitors'] ?? []),
                'summary' => $analysisData['summary'] ?? null,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Insert request into database
            DB::table('prompt_generation_requests')->insert($requestData);

            Log::info("Created prompt generation request", [
                'request_id' => $requestId,
                'user_id' => $userId,
                'company_name' => $companyName
            ]);

            return $requestId;

        } catch (\Exception $e) {
            Log::error("Failed to create prompt generation request", [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'company_name' => $companyName
            ]);
            return null;
        }
    }

    /**
     * Queue a prompt generation job
     * 
     * @param array $jobData
     * @return bool
     */
    public function queuePromptGeneration($jobData)
    {
        try {
            // Prepare job payload
            $payload = [
                'user_id' => $jobData['user_id'],
                'monitor_id' => $jobData['monitor_id'] ?? null,
                'company_name' => $jobData['company_name'],
                'company_website' => $jobData['company_website'] ?? null,
                'industry' => $jobData['industry'] ?? null,
                'keywords' => $jobData['keywords'] ?? [],
                'competitors' => $jobData['competitors'] ?? [],
                'summary' => $jobData['summary'] ?? null,
                'timestamp' => now()->toISOString(),
            ];

            // Push to Redis queue (using facade to apply prefix automatically)
            Redis::rpush($this->queueName, json_encode($payload));

            Log::info("Queued prompt generation job", [
                'user_id' => $jobData['user_id'],
                'monitor_id' => $jobData['monitor_id'] ?? null,
                'company_name' => $jobData['company_name'],
                'queue_name' => $this->queueName
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error("Failed to queue prompt generation job", [
                'error' => $e->getMessage(),
                'job_data' => $jobData
            ]);
            return false;
        }
    }

    /**
     * Get prompt generation request status
     * 
     * @param string $requestId
     * @return array|null
     */
    public function getRequestStatus($requestId)
    {
        try {
            $request = DB::table('prompt_generation_requests')
                ->where('id', $requestId)
                ->first();

            if (!$request) {
                return null;
            }

            return [
                'id' => $request->id,
                'status' => $request->status,
                'prompts_generated' => $request->prompts_generated,
                'error_message' => $request->error_message,
                'created_at' => $request->created_at,
                'processed_at' => $request->processed_at,
            ];

        } catch (\Exception $e) {
            Log::error("Failed to get request status", [
                'error' => $e->getMessage(),
                'request_id' => $requestId
            ]);
            return null;
        }
    }

    /**
     * Get requests for a user
     * 
     * @param int $userId
     * @param string $status
     * @return array
     */
    public function getUserRequests($userId, $status = null)
    {
        try {
            $query = DB::table('prompt_generation_requests')
                ->where('user_id', $userId);

            if ($status) {
                $query->where('status', $status);
            }

            $requests = $query->orderBy('created_at', 'desc')->get();

            return $requests->map(function ($request) {
                return [
                    'id' => $request->id,
                    'company_name' => $request->company_name,
                    'company_website' => $request->company_website,
                    'status' => $request->status,
                    'prompts_generated' => $request->prompts_generated,
                    'error_message' => $request->error_message,
                    'created_at' => $request->created_at,
                    'processed_at' => $request->processed_at,
                ];
            })->toArray();

        } catch (\Exception $e) {
            Log::error("Failed to get user requests", [
                'error' => $e->getMessage(),
                'user_id' => $userId
            ]);
            return [];
        }
    }

    /**
     * Get generated prompts for a request
     * 
     * @param string $requestId
     * @return array
     */
    public function getGeneratedPrompts($requestId)
    {
        try {
            $prompts = DB::table('prompts')
                ->where('prompt_generation_request_id', $requestId)
                ->orderBy('type')
                ->orderBy('created_at')
                ->get();

            return $prompts->map(function ($prompt) {
                return [
                    'id' => $prompt->id,
                    'text' => $prompt->text,
                    'type' => $prompt->type,
                    'intent' => $prompt->intent,
                    'language_code' => $prompt->language_code,
                    'language_name' => $prompt->language_name,
                    'language_flag' => $prompt->language_flag,
                    'response_count' => $prompt->response_count,
                    'visibility_percentage' => $prompt->visibility_percentage,
                    'is_active' => $prompt->is_active,
                    'created_at' => $prompt->created_at,
                ];
            })->toArray();

        } catch (\Exception $e) {
            Log::error("Failed to get generated prompts", [
                'error' => $e->getMessage(),
                'request_id' => $requestId
            ]);
            return [];
        }
    }

    /**
     * Get prompts for a monitor
     * 
     * @param string $monitorId
     * @param string $type
     * @return array
     */
    public function getMonitorPrompts($monitorId, $type = null)
    {
        try {
            $query = DB::table('prompts')
                ->where('monitor_id', $monitorId)
                ->where('is_active', true);

            if ($type) {
                $query->where('type', $type);
            }

            $prompts = $query->orderBy('type')
                ->orderBy('created_at', 'desc')
                ->get();

            return $prompts->map(function ($prompt) {
                return [
                    'id' => $prompt->id,
                    'text' => $prompt->text,
                    'type' => $prompt->type,
                    'intent' => $prompt->intent,
                    'language_code' => $prompt->language_code,
                    'language_name' => $prompt->language_name,
                    'language_flag' => $prompt->language_flag,
                    'response_count' => $prompt->response_count,
                    'visibility_percentage' => $prompt->visibility_percentage,
                    'generated_by_ai' => $prompt->generated_by_ai,
                    'created_at' => $prompt->created_at,
                ];
            })->toArray();

        } catch (\Exception $e) {
            Log::error("Failed to get monitor prompts", [
                'error' => $e->getMessage(),
                'monitor_id' => $monitorId
            ]);
            return [];
        }
    }

    /**
     * Update prompt generation request status
     * 
     * @param string $requestId
     * @param string $status
     * @param array $data
     * @return bool
     */
    public function updateRequestStatus($requestId, $status, $data = [])
    {
        try {
            $updateData = [
                'status' => $status,
                'updated_at' => now(),
            ];

            if (isset($data['prompts_generated'])) {
                $updateData['prompts_generated'] = $data['prompts_generated'];
            }

            if (isset($data['error_message'])) {
                $updateData['error_message'] = $data['error_message'];
            }

            if ($status === 'completed' || $status === 'failed') {
                $updateData['processed_at'] = now();
            }

            DB::table('prompt_generation_requests')
                ->where('id', $requestId)
                ->update($updateData);

            Log::info("Updated request status", [
                'request_id' => $requestId,
                'status' => $status,
                'data' => $data
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error("Failed to update request status", [
                'error' => $e->getMessage(),
                'request_id' => $requestId
            ]);
            return false;
        }
    }

    /**
     * Link prompts to a monitor
     * 
     * @param string $requestId
     * @param string $monitorId
     * @return bool
     */
    public function linkPromptsToMonitor($requestId, $monitorId)
    {
        try {
            DB::table('prompts')
                ->where('prompt_generation_request_id', $requestId)
                ->update([
                    'monitor_id' => $monitorId,
                    'updated_at' => now()
                ]);

            Log::info("Linked prompts to monitor", [
                'request_id' => $requestId,
                'monitor_id' => $monitorId
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error("Failed to link prompts to monitor", [
                'error' => $e->getMessage(),
                'request_id' => $requestId,
                'monitor_id' => $monitorId
            ]);
            return false;
        }
    }

    /**
     * Get queue length
     * 
     * @return int
     */
    public function getQueueLength()
    {
        try {
            return $this->redis->llen($this->queueName);
        } catch (\Exception $e) {
            Log::error("Failed to get queue length", ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get statistics for prompt generation
     * 
     * @param int $userId
     * @return array
     */
    public function getStatistics($userId = null)
    {
        try {
            $query = DB::table('prompt_generation_requests');
            
            if ($userId) {
                $query->where('user_id', $userId);
            }

            $stats = [
                'total_requests' => $query->count(),
                'pending_requests' => $query->where('status', 'pending')->count(),
                'processing_requests' => $query->where('status', 'processing')->count(),
                'completed_requests' => $query->where('status', 'completed')->count(),
                'failed_requests' => $query->where('status', 'failed')->count(),
                'total_prompts_generated' => $query->sum('prompts_generated'),
                'queue_length' => $this->getQueueLength(),
            ];

            return $stats;

        } catch (\Exception $e) {
            Log::error("Failed to get statistics", [
                'error' => $e->getMessage(),
                'user_id' => $userId
            ]);
            return [];
        }
    }
}