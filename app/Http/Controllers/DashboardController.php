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

        // Check if onboarding is completed
        $onboardingProgress = $user->onboardingProgress;
        $onboardingCompleted = $onboardingProgress && $onboardingProgress->isCompleted();

        // Full page load - include all data
        return Inertia::render('dashboard', array_merge($baseData, [
            'monitors' => $this->getMonitorsData($user),
            'metrics' => $this->getMetricsData($user),
            'chartData' => $this->getChartData($user),
            'recentActivity' => $this->getRecentActivity($user),
            'monitorStatus' => $this->getMonitorStatus($user),
            'queueStatus' => $this->getQueueStatus(),
            'dashboardData' => [
                'aiPlatformVisitors' => $this->getAIPlatformVisitors($user),
                'brandVisibility' => $this->getBrandVisibilityData($user),
                'topBrands' => $this->getTopBrands($user),
                'shareOfVoice' => $this->getShareOfVoice($user),
                'visibilityScoreTimeline' => $this->getVisibilityScoreTimeline($user),
                'modelMentions' => $this->getModelMentions($user),
            ],
            'projectName' => $this->getProjectName($user),
            'onboardingCompleted' => $onboardingCompleted,
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
    
    private function getMonitorsData($user): array
    {
        try {
            if (!$this->tableExists('monitors')) {
                return [];
            }

            $monitors = DB::table('monitors')
                ->select([
                    'monitors.id',
                    'monitors.name',
                    'monitors.website_name',
                    'monitors.website_url',
                    'monitors.status',
                    'monitors.created_at',
                    'monitors.updated_at'
                ])
                ->where('monitors.user_id', $user->id)
                ->orderBy('monitors.created_at', 'desc')
                ->get()
                ->map(function ($monitor) {
                    // Get AI models for this monitor
                    $aiModels = [];
                    if ($this->tableExists('monitor_ai_models')) {
                        $aiModels = DB::table('monitor_ai_models')
                            ->select(['ai_model_id as id', 'ai_model_name as name', 'ai_model_icon as icon'])
                            ->where('monitor_id', $monitor->id)
                            ->get()
                            ->toArray();
                    }

                    // Get latest stats for this monitor
                    $latestStats = null;
                    if ($this->tableExists('monitor_stats')) {
                        $latestStats = DB::table('monitor_stats')
                            ->where('monitor_id', $monitor->id)
                            ->orderBy('date', 'desc')
                            ->first();
                    }

                    // Get chart data for the last 30 days
                    $chartData = $this->getChartDataForMonitor($monitor->id);

                    return [
                        'id' => $monitor->id,
                        'name' => $monitor->name,
                        'website' => [
                            'name' => $monitor->website_name,
                            'url' => $monitor->website_url
                        ],
                        'status' => $monitor->status,
                        'lastUpdated' => $this->formatLastUpdated($monitor->updated_at),
                        'createdAt' => $this->formatCreatedAt($monitor->created_at),
                        'stats' => [
                            'visibilityScore' => $latestStats->visibility_score ?? 0,
                            'totalPrompts' => $latestStats->total_prompts ?? 0,
                            'totalResponses' => $latestStats->total_responses ?? 0,
                            'mentions' => $latestStats->mentions ?? 0,
                            'avgCitationRank' => $latestStats->avg_citation_rank ?? 0,
                            'visibilityData' => $chartData['visibility'] ?? [],
                            'mentionsData' => $chartData['mentions'] ?? [],
                            'citationData' => $chartData['citation_rank'] ?? []
                        ],
                        'models' => $aiModels
                    ];
                });

            return $monitors->toArray();

        } catch (\Exception $e) {
            \Log::error('Failed to get monitors data', ['error' => $e->getMessage()]);
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
    
    private function getChartDataForMonitor($monitorId): array
    {
        $chartTypes = ['visibility', 'mentions', 'citation_rank'];
        $chartData = [];

        if (!$this->tableExists('monitor_chart_data')) {
            foreach ($chartTypes as $type) {
                $chartData[$type] = [];
            }
            return $chartData;
        }

        foreach ($chartTypes as $type) {
            $data = DB::table('monitor_chart_data')
                ->select(['date', 'value'])
                ->where('monitor_id', $monitorId)
                ->where('chart_type', $type)
                ->where('date', '>=', now()->subDays(30))
                ->orderBy('date', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'date' => date('M d', strtotime($item->date)),
                        'value' => (float) $item->value
                    ];
                })
                ->toArray();

            $chartData[$type] = $data;
        }

        return $chartData;
    }

    private function formatLastUpdated($timestamp): string
    {
        $diff = now()->diffInMinutes($timestamp);

        if ($diff < 60) {
            return $diff . ' minutes ago';
        } elseif ($diff < 1440) {
            return floor($diff / 60) . ' hours ago';
        } else {
            return floor($diff / 1440) . ' days ago';
        }
    }

    private function formatCreatedAt($timestamp): string
    {
        return date('M j, Y', strtotime($timestamp));
    }

    private function tableExists($tableName): bool
    {
        try {
            return DB::getSchemaBuilder()->hasTable($tableName);
        } catch (\Exception $e) {
            return false;
        }
    }

    private function getAIPlatformVisitors($user): array
    {
        // Mock data - replace with actual analytics when visitor tracking is implemented
        return [
            [
                'platform' => 'ChatGPT',
                'domain' => 'chatgpt.com',
                'favicon' => 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=256',
                'count' => 0,
                'changePercent' => 0,
                'isPositive' => false,
            ],
            [
                'platform' => 'Claude',
                'domain' => 'claude.ai',
                'favicon' => 'https://www.google.com/s2/favicons?domain=claude.ai&sz=256',
                'count' => 0,
                'changePercent' => 0,
                'isPositive' => false,
            ],
            [
                'platform' => 'Microsoft Copilot',
                'domain' => 'copilot.microsoft.com',
                'favicon' => 'https://www.google.com/s2/favicons?domain=copilot.microsoft.com&sz=256',
                'count' => 0,
                'changePercent' => 0,
                'isPositive' => false,
            ],
            [
                'platform' => 'Gemini',
                'domain' => 'gemini.google.com',
                'favicon' => 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=256',
                'count' => 0,
                'changePercent' => 0,
                'isPositive' => false,
            ],
            [
                'platform' => 'Perplexity',
                'domain' => 'perplexity.ai',
                'favicon' => 'https://www.google.com/s2/favicons?domain=perplexity.ai&sz=256',
                'count' => 0,
                'changePercent' => 0,
                'isPositive' => false,
            ],
        ];
    }

    private function getBrandVisibilityData($user): array
    {
        // Mock data showing brand visibility trends
        return [
            [
                'date' => '30 Sep',
                'Wix' => 80.8,
                'Squarespace' => 76.2,
                'Pay Boy' => 63.8,
                'Shopify' => 61.5,
                'Webflow' => 59.4,
                'Weebly' => 56.1,
                'WordPress.org' => 58.6,
            ],
        ];
    }

    private function getTopBrands($user): array
    {
        // Mock data showing top brands by visibility
        return [
            [
                'name' => 'Wix',
                'domain' => 'wix.com',
                'favicon' => 'https://www.google.com/s2/favicons?domain=wix.com&sz=256',
                'visibilityScore' => 80.8,
                'mentions' => 44,
                'color' => 'bg-lime-500',
            ],
            [
                'name' => 'Squarespace',
                'domain' => 'squarespace.com',
                'favicon' => 'https://www.google.com/s2/favicons?domain=squarespace.com&sz=256',
                'visibilityScore' => 76.2,
                'mentions' => 45,
                'color' => 'bg-gray-500',
            ],
            [
                'name' => 'Pay Boy',
                'domain' => 'payboy.sg',
                'favicon' => null,
                'visibilityScore' => 63.8,
                'mentions' => 33,
                'color' => 'bg-blue-500',
            ],
            [
                'name' => 'Shopify',
                'domain' => 'shopify.com',
                'favicon' => 'https://www.google.com/s2/favicons?domain=shopify.com&sz=256',
                'visibilityScore' => 61.5,
                'mentions' => 28,
                'color' => 'bg-amber-500',
            ],
            [
                'name' => 'Webflow',
                'domain' => 'webflow.com',
                'favicon' => 'https://www.google.com/s2/favicons?domain=webflow.com&sz=256',
                'visibilityScore' => 59.4,
                'mentions' => 26,
                'color' => 'bg-cyan-500',
            ],
        ];
    }

    private function getShareOfVoice($user): array
    {
        // Mock data showing share of voice
        return [
            'ourBrand' => 48,
            'otherBrands' => 52,
            'trend' => 48,
            'isPositive' => true,
        ];
    }

    private function getVisibilityScoreTimeline($user): array
    {
        // Mock data showing visibility score over time
        $dates = ['26 Sep', '27 Sep', '28 Sep', '29 Sep', '30 Sep', '01 Oct', '02 Oct'];
        $data = [];

        foreach ($dates as $index => $date) {
            $data[] = [
                'date' => $date,
                'visibilityScore' => $index === 4 ? 30.5 : 0, // Only 30 Sep has data
                'responses' => $index === 4 ? 69 : 0,
            ];
        }

        return $data;
    }

    private function getProjectName($user): string
    {
        try {
            // Try to get company name from onboarding progress first
            if ($this->tableExists('onboarding_progress')) {
                $onboardingProgress = DB::table('onboarding_progress')
                    ->where('user_id', $user->id)
                    ->first();

                if ($onboardingProgress && !empty($onboardingProgress->company_name)) {
                    return $onboardingProgress->company_name;
                }
            }

            // Fallback: try to get from the first monitor
            if ($this->tableExists('monitors')) {
                $firstMonitor = DB::table('monitors')
                    ->where('user_id', $user->id)
                    ->first();

                if ($firstMonitor && !empty($firstMonitor->name)) {
                    return $firstMonitor->name;
                }
            }

            // Final fallback: use user's name or a generic placeholder
            return $user->name ?? 'Your Project';

        } catch (\Exception $e) {
            \Log::error('Failed to get project name', ['error' => $e->getMessage()]);
            return 'Your Project';
        }
    }

    private function getModelMentions($user): array
    {
        // Get the user's monitor
        $monitor = DB::table('monitors')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (!$monitor) {
            return $this->getEmptyModelMentions();
        }

        // Define the target models we want to track
        $targetModels = [
            'Google AI Overview',
            'Llama 4 Scout',
            'OpenAI GPT OSS',
            'Qwen 3 235B Thinking',
        ];

        $mentions = [];

        if ($this->tableExists('mentions')) {
            // Get mentions from last 7 days for comparison
            $currentPeriodStart = now()->subDays(7);
            $previousPeriodStart = now()->subDays(14);
            $previousPeriodEnd = now()->subDays(7);

            foreach ($targetModels as $modelName) {
                // Current period count
                $currentCount = DB::table('mentions')
                    ->where('monitor_id', $monitor->id)
                    ->where('model_name', 'LIKE', "%{$modelName}%")
                    ->where('created_at', '>=', $currentPeriodStart)
                    ->count();

                // Previous period count for trend calculation
                $previousCount = DB::table('mentions')
                    ->where('monitor_id', $monitor->id)
                    ->where('model_name', 'LIKE', "%{$modelName}%")
                    ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
                    ->count();

                // Calculate percentage change
                $changePercent = 0;
                $isPositive = false;
                if ($previousCount > 0) {
                    $changePercent = round((($currentCount - $previousCount) / $previousCount) * 100, 1);
                    $isPositive = $changePercent > 0;
                }

                $mentions[] = [
                    'model' => $modelName,
                    'domain' => $this->getModelDomain($modelName),
                    'favicon' => $this->getModelFavicon($modelName),
                    'count' => $currentCount,
                    'changePercent' => abs($changePercent),
                    'isPositive' => $isPositive,
                ];
            }
        } else {
            return $this->getEmptyModelMentions();
        }

        return $mentions;
    }

    private function getEmptyModelMentions(): array
    {
        $targetModels = [
            'Google AI Overview',
            'Llama 4 Scout',
            'OpenAI GPT OSS',
            'Qwen 3 235B Thinking',
        ];

        $mentions = [];
        foreach ($targetModels as $modelName) {
            $mentions[] = [
                'model' => $modelName,
                'domain' => $this->getModelDomain($modelName),
                'favicon' => $this->getModelFavicon($modelName),
                'count' => 0,
                'changePercent' => 0,
                'isPositive' => false,
            ];
        }

        return $mentions;
    }

    private function getModelDomain($modelName): string
    {
        $domains = [
            'Google AI Overview' => 'google.com',
            'Llama 4 Scout' => 'meta.ai',
            'OpenAI GPT OSS' => 'openai.com',
            'Qwen 3 235B Thinking' => 'qwenlm.ai',
        ];

        return $domains[$modelName] ?? 'unknown.com';
    }

    private function getModelFavicon($modelName): string
    {
        $domain = $this->getModelDomain($modelName);
        return "https://www.google.com/s2/favicons?domain={$domain}&sz=256";
    }
}