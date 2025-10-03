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
                'modelUsage' => $this->getModelUsageData($user),
                'mentionedDomains' => $this->getTopCitedSources($user)
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to get chart data', ['error' => $e->getMessage()]);
            return [
                'timeline' => [],
                'modelUsage' => [],
                'mentionedDomains' => []
            ];
        }
    }

    private function getModelUsageData($user): array
    {
        try {
            // Default model colors
            $modelColors = [
                'gemini-2.5-flash' => '#3b82f6',
                'gemini-2.5-flash-preview-09-2025' => '#3b82f6',
                'gpt-oss-120b' => '#10b981',
                'llama-4-scout-17b-16e-instruct' => '#8B5CF6',
            ];

            $modelUsage = [];

            if ($this->tableExists('responses')) {
                // Get user's active monitor
                $monitor = DB::table('monitors')
                    ->where('user_id', $user->id)
                    ->where('status', 'active')
                    ->first();

                if ($monitor) {
                    // Get model usage from last 30 days
                    $usageData = DB::table('responses')
                        ->where('monitor_id', $monitor->id)
                        ->where('created_at', '>=', now()->subDays(30))
                        ->selectRaw('model_name, COUNT(*) as usage_count')
                        ->groupBy('model_name')
                        ->orderBy('usage_count', 'desc')
                        ->get();

                    foreach ($usageData as $usage) {
                        $modelUsage[] = [
                            'name' => $usage->model_name,
                            'value' => (int) $usage->usage_count,
                            'fill' => $modelColors[$usage->model_name] ?? '#6B7280',
                        ];
                    }
                }
            }

            // If no real data, return empty array (the component will handle this)
            if (empty($modelUsage)) {
                return [];
            }

            return $modelUsage;

        } catch (\Exception $e) {
            \Log::error('Failed to get model usage data', ['error' => $e->getMessage()]);
            return [];
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
        try {
            // Get real brands from database
            $brandNames = [];

            if ($this->tableExists('brands')) {
                $dbBrands = DB::table('brands')
                    ->orderBy('created_at', 'desc')
                    ->get();

                foreach ($dbBrands as $index => $brand) {
                    $brandNames[] = $brand->name;
                }
            }

            // If no brands found, return empty data
            if (empty($brandNames)) {
                return [];
            }

            // Create mock data with real brand names and fake visibility scores
            $data = [
                [
                    'date' => now()->subDays(6)->format('M j'),
                ],
                [
                    'date' => now()->subDays(5)->format('M j'),
                ],
                [
                    'date' => now()->subDays(4)->format('M j'),
                ],
                [
                    'date' => now()->subDays(3)->format('M j'),
                ],
                [
                    'date' => now()->subDays(2)->format('M j'),
                ],
                [
                    'date' => now()->subDays(1)->format('M j'),
                ],
                [
                    'date' => now()->format('M j'),
                ],
            ];

            // Generate fake visibility data for each brand across the timeline
            foreach ($brandNames as $brandIndex => $brandName) {
                $baseScore = max(20, 85 - ($brandIndex * 10));

                foreach ($data as $dateIndex => &$dateData) {
                    // Add some variation to make it look realistic
                    $variation = rand(-5, 5);
                    $score = max(10, min(95, $baseScore + $variation));
                    $dateData[$brandName] = round($score, 1);
                }
            }

            return $data;

        } catch (\Exception $e) {
            \Log::error('Failed to get brand visibility data', ['error' => $e->getMessage()]);
            return [];
        }
    }

    private function getTopBrands($user): array
    {
        try {
            // Get real brands from database
            $brands = [];

            if ($this->tableExists('brands')) {
                $dbBrands = DB::table('brands')
                    ->orderBy('created_at', 'desc')
                    ->get();

                // Define colors for brands
                $colors = ['bg-lime-500', 'bg-gray-500', 'bg-blue-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500'];

                foreach ($dbBrands as $index => $brand) {
                    $domain = null;
                    $favicon = null;

                    // Extract domain from website URL or use brand name
                    if (!empty($brand->website)) {
                        $website = $brand->website;

                        // Handle specific brand domains
                        $brandDomains = [
                            'NVIDIA' => 'nvidia.com',
                            'Graphcore' => 'graphcore.ai',
                            'Groq' => 'groq.com'
                        ];

                        if (isset($brandDomains[$brand->name])) {
                            $domain = $brandDomains[$brand->name];
                            $favicon = "https://www.google.com/s2/favicons?domain={$domain}&sz=256";
                        } else {
                            // Add https:// if missing for proper parsing
                            if (!preg_match('/^https?:\/\//', $website)) {
                                $website = 'https://' . $website;
                            }

                            $url = parse_url($website);
                            if (isset($url['host'])) {
                                $domain = $url['host'];
                                // Remove www. prefix if present
                                $domain = preg_replace('/^www\./', '', $domain);
                                $favicon = "https://www.google.com/s2/favicons?domain={$domain}&sz=256";
                            }
                        }
                    }

                    // Generate fake visibility score for now (decreasing order)
                    $visibilityScore = max(20, 85 - ($index * 10));

                    $brands[] = [
                        'name' => $brand->name,
                        'domain' => $domain ?: 'unknown.com',
                        'favicon' => $favicon,
                        'visibilityScore' => $visibilityScore,
                        'mentions' => 0, // No data collection yet
                        'color' => $colors[$index % count($colors)],
                    ];
                }
            }

            // If no brands found, return empty array
            if (empty($brands)) {
                return [];
            }

            return $brands;

        } catch (\Exception $e) {
            \Log::error('Failed to get top brands', ['error' => $e->getMessage()]);
            return [];
        }
    }

    private function getShareOfVoice($user): array
    {
        try {
            // Get user's monitors
            $monitorIds = [];
            if ($this->tableExists('monitors')) {
                $monitorIds = DB::table('monitors')
                    ->where('user_id', $user->id)
                    ->pluck('id')
                    ->toArray();
            }

            if (empty($monitorIds)) {
                return [
                    'ourBrand' => 0,
                    'otherBrands' => 100,
                    'trend' => 0,
                    'isPositive' => false,
                    'ourBrandMentions' => 0,
                    'totalMentions' => 0,
                ];
            }

            // Define time periods
            $currentPeriodStart = now()->subDays(7);
            $previousPeriodStart = now()->subDays(14);
            $previousPeriodEnd = now()->subDays(7);

            // Current period calculations
            $currentBrandMentions = 0;
            $currentCompetitorMentions = 0;

            if ($this->tableExists('responses')) {
                // Get brand mentions from current period - use brand_mentioned flag when count is 0
                $currentStats = DB::table('responses')
                    ->whereIn('monitor_id', $monitorIds)
                    ->where('created_at', '>=', $currentPeriodStart)
                    ->selectRaw('
                        SUM(CASE
                            WHEN COALESCE(brand_mention_count, 0) > 0 THEN brand_mention_count
                            WHEN brand_mentioned = true THEN 1
                            ELSE 0
                        END) as total_brand_mentions,
                        COUNT(*) as total_responses
                    ')
                    ->first();

                $currentBrandMentions = (int) ($currentStats->total_brand_mentions ?? 0);

                // Get competitor mentions from JSON field
                $responsesWithCompetitors = DB::table('responses')
                    ->whereIn('monitor_id', $monitorIds)
                    ->where('created_at', '>=', $currentPeriodStart)
                    ->whereNotNull('competitors_mentioned')
                    ->whereRaw("competitors_mentioned::text != 'null'")
                    ->pluck('competitors_mentioned');

                foreach ($responsesWithCompetitors as $competitorsJson) {
                    $competitors = json_decode($competitorsJson, true);
                    if (is_array($competitors)) {
                        $currentCompetitorMentions += count($competitors);
                    }
                }
            }

            // Previous period calculations for trend
            $previousBrandMentions = 0;
            $previousCompetitorMentions = 0;

            if ($this->tableExists('responses')) {
                $previousStats = DB::table('responses')
                    ->whereIn('monitor_id', $monitorIds)
                    ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
                    ->selectRaw('
                        SUM(CASE
                            WHEN COALESCE(brand_mention_count, 0) > 0 THEN brand_mention_count
                            WHEN brand_mentioned = true THEN 1
                            ELSE 0
                        END) as total_brand_mentions,
                        COUNT(*) as total_responses
                    ')
                    ->first();

                $previousBrandMentions = (int) ($previousStats->total_brand_mentions ?? 0);

                // Get competitor mentions from previous period
                $previousResponsesWithCompetitors = DB::table('responses')
                    ->whereIn('monitor_id', $monitorIds)
                    ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
                    ->whereNotNull('competitors_mentioned')
                    ->whereRaw("competitors_mentioned::text != 'null'")
                    ->pluck('competitors_mentioned');

                foreach ($previousResponsesWithCompetitors as $competitorsJson) {
                    $competitors = json_decode($competitorsJson, true);
                    if (is_array($competitors)) {
                        $previousCompetitorMentions += count($competitors);
                    }
                }
            }

            // Calculate totals
            $currentTotalMentions = $currentBrandMentions + $currentCompetitorMentions;
            $previousTotalMentions = $previousBrandMentions + $previousCompetitorMentions;

            // Calculate share of voice percentages
            $ourBrandShare = 0;
            $otherBrandsShare = 100;

            if ($currentTotalMentions > 0) {
                $ourBrandShare = round(($currentBrandMentions / $currentTotalMentions) * 100, 1);
                $otherBrandsShare = round(100 - $ourBrandShare, 1);
            }

            // Calculate trend
            $trend = 0;
            $isPositive = false;

            if ($previousTotalMentions > 0) {
                $previousShare = ($previousBrandMentions / $previousTotalMentions) * 100;
                $trend = round($ourBrandShare - $previousShare, 1);
                $isPositive = $trend > 0;
            }

            return [
                'ourBrand' => $ourBrandShare,
                'otherBrands' => $otherBrandsShare,
                'trend' => abs($trend),
                'isPositive' => $isPositive,
                'ourBrandMentions' => $currentBrandMentions,
                'totalMentions' => $currentTotalMentions,
            ];

        } catch (\Exception $e) {
            \Log::error('Failed to calculate Share of Voice', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return [
                'ourBrand' => 0,
                'otherBrands' => 100,
                'trend' => 0,
                'isPositive' => false,
                'ourBrandMentions' => 0,
                'totalMentions' => 0,
            ];
        }
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

        // Model display name mapping (friendly name => model ID)
        $modelDisplayNames = [
            'Gemini 2.5 Flash' => 'gemini-2.5-flash-preview-09-2025',
            'GPT-OSS 120B' => 'gpt-oss-120b',
            'Llama 4 Scout' => 'llama-4-scout-17b-16e-instruct',
        ];

        $mentions = [];

        if ($this->tableExists('responses')) {
            // Get mentions from last 7 days for comparison
            $currentPeriodStart = now()->subDays(7);
            $previousPeriodStart = now()->subDays(14);
            $previousPeriodEnd = now()->subDays(7);

            // Always show all configured models, regardless of response count
            $configuredModels = array_values($modelDisplayNames);

            // Get actual models from database (to see which ones have responses)
            $actualModels = DB::table('responses')
                ->where('monitor_id', $monitor->id)
                ->where('created_at', '>=', $currentPeriodStart)
                ->distinct()
                ->pluck('model_name')
                ->toArray();

            // Combine configured models with actual ones (to show all configured models + any unexpected ones)
            // But prioritize configured models order
            $allModels = $configuredModels;

            // Add any actual models that aren't in the configured list
            foreach ($actualModels as $actualModel) {
                if (!in_array($actualModel, $configuredModels)) {
                    $allModels[] = $actualModel;
                }
            }

            foreach ($allModels as $modelId) {
                // Current period count
                $currentCount = DB::table('responses')
                    ->where('monitor_id', $monitor->id)
                    ->where('model_name', $modelId)
                    ->where('created_at', '>=', $currentPeriodStart)
                    ->count();

                // Previous period count for trend calculation
                $previousCount = DB::table('responses')
                    ->where('monitor_id', $monitor->id)
                    ->where('model_name', $modelId)
                    ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
                    ->count();

                // Calculate percentage change
                $changePercent = 0;
                $isPositive = false;
                if ($previousCount > 0) {
                    $changePercent = round((($currentCount - $previousCount) / $previousCount) * 100, 1);
                    $isPositive = $changePercent > 0;
                }

                // Find the friendly name for this model ID
                $friendlyName = array_search($modelId, $modelDisplayNames) ?: $modelId;

                $mentions[] = [
                    'model' => $friendlyName, // Display friendly name
                    'modelId' => $modelId, // Store model ID for hover
                    'domain' => $this->getModelDomain($modelId),
                    'favicon' => $this->getModelFavicon($modelId),
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
        // Use the same model display mapping as getModelMentions
        $modelDisplayNames = [
            'Gemini 2.5 Flash' => 'gemini-2.5-flash-preview-09-2025',
            'GPT-OSS 120B' => 'gpt-oss-120b',
            'Llama 4 Scout' => 'llama-4-scout-17b-16e-instruct',
        ];

        $mentions = [];
        foreach ($modelDisplayNames as $friendlyName => $modelId) {
            $mentions[] = [
                'model' => $friendlyName, // Display friendly name
                'modelId' => $modelId, // Store model ID for hover
                'domain' => $this->getModelDomain($modelId),
                'favicon' => $this->getModelFavicon($modelId),
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
            'gemini-2.5-flash-preview-09-2025' => 'google.com',
            'gpt-oss-120b' => 'openai.com',
            'llama-4-scout-17b-16e-instruct' => 'meta.ai',
        ];

        return $domains[$modelName] ?? 'unknown.com';
    }

    private function getModelFavicon($modelName): string
    {
        $domain = $this->getModelDomain($modelName);
        return "https://www.google.com/s2/favicons?domain={$domain}&sz=256";
    }

    private function getTopCitedSources($user): array
    {
        try {
            if (!$this->tableExists('responses')) {
                return [];
            }

            // Get responses with citation data for the user
            $responses = DB::table('responses')
                ->join('prompts', 'responses.prompt_id', '=', 'prompts.id')
                ->join('monitors', 'prompts.monitor_id', '=', 'monitors.id')
                ->where('monitors.user_id', $user->id)
                ->whereNotNull('responses.citation_sources')
                ->whereRaw("responses.citation_sources::text != 'null'")
                ->select('responses.citation_sources')
                ->get();

            if ($responses->isEmpty()) {
                return [];
            }

            $domainCounts = [];
            $totalCitations = 0;

            // Process each response and extract domains from citation sources
            foreach ($responses as $response) {
                $citationData = json_decode($response->citation_sources, true);

                // Handle both direct array and nested structure
                $sources = [];
                if (isset($citationData['sources']) && is_array($citationData['sources'])) {
                    $sources = $citationData['sources'];
                } elseif (is_array($citationData) && !isset($citationData['sources'])) {
                    // Direct array structure (as in our case)
                    $sources = $citationData;
                }

                foreach ($sources as $source) {
                    $domain = null;

                    if (isset($source['url'])) {
                        $url = $source['url'];

                        // Check if this is a Vertex AI redirect URL
                        if (strpos($url, 'vertexaisearch.cloud.google.com') !== false) {
                            // Use the title as the domain for Vertex AI citations
                            if (isset($source['title']) && !empty($source['title'])) {
                                $domain = $source['title'];
                            }
                        } else {
                            // Extract domain from regular URL
                            $domain = parse_url($url, PHP_URL_HOST);
                        }
                    }

                    if ($domain && !empty($domain)) {
                        // Remove 'www.' prefix if present and not a title-based domain
                        if (strpos($domain, '.') !== false && !filter_var($domain, FILTER_VALIDATE_URL)) {
                            $domain = preg_replace('/^www\./', '', $domain);
                        }

                        $domainCounts[$domain] = ($domainCounts[$domain] ?? 0) + 1;
                        $totalCitations++;
                    }
                }
            }

            if (empty($domainCounts) || $totalCitations === 0) {
                return [];
            }

            // Sort by count and take top 7
            arsort($domainCounts);
            $topDomains = array_slice($domainCounts, 0, 7, true);

            // Calculate percentages and format results
            $results = [];
            foreach ($topDomains as $domain => $count) {
                $percentage = round(($count / $totalCitations) * 100, 1);

                $results[] = [
                    'domain' => $domain,
                    'favicon' => "https://www.google.com/s2/favicons?domain={$domain}&size=64",
                    'count' => $count,
                    'percentage' => $percentage
                ];
            }

            // Sort results by count (descending) for final display
            usort($results, function($a, $b) {
                return $b['count'] - $a['count'];
            });

            return array_values($results);

        } catch (\Exception $e) {
            \Log::error('Failed to get top cited sources', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
}