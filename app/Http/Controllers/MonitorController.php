<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\OnboardingProgress;

class MonitorController extends Controller
{
    /**
     * Safely format a date value to ISO string
     */
    private function safeFormatDate($dateValue): string
    {
        if (empty($dateValue)) {
            return now()->toISOString();
        }

        // If it's already a string, try to parse it
        if (is_string($dateValue)) {
            try {
                return \Carbon\Carbon::parse($dateValue)->toISOString();
            } catch (\Exception $e) {
                return now()->toISOString();
            }
        }

        // If it's an object with format method (like Carbon instance)
        if (is_object($dateValue) && method_exists($dateValue, 'toISOString')) {
            try {
                return $dateValue->toISOString();
            } catch (\Exception $e) {
                return now()->toISOString();
            }
        }

        // Fallback to current time
        return now()->toISOString();
    }

    /**
     * Display a listing of monitors for the authenticated user.
     */
    public function index()
    {
        $userId = Auth::id();

        // Check if monitors table exists (for production safety)
        if (!$this->tableExists('monitors')) {
            // Show onboarding fallback if no monitors table exists
            return Inertia::render('monitors', [
                'monitors' => $this->getOnboardingFallbackMonitors($userId)
            ]);
        }

        // Get monitors directly (no caching)
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
                ->where('monitors.user_id', $userId)
                ->orderBy('monitors.created_at', 'desc')
                ->get()
                ->map(function ($monitor) {
                    // Get AI models for this monitor directly (no caching)
                    $aiModels = [];
                    if ($this->tableExists('monitor_ai_models')) {
                        $aiModels = DB::table('monitor_ai_models')
                            ->select(['ai_model_id as id', 'ai_model_name as name', 'ai_model_icon as icon'])
                            ->where('monitor_id', $monitor->id)
                            ->get()
                            ->toArray();
                    }

                    // Get latest stats for this monitor directly (no caching)
                    $latestStats = null;
                    if ($this->tableExists('monitor_stats')) {
                        $latestStats = DB::table('monitor_stats')
                            ->where('monitor_id', $monitor->id)
                            ->orderBy('date', 'desc')
                            ->first();
                    }

                    // Get chart data for the last 30 days directly (no caching)
                    $chartData = $this->getChartData($monitor->id);

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

        // If no monitors exist, try to show onboarding fallback
        if ($monitors->isEmpty()) {
            $fallbackMonitors = $this->getOnboardingFallbackMonitors($userId);
            if (!empty($fallbackMonitors)) {
                return Inertia::render('monitors', [
                    'monitors' => $fallbackMonitors
                ]);
            }
        }

        return Inertia::render('monitors', [
            'monitors' => $monitors
        ]);
    }

    /**
     * Show the form for creating a new monitor.
     */
    public function create()
    {
        return Inertia::render('monitors/create');
    }

    /**
     * Store a newly created monitor in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'website_name' => 'required|string|max:255',
            'website_url' => 'required|url|max:255',
            'description' => 'nullable|string|max:1000',
            'ai_models' => 'nullable|array',
            'ai_models.*' => 'string|in:chatgpt-search,gemini-2-flash,mistral-small,llama-4-scout'
        ]);

        $userId = Auth::id();

        try {
            // Create the monitor
            $monitorId = DB::table('monitors')->insertGetId([
                'user_id' => $userId,
                'name' => $validated['name'],
                'website_name' => $validated['website_name'],
                'website_url' => $validated['website_url'],
                'status' => 'active',
                'description' => $validated['description'] ?? 'Brand monitor for ' . $validated['website_name'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Add selected AI models or default ones
            $aiModels = $validated['ai_models'] ?? ['chatgpt-search', 'gemini-2-flash', 'mistral-small', 'llama-4-scout'];
            $aiModelData = [
                'chatgpt-search' => ['name' => 'ChatGPT Search', 'icon' => '/llm-icons/openai.svg'],
                'gemini-2-flash' => ['name' => 'Gemini 2.0 Flash', 'icon' => '/llm-icons/gemini.svg'],
                'mistral-small' => ['name' => 'Mistral Small', 'icon' => '/llm-icons/mistral.svg'],
                'llama-4-scout' => ['name' => 'Llama 4 Scout', 'icon' => 'https://www.google.com/s2/favicons?domain=meta.ai&sz=256']
            ];

            foreach ($aiModels as $modelId) {
                if (isset($aiModelData[$modelId])) {
                    DB::table('monitor_ai_models')->insert([
                        'monitor_id' => $monitorId,
                        'ai_model_id' => $modelId,
                        'ai_model_name' => $aiModelData[$modelId]['name'],
                        'ai_model_icon' => $aiModelData[$modelId]['icon'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Create initial stats entry
            DB::table('monitor_stats')->insert([
                'monitor_id' => $monitorId,
                'date' => now()->toDateString(),
                'visibility_score' => 0,
                'total_prompts' => 0,
                'total_responses' => 0,
                'mentions' => 0,
                'avg_citation_rank' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return redirect()->route('monitors')->with('success', 'Monitor created successfully!');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to create monitor. Please try again.']);
        }
    }

    /**
     * Display the specified monitor.
     */
    public function show($id)
    {
        $userId = Auth::id();
        
        // Check if monitors table exists
        if (!$this->tableExists('monitors')) {
            abort(404);
        }
        
        // Get monitor details
        $monitor = DB::table('monitors')
            ->where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (!$monitor) {
            abort(404);
        }

        // Get AI models
        $aiModels = [];
        if ($this->tableExists('monitor_ai_models')) {
            $aiModels = DB::table('monitor_ai_models')
                ->select(['ai_model_id as id', 'ai_model_name as name', 'ai_model_icon as icon'])
                ->where('monitor_id', $id)
                ->get()
                ->toArray();
        }

        // Get latest stats
        $latestStats = null;
        if ($this->tableExists('monitor_stats')) {
            $latestStats = DB::table('monitor_stats')
                ->where('monitor_id', $id)
                ->orderBy('date', 'desc')
                ->first();
        }

        // Get chart data
        $chartData = $this->getChartData($id);

        // Get prompts for this monitor with response data
        $prompts = [];
        if ($this->tableExists('prompts')) {
            $promptsQuery = DB::table('prompts')
                ->where('monitor_id', $id)
                ->select(
                    'id',
                    'text',
                    'type',
                    'intent',
                    'language_code',
                    'language_name',
                    'language_flag',
                    'visibility_percentage',
                    'response_count',
                    'created_at',
                    'updated_at'
                )
                ->orderBy('created_at', 'desc')
                ->get();

            foreach ($promptsQuery as $prompt) {
                // Get responses for this prompt
                $responses = [];
                if ($this->tableExists('responses')) {
                    $responses = DB::table('responses')
                        ->where('prompt_id', $prompt->id)
                        ->select(
                            'id',
                            'model_name',
                            'response_text',
                            'brand_mentioned',
                            'sentiment',
                            'visibility_score',
                            'competitors_mentioned',
                            'citation_sources',
                            'tokens_used',
                            'cost',
                            'created_at'
                        )
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->map(function ($response) use ($monitor) {
                            // Safe JSON parsing with fallbacks
                            $competitors = [];
                            $citations = [];

                            if ($response->competitors_mentioned) {
                                try {
                                    $competitors = json_decode($response->competitors_mentioned, true) ?? [];
                                } catch (Exception $e) {
                                    $competitors = [];
                                }
                            }

                            if ($response->citation_sources) {
                                try {
                                    $citations = json_decode($response->citation_sources, true) ?? [];
                                } catch (Exception $e) {
                                    $citations = [];
                                }
                            }

                            // Transform model name to display name
                            $modelId = $response->model_name ?? 'unknown';
                            $modelName = $response->model_name ?? 'Unknown Model';
                            $modelDisplayName = $modelName;
                            $modelIcon = "https://www.google.com/s2/favicons?domain=" . parse_url($monitor->website_url, PHP_URL_HOST) . "&sz=256";
                            $modelColor = "#3b82f6";

                            switch ($response->model_name) {
                                case 'gemini-2.5-flash-preview-09-2025':
                                case 'gemini-2.5-flash':
                                    $modelDisplayName = 'Gemini';
                                    $modelIcon = "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=256";
                                    $modelColor = "#4285f4";
                                    break;
                                case 'gpt-oss-120b':
                                    $modelDisplayName = 'GPT-OSS';
                                    $modelIcon = "https://www.google.com/s2/favicons?domain=cerebras.ai&sz=256";
                                    $modelColor = "#06b6d4";
                                    break;
                                case 'llama-4-scout-17b-16e-instruct':
                                    $modelDisplayName = 'Llama-4';
                                    $modelIcon = "https://www.google.com/s2/favicons?domain=meta.com&sz=256";
                                    $modelColor = "#8b5cf6";
                                    break;
                            }

                            // Create brand mentions array
                            $brandMentions = [];
                            if ($response->brand_mentioned) {
                                $brandMentions[] = [
                                    'brandName' => $monitor->name ?? 'Brand',
                                    'sentiment' => $response->sentiment ?? 'neutral',
                                    'mentioned' => true
                                ];
                            } else {
                                $brandMentions[] = [
                                    'brandName' => $monitor->name ?? 'Brand',
                                    'sentiment' => 'neutral',
                                    'mentioned' => false
                                ];
                            }

                            // Create competitor mentions array
                            $competitorMentions = [];
                            foreach ($competitors as $competitor) {
                                $competitorMentions[] = [
                                    'competitorName' => $competitor,
                                    'mentioned' => true
                                ];
                            }

                            // Create citations structure
                            $citationsData = null;
                            if (!empty($citations)) {
                                $citationSources = [];
                                $citationMapping = [];
                                $citationPositions = [];

                                foreach ($citations as $index => $citation) {
                                    if (is_string($citation)) {
                                        $citationSources[] = [
                                            'url' => $citation,
                                            'title' => 'Source ' . ($index + 1)
                                        ];
                                        $citationMapping[$citation] = $index;
                                    }
                                }

                                $citationsData = [
                                    'sources' => $citationSources,
                                    'mapping' => $citationMapping,
                                    'positions' => [],
                                    'count' => count($citationSources)
                                ];
                            }

                            return [
                                'id' => $response->id ?? 'N/A',
                                'text' => $response->response_text ?? 'No response text available',
                                'textWithCitations' => $response->response_text ?? 'No response text available',
                                'model' => [
                                    'id' => $modelId,
                                    'name' => $modelName,
                                    'displayName' => $modelDisplayName,
                                    'icon' => $modelIcon,
                                    'color' => $modelColor
                                ],
                                'visibility' => (float) ($response->visibility_score ?? 0.0),
                                'brandMentions' => $brandMentions,
                                'competitorMentions' => $competitorMentions,
                                'answered' => $response->created_at ?? now()->toISOString(),
                                'promptId' => $response->prompt_id,
                                'tokens' => (int) ($response->tokens_used ?? 0),
                                'cost' => (float) ($response->cost ?? 0.0),
                                'citations' => $citationsData
                            ];
                        });
                }

                // Calculate average visibility from responses
                $avgVisibility = 0.0;
                if ($responses->count() > 0) {
                    $totalVisibility = $responses->reduce(function ($sum, $response) {
                        return $sum + ($response['visibility_score'] ?? 0.0);
                    }, 0);
                    $avgVisibility = $totalVisibility / $responses->count();
                }

                // Extract unique model names and display names from responses
                $models = [];
                $modelDisplayNames = [];
                $modelStatus = [];

                foreach ($responses as $response) {
                    $modelName = $response['model_name'];
                    $modelDisplayName = $modelName;

                    // Convert model names to display names
                    switch ($modelName) {
                        case 'gemini-2.5-flash-preview-09-2025':
                        case 'gemini-2.5-flash':
                            $modelDisplayName = 'Gemini';
                            break;
                        case 'gpt-oss-120b':
                            $modelDisplayName = 'GPT-OSS';
                            break;
                        case 'llama-4-scout-17b-16e-instruct':
                            $modelDisplayName = 'Llama-4';
                            break;
                    }

                    if (!in_array($modelName, $models)) {
                        $models[] = $modelName;
                        $modelDisplayNames[] = $modelDisplayName;
                    }

                    // Build model status
                    if (!isset($modelStatus[$modelName])) {
                        $modelStatus[$modelName] = [
                            'has_response' => true,
                            'response_count' => 0,
                            'last_response' => null
                        ];
                    }
                    $modelStatus[$modelName]['response_count']++;

                    // Update last response if this one is more recent
                    $currentLast = $modelStatus[$modelName]['last_response'];
                    if ($currentLast === null || $response['created_at'] > $currentLast) {
                        $modelStatus[$modelName]['last_response'] = $response['created_at'];
                    }
                }

                $prompts[] = [
                    'id' => $prompt->id,
                    'text' => $prompt->text ?? 'Untitled Prompt',
                    'type' => $prompt->type ?? 'brand-specific',
                    'intent' => $prompt->intent ?? 'informational',
                    'responseCount' => $responses->count(),
                    'visibility' => $avgVisibility > 0 ? $avgVisibility : (float) ($prompt->visibility_percentage ?? 0.0),
                    'language' => [
                        'code' => $prompt->language_code ?? 'en',
                        'name' => $prompt->language_name ?? 'English',
                        'flag' => $prompt->language_flag ?? '🇺🇸'
                    ],
                    'monitor' => [
                        'id' => (int) $id,
                        'name' => $monitor->name ?? 'Unknown Monitor',
                        'website' => [
                            'name' => $monitor->website_name ?? 'Unknown Website',
                            'url' => $monitor->website_url ?? '#'
                        ]
                    ],
                    'responses' => $responses->toArray(),
                    'models' => $models,
                    'model_display_names' => $modelDisplayNames,
                    'modelStatus' => $modelStatus,
                    'created' => $this->safeFormatDate($prompt->created_at),
                    'updated' => $this->safeFormatDate($prompt->updated_at)
                ];
            }
        }

        $monitorData = [
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

        return Inertia::render('monitors/show', [
            'id' => $id,
            'monitor' => $monitorData,
            'prompts' => $prompts
        ]);
    }

    /**
     * Get chart data for a monitor
     */
    private function getChartData($monitorId)
    {
        $chartTypes = ['visibility', 'mentions', 'citation_rank'];
        $chartData = [];

        // Check if chart data table exists
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

    /**
     * Check if a database table exists
     */
    private function tableExists($tableName)
    {
        try {
            return DB::getSchemaBuilder()->hasTable($tableName);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Format last updated time
     */
    private function formatLastUpdated($timestamp)
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

    /**
     * Format created at date
     */
    private function formatCreatedAt($timestamp)
    {
        return date('M j, Y', strtotime($timestamp));
    }

    /**
     * Get fallback monitors from onboarding data when monitor tables don't exist
     */
    private function getOnboardingFallbackMonitors($userId)
    {
        try {
            // Get completed onboarding progress
            $onboardingProgress = OnboardingProgress::where('user_id', $userId)
                ->whereNotNull('completed_at')
                ->first();

            if (!$onboardingProgress || !$onboardingProgress->company_name || !$onboardingProgress->company_website) {
                return [];
            }

            // Create a fallback monitor from onboarding data
            $fallbackMonitor = [
                'id' => 'onboarding-fallback',
                'name' => $onboardingProgress->company_name . ' Brand Monitor',
                'website' => [
                    'name' => $onboardingProgress->company_name,
                    'url' => $onboardingProgress->company_website
                ],
                'status' => 'pending',
                'lastUpdated' => 'Setting up...',
                'createdAt' => $this->formatCreatedAt($onboardingProgress->completed_at),
                'stats' => [
                    'visibilityScore' => 0,
                    'totalPrompts' => 0,
                    'totalResponses' => 0,
                    'mentions' => 0,
                    'avgCitationRank' => 0,
                    'visibilityData' => [],
                    'mentionsData' => [],
                    'citationData' => []
                ],
                'models' => [
                    ['id' => 'chatgpt-search', 'name' => 'ChatGPT Search', 'icon' => '/llm-icons/openai.svg'],
                    ['id' => 'gemini-2-flash', 'name' => 'Gemini 2.0 Flash', 'icon' => '/llm-icons/gemini.svg'],
                    ['id' => 'mistral-small', 'name' => 'Mistral Small', 'icon' => '/llm-icons/mistral.svg'],
                    ['id' => 'llama-4-scout', 'name' => 'Llama 4 Scout', 'icon' => 'https://www.google.com/s2/favicons?domain=meta.ai&sz=256']
                ],
                'isPending' => true // Special flag to indicate this is a fallback
            ];

            return [$fallbackMonitor];

        } catch (\Exception $e) {
            return [];
        }
    }
}
