<?php

namespace App\Services;

use App\Models\DomainAnalysis;
use App\Models\User;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class DomainAnalysisService
{
    /**
     * Get domain analysis for a user.
     */
    public function getAnalysisForUser(int $userId): ?DomainAnalysis
    {
        return DomainAnalysis::where('user_id', $userId)
            ->latest()
            ->first();
    }

    /**
     * Get domain analysis by user and website.
     */
    public function getAnalysisByUserAndWebsite(int $userId, string $website): ?DomainAnalysis
    {
        return DomainAnalysis::where('user_id', $userId)
            ->where('company_website', $website)
            ->first();
    }

    /**
     * Create a new domain analysis record and queue it for processing.
     */
    public function createAndQueueAnalysis(int $userId, string $companyName, string $website): DomainAnalysis
    {
        Log::info('DomainAnalysisService::createAndQueueAnalysis called', [
            'user_id' => $userId,
            'company_name' => $companyName,
            'website' => $website
        ]);

        // Create or update domain analysis record
        $analysis = DomainAnalysis::updateOrCreate(
            [
                'user_id' => $userId,
                'company_website' => $website,
            ],
            [
                'company_name' => $companyName,
                'status' => 'pending',
                'error_message' => null,
                'processed_at' => null,
            ]
        );

        Log::info('Domain analysis record created/updated', [
            'analysis_id' => $analysis->id,
            'user_id' => $userId,
            'status' => $analysis->status,
            'was_recently_created' => $analysis->wasRecentlyCreated
        ]);

        // Queue the analysis for processing
        $this->queueForProcessing($userId, $companyName, $website);

        return $analysis;
    }

    /**
     * Create a new domain analysis record and queue it for processing with monitor_id.
     */
    public function createAndQueueAnalysisWithMonitor(int $userId, string $companyName, string $website, ?int $monitorId): DomainAnalysis
    {
        Log::info('DomainAnalysisService::createAndQueueAnalysisWithMonitor called', [
            'user_id' => $userId,
            'company_name' => $companyName,
            'website' => $website,
            'monitor_id' => $monitorId
        ]);

        // Create or update domain analysis record
        $analysis = DomainAnalysis::updateOrCreate(
            [
                'user_id' => $userId,
                'company_website' => $website,
            ],
            [
                'company_name' => $companyName,
                'status' => 'pending',
                'error_message' => null,
                'processed_at' => null,
            ]
        );

        Log::info('Domain analysis record created/updated', [
            'analysis_id' => $analysis->id,
            'user_id' => $userId,
            'status' => $analysis->status,
            'was_recently_created' => $analysis->wasRecentlyCreated
        ]);

        // Queue the analysis for processing with monitor_id
        $this->queueForProcessingWithMonitor($userId, $companyName, $website, $monitorId);

        return $analysis;
    }

    /**
     * Queue domain analysis for processing.
     */
    private function queueForProcessing(int $userId, string $companyName, string $website): void
    {
        try {
            $queueData = [
                'user_id' => $userId,
                'company_name' => $companyName,
                'company_website' => $website,
                'timestamp' => now()->toISOString(),
            ];

            Log::info('About to push to Redis queue', [
                'queue_name' => 'domain_search_queue',
                'queue_data' => $queueData
            ]);

            $result = Redis::rpush('domain_search_queue', json_encode($queueData));
            
            Log::info('Domain analysis queued for processing', [
                'user_id' => $userId,
                'company_name' => $companyName,
                'website' => $website,
                'redis_result' => $result,
                'queue_length' => Redis::llen('domain_search_queue')
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to queue domain analysis', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Re-throw to be caught by the controller
        }
    }

    /**
     * Queue domain analysis for processing with monitor_id.
     */
    private function queueForProcessingWithMonitor(int $userId, string $companyName, string $website, ?int $monitorId): void
    {
        try {
            $queueData = [
                'user_id' => $userId,
                'company_name' => $companyName,
                'company_website' => $website,
                'monitor_id' => $monitorId,
                'timestamp' => now()->toISOString(),
            ];

            Log::info('About to push to Redis queue with monitor_id', [
                'queue_name' => 'domain_search_queue',
                'queue_data' => $queueData
            ]);

            $result = Redis::rpush('domain_search_queue', json_encode($queueData));
            
            Log::info('Domain analysis queued for processing with monitor_id', [
                'user_id' => $userId,
                'company_name' => $companyName,
                'website' => $website,
                'monitor_id' => $monitorId,
                'redis_result' => $result,
                'queue_length' => Redis::llen('domain_search_queue')
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to queue domain analysis', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Re-throw to be caught by the controller
        }
    }

    /**
     * Check if analysis is ready for a user.
     */
    public function isAnalysisReady(int $userId): bool
    {
        $analysis = $this->getAnalysisForUser($userId);
        return $analysis && $analysis->isCompleted();
    }

    /**
     * Get analysis summary for onboarding page.
     */
    public function getAnalysisSummary(int $userId): ?array
    {
        $analysis = $this->getAnalysisForUser($userId);
        
        if (!$analysis || !$analysis->isCompleted()) {
            return null;
        }

        // Return data in the format expected by the frontend (Step3.tsx)
        return [
            'summary' => $analysis->summary ?? 'Analysis completed',
            'industry' => $analysis->industry ?? 'Not specified',
            'keywords' => $analysis->keywords ?? [],
            'competitors' => $analysis->competitors ?? [],
            'company_name' => $analysis->company_name,
            'website' => $analysis->company_website,
            'analysis_data' => $analysis->analysis_data,
            'processed_at' => $analysis->processed_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get analysis status for a user.
     */
    public function getAnalysisStatus(int $userId): array
    {
        $analysis = $this->getAnalysisForUser($userId);
        
        if (!$analysis) {
            return [
                'status' => 'not_started',
                'message' => 'Analysis not yet requested',
            ];
        }

        switch ($analysis->status) {
            case 'pending':
                return [
                    'status' => 'pending',
                    'message' => 'Analysis is queued for processing',
                ];
            case 'processing':
                return [
                    'status' => 'processing',
                    'message' => 'Analysis is currently being processed',
                ];
            case 'completed':
                return [
                    'status' => 'completed',
                    'message' => 'Analysis completed successfully',
                    'data' => $this->getAnalysisSummary($userId),
                ];
            case 'failed':
                return [
                    'status' => 'failed',
                    'message' => $analysis->error_message ?? 'Analysis failed',
                ];
            default:
                return [
                    'status' => 'unknown',
                    'message' => 'Unknown status',
                ];
        }
    }

    /**
     * Retry failed analysis.
     */
    public function retryAnalysis(int $userId): bool
    {
        $analysis = $this->getAnalysisForUser($userId);
        
        if (!$analysis) {
            return false;
        }

        // Reset status and queue for processing
        $analysis->update([
            'status' => 'pending',
            'error_message' => null,
        ]);

        $this->queueForProcessing($userId, $analysis->company_name, $analysis->company_website);
        
        return true;
    }
}