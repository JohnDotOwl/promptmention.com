<?php

namespace App\Http\Controllers;

use App\Models\OnboardingProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Base data that doesn't change often
        $baseData = [
            'user' => $user,
        ];

        // Get partial data based on request
        if ($request->header('X-Inertia-Partial-Data')) {
            $partialKeys = explode(',', $request->header('X-Inertia-Partial-Data'));
            $partialData = $this->getPartialData($partialKeys, $user);
            return Inertia::render('dashboard', array_merge($baseData, $partialData));
        }

        // Full page load - include all data
        return Inertia::render('dashboard', array_merge($baseData, [
            'metrics' => $this->getMetricsData($user),
            'chartData' => $this->getChartData($user),
            'recentActivity' => $this->getRecentActivity($user),
            'monitorStatus' => $this->getMonitorStatus($user),
            'queueStatus' => $this->getQueueStatus(),
        ]));
    }

    /**
     * Clear dashboard cache for user when data changes
     */
    public function clearCache($userId)
    {
        $cacheKeys = [
            "dashboard_metrics_{$userId}",
            "dashboard_chart_{$userId}",
            "monitor_status_{$userId}",
        ];

        foreach ($cacheKeys as $key) {
            cache()->forget($key);
        }

        return response()->json(['message' => 'Cache cleared successfully']);
    }
    
    private function getPartialData(array $keys, $user): array
    {
        $data = [];
        
        foreach ($keys as $key) {
            switch ($key) {
                case 'metrics':
                    $data['metrics'] = $this->getMetricsData($user);
                    break;
                case 'chartData':
                    $data['chartData'] = $this->getChartData($user);
                    break;
                case 'recentActivity':
                    $data['recentActivity'] = $this->getRecentActivity($user);
                    break;
                case 'monitorStatus':
                    $data['monitorStatus'] = $this->getMonitorStatus($user);
                    break;
                case 'queueStatus':
                    $data['queueStatus'] = $this->getQueueStatus();
                    break;
            }
        }
        
        return $data;
    }
    
    private function getMetricsData($user): array
    {
        try {
            $metrics = [
                'totalMonitors' => 1, // Default for now
                'totalPrompts' => 0,
                'totalResponses' => 0,
                'visibilityScore' => 0.0,
                'mentionsThisWeek' => 0,
                'responseRate' => 0.0,
            ];

            // Use cache for better performance on frequent dashboard loads
            $cacheKey = "dashboard_metrics_{$user->id}";
            $cachedMetrics = cache()->get($cacheKey);

            if ($cachedMetrics) {
                return $cachedMetrics;
            }

            // Get actual data if monitors table exists
            if ($this->tableExists('monitors')) {
                $monitors = DB::table('monitors')
                    ->where('user_id', $user->id)
                    ->get();

                $metrics['totalMonitors'] = $monitors->count();

                // Get aggregated stats if available - optimized query with index hints
                if ($this->tableExists('monitor_stats')) {
                    $stats = DB::table('monitor_stats')
                        ->whereIn('monitor_id', $monitors->pluck('id'))
                        ->where('date', '>=', now()->subDays(7))
                        ->selectRaw('
                            SUM(total_prompts) as total_prompts,
                            SUM(total_responses) as total_responses,
                            AVG(visibility_score) as avg_visibility,
                            SUM(mentions) as total_mentions
                        ')
                        ->first();

                    if ($stats) {
                        $metrics['totalPrompts'] = (int) $stats->total_prompts;
                        $metrics['totalResponses'] = (int) $stats->total_responses;
                        $metrics['visibilityScore'] = round((float) $stats->avg_visibility, 2);
                        $metrics['mentionsThisWeek'] = (int) $stats->total_mentions;

                        if ($metrics['totalPrompts'] > 0) {
                            $metrics['responseRate'] = round(($metrics['totalResponses'] / $metrics['totalPrompts']) * 100, 1);
                        }
                    }
                }
            }

            // Cache metrics for 5 minutes to reduce database load
            cache()->put($cacheKey, $metrics, now()->addMinutes(5));

            return $metrics;
        } catch (\Exception $e) {
            \Log::error('Failed to get metrics data', ['error' => $e->getMessage()]);
            return [
                'totalMonitors' => 0,
                'totalPrompts' => 0,
                'totalResponses' => 0,
                'visibilityScore' => 0.0,
                'mentionsThisWeek' => 0,
                'responseRate' => 0.0,
            ];
        }
    }
    
    private function getChartData($user): array
    {
        try {
            // Mock data for now - replace with actual analytics
            $dates = collect(range(6, 0))->map(fn($days) => now()->subDays($days)->format('M j'));

            return [
                'timeline' => $dates->map(function($date, $index) {
                    return [
                        'date' => $date,
                        'gemini-2.0-flash' => [0, 2, 1, 3, 2, 4, 5][$index] ?? 0,
                        'gpt-4o-search' => [0, 3, 2, 5, 4, 5, 7][$index] ?? 0,
                        'mistral-small-latest' => [0, 0, 0, 0, 0, 0, 0][$index] ?? 0,
                    ];
                })->values()->toArray(),
                'modelUsage' => [
                    ['name' => 'gemini-2.0-flash', 'value' => 10, 'fill' => '#3b82f6'],
                    ['name' => 'gpt-4o-search', 'value' => 10, 'fill' => '#10b981'],
                    ['name' => 'mistral-small-latest', 'value' => 10, 'fill' => '#8B5CF6'],
                ],
                'citedDomains' => [
                    ['domain' => 'reddit.com', 'favicon' => 'https://www.google.com/s2/favicons?domain=reddit.com&size=64', 'count' => 9, 'percentage' => 100],
                    ['domain' => 'selecthub.com', 'favicon' => 'https://www.google.com/s2/favicons?domain=selecthub.com&size=64', 'count' => 4, 'percentage' => 44.4444],
                    ['domain' => 'wise.com', 'favicon' => 'https://www.google.com/s2/favicons?domain=wise.com&size=64', 'count' => 2, 'percentage' => 22.2222],
                    ['domain' => 'volopay.com', 'favicon' => 'https://www.google.com/s2/favicons?domain=volopay.com&size=64', 'count' => 2, 'percentage' => 22.2222],
                ]
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to get chart data', ['error' => $e->getMessage()]);
            return [
                'timeline' => [],
                'modelUsage' => [],
                'citedDomains' => []
            ];
        }
    }
    
    private function getRecentActivity($user): array
    {
        try {
            // Mock recent activity - replace with actual data
            return [
                [
                    'id' => 1,
                    'type' => 'mention',
                    'title' => 'New mention found',
                    'description' => 'Your brand was mentioned in a GPT-4 response',
                    'time' => now()->subMinutes(5)->diffForHumans(),
                    'icon' => 'mention'
                ],
                [
                    'id' => 2,
                    'type' => 'analysis',
                    'title' => 'Domain analysis completed',
                    'description' => 'AI analysis finished for your company website',
                    'time' => now()->subHours(2)->diffForHumans(),
                    'icon' => 'analysis'
                ],
                [
                    'id' => 3,
                    'type' => 'prompt',
                    'title' => 'New prompts generated',
                    'description' => '25 new prompts added to your monitor',
                    'time' => now()->subHours(4)->diffForHumans(),
                    'icon' => 'prompt'
                ]
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to get recent activity', ['error' => $e->getMessage()]);
            return [];
        }
    }
    
    private function getMonitorStatus($user): array
    {
        try {
            $status = [
                'active' => 0,
                'pending' => 0,
                'failed' => 0,
                'total' => 0
            ];
            
            if ($this->tableExists('monitors')) {
                $monitors = DB::table('monitors')
                    ->where('user_id', $user->id)
                    ->selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->get()
                    ->pluck('count', 'status')
                    ->toArray();
                
                $status['active'] = $monitors['active'] ?? 0;
                $status['pending'] = $monitors['pending'] ?? 0;
                $status['failed'] = $monitors['failed'] ?? 0;
                $status['total'] = array_sum($monitors);
            }
            
            return $status;
        } catch (\Exception $e) {
            \Log::error('Failed to get monitor status', ['error' => $e->getMessage()]);
            return ['active' => 0, 'pending' => 0, 'failed' => 0, 'total' => 0];
        }
    }
    
    private function getQueueStatus(): array
    {
        try {
            // This would integrate with your Redis queue status
            return [
                'domain_analysis' => ['pending' => 0, 'processing' => 0],
                'prompt_generation' => ['pending' => 0, 'processing' => 0],
                'monitor_setup' => ['pending' => 0, 'processing' => 0],
                'total_jobs' => 0
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to get queue status', ['error' => $e->getMessage()]);
            return [
                'domain_analysis' => ['pending' => 0, 'processing' => 0],
                'prompt_generation' => ['pending' => 0, 'processing' => 0],
                'monitor_setup' => ['pending' => 0, 'processing' => 0],
                'total_jobs' => 0
            ];
        }
    }
    
    private function tableExists($tableName): bool
    {
        try {
            return DB::getSchemaBuilder()->hasTable($tableName);
        } catch (\Exception $e) {
            return false;
        }
    }
}