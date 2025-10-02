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
            'ai_models.*' => 'string|in:chatgpt-search,gemini-2-flash,mistral-small'
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
            $aiModels = $validated['ai_models'] ?? ['chatgpt-search', 'gemini-2-flash', 'mistral-small'];
            $aiModelData = [
                'chatgpt-search' => ['name' => 'ChatGPT Search', 'icon' => '/llm-icons/openai.svg'],
                'gemini-2-flash' => ['name' => 'Gemini 2.0 Flash', 'icon' => '/llm-icons/gemini.svg'],
                'mistral-small' => ['name' => 'Mistral Small', 'icon' => '/llm-icons/mistral.svg']
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
            'monitor' => $monitorData
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
                    ['id' => 'mistral-small', 'name' => 'Mistral Small', 'icon' => '/llm-icons/mistral.svg']
                ],
                'isPending' => true // Special flag to indicate this is a fallback
            ];

            return [$fallbackMonitor];

        } catch (\Exception $e) {
            return [];
        }
    }
}
