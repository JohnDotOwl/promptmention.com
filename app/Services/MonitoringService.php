<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MonitoringService
{
    /**
     * Get cached monitor data with efficient query optimization
     */
    public function getCachedMonitors($userId, $cacheTtl = 300)
    {
        $cacheKey = "user_monitors_{$userId}";

        return Cache::remember($cacheKey, $cacheTtl, function () use ($userId) {
            return DB::table('monitors')
                ->where('user_id', $userId)
                ->select(['id', 'name', 'status', 'created_at', 'updated_at'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($monitor) {
                    $monitor->stats = $this->getMonitorStats($monitor->id);
                    return $monitor;
                });
        });
    }

    /**
     * Get monitor statistics with optimized queries
     */
    private function getMonitorStats($monitorId)
    {
        $cacheKey = "monitor_stats_{$monitorId}";

        return Cache::remember($cacheKey, 3600, function () use ($monitorId) {
            try {
                $stats = DB::table('monitor_stats')
                    ->where('monitor_id', $monitorId)
                    ->where('date', '>=', now()->subDays(30))
                    ->selectRaw('
                        SUM(total_prompts) as total_prompts,
                        SUM(total_responses) as total_responses,
                        AVG(visibility_score) as avg_visibility,
                        SUM(mentions) as total_mentions,
                        COUNT(DISTINCT date) as days_active
                    ')
                    ->first();

                return [
                    'totalPrompts' => (int) ($stats->total_prompts ?? 0),
                    'totalResponses' => (int) ($stats->total_responses ?? 0),
                    'avgVisibility' => round((float) ($stats->avg_visibility ?? 0), 2),
                    'totalMentions' => (int) ($stats->total_mentions ?? 0),
                    'daysActive' => (int) ($stats->days_active ?? 0),
                ];
            } catch (\Exception $e) {
                Log::error("Failed to get monitor stats for monitor {$monitorId}", [
                    'error' => $e->getMessage()
                ]);
                return [
                    'totalPrompts' => 0,
                    'totalResponses' => 0,
                    'avgVisibility' => 0,
                    'totalMentions' => 0,
                    'daysActive' => 0,
                ];
            }
        });
    }

    /**
     * Clear cache for specific monitor
     */
    public function clearMonitorCache($monitorId, $userId)
    {
        $cacheKeys = [
            "user_monitors_{$userId}",
            "monitor_stats_{$monitorId}",
        ];

        foreach ($cacheKeys as $key) {
            Cache::forget($key);
        }

        Log::info("Cleared cache for monitor {$monitorId} and user {$userId}");
    }

    /**
     * Get active monitor count with caching
     */
    public function getActiveMonitorCount($userId)
    {
        return Cache::remember("active_monitors_count_{$userId}", 300, function () use ($userId) {
            return DB::table('monitors')
                ->where('user_id', $userId)
                ->where('status', 'active')
                ->count();
        });
    }
}