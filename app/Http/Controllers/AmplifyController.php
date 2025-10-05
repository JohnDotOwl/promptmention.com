<?php

namespace App\Http\Controllers;

use App\Http\Requests\AmplifyChatRequest;
use App\Models\AmplifyConversation;
use App\Models\AmplifyMessage;
use App\Models\User;
use App\Services\BrandAssistantService;
use App\Services\CerebrasAIService;
use App\Services\SearchMCPService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AmplifyController extends Controller
{
    private BrandAssistantService $brandAssistantService;
    private CerebrasAIService $cerebrasService;
    private SearchMCPService $searchMCPService;

    public function __construct(
        BrandAssistantService $brandAssistantService,
        CerebrasAIService $cerebrasService,
        SearchMCPService $searchMCPService
    ) {
        $this->brandAssistantService = $brandAssistantService;
        $this->cerebrasService = $cerebrasService;
        $this->searchMCPService = $searchMCPService;
    }

    /**
     * Display the Amplify AI assistant page
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Get user's brand monitoring data for context
        $brandContext = $this->getBrandContext($user);

        // Get recent conversation history if it exists
        $conversationHistory = $this->getConversationHistory($user);

        // Get suggested prompts based on user data
        $suggestedPrompts = $this->getSuggestedPrompts($user, $brandContext);

        // Get available AI models and user's preferences
        $availableModels = $this->getAvailableModels();
        $userPreferredModel = $user->preferred_ai_model ?? 'cerebras-gpt-oss-120b';
        $userSearchEnabled = $user->search_enabled ?? false;

        Log::info('Amplify page loaded', [
            'availableModels' => array_keys($availableModels),
            'userPreferredModel' => $userPreferredModel,
            'cerebrasAvailable' => $this->cerebrasService->isAvailable()
        ]);

        return Inertia::render('amplify', [
            'user' => $user,
            'brandContext' => $brandContext,
            'conversationHistory' => $conversationHistory,
            'suggestedPrompts' => $suggestedPrompts,
            'initialMessage' => $this->getInitialGreeting($user, $brandContext),
            'availableModels' => $availableModels,
            'userPreferredModel' => $userPreferredModel,
            'userSearchEnabled' => $userSearchEnabled,
        ]);
    }

    /**
     * Get brand context data for the AI assistant
     */
    private function getBrandContext($user): array
    {
        $context = [
            'brandName' => null,
            'website' => null,
            'industry' => null,
            'totalMentions' => 0,
            'visibilityScore' => 0,
            'hasData' => false,
            'competitors' => [],
            'recentActivity' => false,
            'userId' => $user->id,
        ];

        try {
            // Get project/brand name and industry
            if ($this->tableExists('onboarding_progress')) {
                $onboarding = DB::table('onboarding_progress')
                    ->where('user_id', $user->id)
                    ->first();

                if ($onboarding) {
                    $context['brandName'] = $onboarding->company_name;
                    $context['website'] = $onboarding->company_website;
                    $context['industry'] = $onboarding->industry;
                }
            }

            // Get monitor data
            if ($this->tableExists('monitors')) {
                $monitor = DB::table('monitors')
                    ->where('user_id', $user->id)
                    ->where('status', 'active')
                    ->first();

                if ($monitor) {
                    $context['brandName'] = $context['brandName'] ?: $monitor->name;
                    $context['website'] = $context['website'] ?: $monitor->website_url;
                    $context['industry'] = $context['industry'] ?: $monitor->industry;
                }
            }

            // Get mention statistics
            if ($this->tableExists('responses')) {
                $monitorIds = DB::table('monitors')
                    ->where('user_id', $user->id)
                    ->pluck('id')
                    ->toArray();

                if (!empty($monitorIds)) {
                    // Get mentions from last 7 days
                    $weekAgo = now()->subDays(7);

                    $stats = DB::table('responses')
                        ->whereIn('monitor_id', $monitorIds)
                        ->where('created_at', '>=', $weekAgo)
                        ->selectRaw('
                            SUM(CASE
                                WHEN COALESCE(brand_mention_count, 0) > 0 THEN brand_mention_count
                                WHEN brand_mentioned = true THEN 1
                                ELSE 0
                            END) as total_mentions,
                            COUNT(*) as total_responses
                        ')
                        ->first();

                    $context['totalMentions'] = (int) ($stats->total_mentions ?? 0);
                    $context['hasData'] = $context['totalMentions'] > 0;
                    $context['recentActivity'] = $stats->total_responses > 0;
                }
            }

            // Get competitor data
            if ($this->tableExists('brands')) {
                $competitors = DB::table('brands')
                    ->whereNot('name', $context['brandName'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(['name', 'industry']);

                $context['competitors'] = $competitors->toArray();
            }

        } catch (\Exception $e) {
            \Log::error('Failed to get brand context for Amplify', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }

        return $context;
    }

    /**
     * Get conversation history for the user
     */
    private function getConversationHistory($user): array
    {
        // For now, return empty history
        // This will be implemented when we create conversation tables
        return [
            'conversations' => [],
            'hasHistory' => false,
        ];
    }

    /**
     * Get suggested prompts based on user data
     */
    private function getSuggestedPrompts($user, $brandContext): array
    {
        $prompts = [
            'performance_analysis' => [
                'title' => 'Performance Analysis',
                'description' => 'Deep dive into your brand\'s mention trends and visibility metrics',
                'action' => 'Analyze Performance',
                'prompt' => $this->generatePerformancePrompt($brandContext),
                'variant' => $brandContext['hasData'] ? 'primary' : 'secondary',
                'data_driven' => $brandContext['hasData'],
                'data_insight' => $this->getPerformanceDataInsight($brandContext)
            ],
            'content_strategy' => [
                'title' => 'Content Strategy',
                'description' => 'Get AI-powered content ideas to boost your brand visibility',
                'action' => 'Suggest Content',
                'prompt' => $this->generateContentPrompt($brandContext),
                'variant' => 'secondary',
                'data_driven' => $brandContext['hasData'],
                'data_insight' => $this->getContentDataInsight($brandContext)
            ],
            'competitor_intelligence' => [
                'title' => 'Competitor Intelligence',
                'description' => 'Understand how competitors perform and find opportunities',
                'action' => 'Competitor Analysis',
                'prompt' => $this->generateCompetitorPrompt($brandContext),
                'variant' => 'secondary',
                'data_driven' => !empty($brandContext['competitors']),
                'data_insight' => $this->getCompetitorDataInsight($brandContext)
            ],
            'optimization_tips' => [
                'title' => 'Optimization Tips',
                'description' => 'Personalized recommendations to improve your AI visibility',
                'action' => 'Get Tips',
                'prompt' => $this->generateOptimizationPrompt($brandContext),
                'variant' => 'secondary',
                'data_driven' => $brandContext['hasData'],
                'data_insight' => $this->getOptimizationDataInsight($brandContext)
            ],
            'trend_search' => [
                'title' => 'Trend & News Search',
                'description' => 'Search for real-time industry trends, competitor news, and market developments',
                'action' => 'Search Trends',
                'prompt' => $this->generateTrendSearchPrompt($brandContext),
                'variant' => 'primary',
                'data_driven' => true,
                'data_insight' => $this->getTrendSearchDataInsight($brandContext)
            ]
        ];

        return $prompts;
    }

    /**
     * Generate personalized performance analysis prompt
     */
    private function generatePerformancePrompt($brandContext): string
    {
        $brandName = $brandContext['brandName'] ?? 'your brand';
        $mentions = $brandContext['totalMentions'];

        if (!$brandContext['hasData']) {
            return "How can we track and analyze {$brandName}'s performance across AI models?";
        }

        // Get week-over-week trend
        $trendData = $this->getWeeklyTrend($brandContext);
        $trendText = '';
        if ($trendData['hasTrend']) {
            $change = $trendData['change'];
            $direction = $change >= 0 ? 'increased' : 'decreased';
            $trendText = " mentions this week ({$direction} by " . abs($change) . "%)";
        } else {
            $trendText = " mentions this week";
        }

        return "How did {$brandName} achieve {$mentions}{$trendText}? What's driving our visibility trends?";
    }

    /**
     * Generate personalized content strategy prompt
     */
    private function generateContentPrompt($brandContext): string
    {
        $brandName = $brandContext['brandName'] ?? 'your brand';
        $industry = $this->getUserIndustry($brandContext);

        if (!$brandContext['hasData']) {
            if ($industry) {
                return "What content strategies are working well in the {$industry} industry that {$brandName} could leverage?";
            }
            return "What content themes and topics would help increase {$brandName}'s visibility across AI models?";
        }

        // Get top performing content themes if available
        $topThemes = $this->getTopContentThemes($brandContext);
        if (!empty($topThemes)) {
            $themeText = implode(', ', array_slice($topThemes, 0, 3));
            return "How can {$brandName} create more content around '{$themeText}' to maximize AI model mentions?";
        }

        if ($industry) {
            return "What content opportunities is {$brandName} missing in the {$industry} sector based on current trends?";
        }

        return "What content ideas would generate the most AI model mentions for {$brandName} right now?";
    }

    /**
     * Generate personalized competitor intelligence prompt
     */
    private function generateCompetitorPrompt($brandContext): string
    {
        $brandName = $brandContext['brandName'] ?? 'your brand';
        $competitors = $brandContext['competitors'] ?? [];

        if (empty($competitors)) {
            return "Who are {$brandName}'s main competitors and how can we analyze their performance?";
        }

        $competitorNames = array_map(function($comp) { return $comp->name; }, array_slice($competitors, 0, 3));
        $competitorsList = implode(', ', $competitorNames);

        if ($brandContext['hasData']) {
            return "How does {$brandName}'s performance compare against {$competitorsList} in AI model visibility and mentions?";
        }

        return "What strategies are {$competitorsList} using to increase their AI visibility that {$brandName} should know about?";
    }

    /**
     * Generate personalized optimization tips prompt
     */
    private function generateOptimizationPrompt($brandContext): string
    {
        $brandName = $brandContext['brandName'] ?? 'your brand';
        $mentions = $brandContext['totalMentions'];

        if (!$brandContext['hasData']) {
            return "What are the top 3 optimization strategies to help {$brandName} get mentioned more frequently by AI models?";
        }

        if ($mentions < 5) {
            return "How can {$brandName} break through the noise and consistently get mentioned by AI models?";
        } elseif ($mentions < 20) {
            return "What strategies will help {$brandName} scale from {$mentions} to 50+ weekly mentions across AI models?";
        } else {
            return "How can {$brandName} maintain and grow our strong performance of {$mentions} weekly mentions?";
        }
    }

    /**
     * Get week-over-week mention trend
     */
    private function getWeeklyTrend($brandContext): array
    {
        if (!isset($brandContext['userId'])) {
            return ['hasTrend' => false];
        }

        try {
            $userId = $brandContext['userId'];
            $monitorIds = DB::table('monitors')
                ->where('user_id', $userId)
                ->pluck('id')
                ->toArray();

            if (empty($monitorIds)) {
                return ['hasTrend' => false];
            }

            // Get current week and previous week mentions
            $currentWeek = now()->subDays(7);
            $previousWeek = now()->subDays(14);

            $currentWeekMentions = DB::table('responses')
                ->whereIn('monitor_id', $monitorIds)
                ->where('created_at', '>=', $currentWeek)
                ->whereRaw('(brand_mention_count > 0 OR brand_mentioned = true)')
                ->count();

            $previousWeekMentions = DB::table('responses')
                ->whereIn('monitor_id', $monitorIds)
                ->where('created_at', '>=', $previousWeek)
                ->where('created_at', '<', $currentWeek)
                ->whereRaw('(brand_mention_count > 0 OR brand_mentioned = true)')
                ->count();

            if ($previousWeekMentions == 0) {
                return ['hasTrend' => false];
            }

            $change = round((($currentWeekMentions - $previousWeekMentions) / $previousWeekMentions) * 100);

            return [
                'hasTrend' => true,
                'change' => $change,
                'current' => $currentWeekMentions,
                'previous' => $previousWeekMentions
            ];

        } catch (\Exception $e) {
            Log::error('Failed to calculate weekly trend', ['error' => $e->getMessage()]);
            return ['hasTrend' => false];
        }
    }

    /**
     * Get user's industry from onboarding or monitors
     */
    private function getUserIndustry($brandContext): ?string
    {
        // First try to get from brand context (populated in getBrandContext)
        if (!empty($brandContext['industry'])) {
            return $brandContext['industry'];
        }

        // If not in context, try to get directly from database
        try {
            $userId = $brandContext['userId'] ?? null;
            if (!$userId) {
                return null;
            }

            // Check onboarding_progress first
            $onboarding = DB::table('onboarding_progress')
                ->where('user_id', $userId)
                ->first();

            if ($onboarding && !empty($onboarding->industry)) {
                return $onboarding->industry;
            }

            // Check monitors table
            $monitor = DB::table('monitors')
                ->where('user_id', $userId)
                ->where('status', 'active')
                ->first();

            if ($monitor && !empty($monitor->industry)) {
                return $monitor->industry;
            }

        } catch (\Exception $e) {
            Log::error('Failed to get user industry', ['error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Get top performing content themes from response data
     */
    private function getTopContentThemes($brandContext): array
    {
        try {
            $userId = $brandContext['userId'];
            $monitorIds = DB::table('monitors')
                ->where('user_id', $userId)
                ->pluck('id')
                ->toArray();

            if (empty($monitorIds)) {
                return [];
            }

            // This is a simplified version - in reality, you'd analyze response_text
            // for recurring themes and topics that correlate with high visibility
            $themes = DB::table('responses')
                ->whereIn('monitor_id', $monitorIds)
                ->where('created_at', '>=', now()->subDays(30))
                ->whereRaw('(brand_mention_count > 0 OR brand_mentioned = true)')
                ->pluck('response_text')
                ->take(20)
                ->toArray();

            // Extract common keywords/themes (simplified)
            $commonWords = [];
            foreach ($themes as $theme) {
                $words = str_word_count(strtolower($theme), 1);
                foreach ($words as $word) {
                    if (strlen($word) > 4) { // Only words longer than 4 chars
                        $commonWords[$word] = ($commonWords[$word] ?? 0) + 1;
                    }
                }
            }

            arsort($commonWords);
            return array_keys(array_slice($commonWords, 0, 5, true));

        } catch (\Exception $e) {
            Log::error('Failed to get content themes', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get performance data insight for hover tooltip
     */
    private function getPerformanceDataInsight($brandContext): array
    {
        $insight = [
            'has_data' => $brandContext['hasData'],
            'metrics' => [],
            'message' => 'Performance data not available yet'
        ];

        if ($brandContext['hasData']) {
            $mentions = $brandContext['totalMentions'];
            $trend = $this->getWeeklyTrend($brandContext);

            $insight['metrics'][] = "Total mentions: {$mentions} this week";

            if ($trend['hasTrend']) {
                $direction = $trend['change'] >= 0 ? '📈' : '📉';
                $insight['metrics'][] = "{$direction} " . abs($trend['change']) . "% vs last week";
            }

            $insight['metrics'][] = "📊 Data from last 7 days";
            $insight['message'] = 'Performance tracking active';
        } else {
            $insight['metrics'][] = "🔍 Start monitoring to see insights";
            $insight['message'] = 'No performance data available';
        }

        return $insight;
    }

    /**
     * Get content strategy data insight for hover tooltip
     */
    private function getContentDataInsight($brandContext): array
    {
        $insight = [
            'has_data' => false,
            'metrics' => [],
            'message' => 'Content insights limited'
        ];

        $industry = $this->getUserIndustry($brandContext);
        if ($industry) {
            $insight['has_data'] = true;
            $insight['metrics'][] = "🏭 Industry: {$industry}";
            $insight['message'] = 'Industry-based content strategy';
        }

        if ($brandContext['hasData']) {
            $themes = $this->getTopContentThemes($brandContext);
            if (!empty($themes)) {
                $topThemes = implode(', ', array_slice($themes, 0, 3));
                $insight['has_data'] = true;
                $insight['metrics'][] = "🎯 Top themes: {$topThemes}";
                $insight['message'] = 'Content themes identified';
            }
        }

        if (!$insight['has_data']) {
            $insight['metrics'][] = "📝 Set up industry for better insights";
        }

        return $insight;
    }

    /**
     * Get competitor intelligence data insight for hover tooltip
     */
    private function getCompetitorDataInsight($brandContext): array
    {
        $insight = [
            'has_data' => false,
            'metrics' => [],
            'message' => 'Competitor data not available'
        ];

        $competitors = $brandContext['competitors'] ?? [];

        if (!empty($competitors)) {
            $competitorCount = count($competitors);
            $insight['has_data'] = true;
            $insight['metrics'][] = "👥 Competitors tracked: {$competitorCount}";

            $competitorNames = array_map(function($comp) { return $comp->name; }, array_slice($competitors, 0, 3));
            if (!empty($competitorNames)) {
                $namesList = implode(', ', $competitorNames);
                $insight['metrics'][] = "🎯 Tracking: {$namesList}";
            }

            $insight['message'] = 'Competitive analysis available';
        } else {
            $insight['metrics'][] = "🔍 Add competitors for analysis";
            $insight['message'] = 'No competitors configured';
        }

        return $insight;
    }

    /**
     * Get optimization tips data insight for hover tooltip
     */
    private function getOptimizationDataInsight($brandContext): array
    {
        $insight = [
            'has_data' => $brandContext['hasData'],
            'metrics' => [],
            'message' => 'Basic optimization tips'
        ];

        if ($brandContext['hasData']) {
            $mentions = $brandContext['totalMentions'];

            if ($mentions < 5) {
                $stage = "🌱 Emerging";
                $recommendation = "Focus on visibility foundation";
            } elseif ($mentions < 20) {
                $stage = "📈 Growing";
                $recommendation = "Scale mention strategies";
            } else {
                $stage = "🚀 Established";
                $recommendation = "Maintain growth momentum";
            }

            $insight['metrics'][] = "📊 Mentions: {$mentions}/week";
            $insight['metrics'][] = "{$stage} stage";
            $insight['metrics'][] = "💡 {$recommendation}";
            $insight['message'] = 'Scaling recommendations ready';
        } else {
            $insight['metrics'][] = "🎯 Start with basic visibility tactics";
            $insight['message'] = 'Foundation strategies available';
        }

        return $insight;
    }

    /**
     * Get initial greeting message
     */
    private function getInitialGreeting($user, $brandContext): string
    {
        $greeting = "Hi! I'm Amplify, your AI-powered brand growth assistant. ";

        if ($brandContext['brandName']) {
            $greeting .= "I'm here to help {$brandContext['brandName']} amplify its visibility across AI models. ";
        } else {
            $greeting .= "I'm here to help you amplify your brand's visibility across AI models. ";
        }

        if ($brandContext['hasData']) {
            $mentionCount = $brandContext['totalMentions'];
            $greeting .= "I can see you've received {$mentionCount} mentions this week. ";
        }

        $greeting .= "How can I help amplify your brand today?";

        return $greeting;
    }

    /**
     * Handle chat message
     */
    public function chat(Request $request)
    {
        $user = Auth::user();
        $message = $request->input('message');
        $conversationId = $request->input('conversation_id');
        $selectedModel = $request->input('model', $user->preferred_ai_model ?? 'cerebras-gpt-oss-120b');
        $searchEnabled = $request->input('search_enabled', $user->search_enabled ?? false);
        $useStreaming = $request->input('stream', false);
        $searchEnabled = $request->input('search_enabled', $user->search_enabled ?? false);

        if (!$message) {
            return response()->json(['error' => 'Message is required'], 422);
        }

        Log::info('chat request', [
            'selectedModel' => $selectedModel,
            'isAvailable' => $this->cerebrasService->isAvailable(),
            'useStreaming' => $useStreaming
        ]);

        try {
            // Get or create conversation
            $conversation = $this->getOrCreateConversation($user, $conversationId, $message);

            // Save user message
            AmplifyMessage::createUserMessage($conversation->id, $message);

            // Get brand context
            $brandContext = $this->getBrandContext($user);

            // Perform search if enabled by user
            $searchContext = '';
            if ($searchEnabled) {
                Log::info('Search enabled, performing MCP search', ['message' => $message]);
                $searchResults = $this->searchMCPService->performSearch($message, $brandContext);
                $searchContext = $this->searchMCPService->formatForAI($searchResults);

                // Add search context to brand context for AI processing
                $brandContext['searchContext'] = $searchContext;
                $brandContext['searchResults'] = $searchResults;
            }

            // Generate response based on selected model
            $aiResponse = $this->generateAIResponse($user, $selectedModel, $message, $brandContext);

            // Save AI response
            AmplifyMessage::createAssistantMessage(
                $conversation->id,
                $aiResponse['content'],
                $aiResponse['richData'] ?? null,
                $aiResponse['model'] ?? 'brand-assistant',
                $aiResponse['provider'] ?? 'brand-assistant'
            );

            // Update conversation timestamp
            $conversation->updateLastMessageTime();

            $response = [
                'success' => true,
                'response' => $aiResponse,
                'conversation_id' => $conversation->id,
                'model' => $selectedModel
            ];

            // Add search metadata if search was performed
            if (!empty($brandContext['searchResults'])) {
                $response['search_metadata'] = [
                    'performed' => true,
                    'query' => $brandContext['searchResults']['query'],
                    'total_results' => $brandContext['searchResults']['total_results'],
                    'sources' => $brandContext['searchResults']['sources'],
                    'search_time' => $brandContext['searchResults']['timestamp']
                ];
            }

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Failed to process Amplify chat message', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to process message. Please try again.',
                'success' => false
            ], 500);
        }
    }

    /**
     * Handle streaming chat message
     */
    public function chatStream(Request $request)
    {
        $user = Auth::user();
        $message = $request->input('message');
        $conversationId = $request->input('conversation_id');
        $selectedModel = $request->input('model', $user->preferred_ai_model ?? 'cerebras-gpt-oss-120b');
        $searchEnabled = $request->input('search_enabled', $user->search_enabled ?? false);

        if (!$message) {
            return response()->json(['error' => 'Message is required'], 422);
        }

        Log::info('chatStream request', [
            'selectedModel' => $selectedModel,
            'isAvailable' => $this->cerebrasService->isAvailable(),
            'modelMatch' => $selectedModel === 'cerebras-gpt-oss-120b',
            'cerebrasServiceClass' => get_class($this->cerebrasService),
            'cerebrasApiKeyExists' => !empty(env('CEREBRAS_API_KEY')),
            'cerebrasApiKeyLength' => strlen(env('CEREBRAS_API_KEY') ?? ''),
        ]);

        // Only allow streaming for Cerebras model
        if ($selectedModel !== 'cerebras-gpt-oss-120b' || !$this->cerebrasService->isAvailable()) {
            return response()->json([
                'error' => 'Streaming not available for selected model',
                'debug' => [
                    'selectedModel' => $selectedModel,
                    'expected' => 'cerebras-gpt-oss-120b',
                    'isAvailable' => $this->cerebrasService->isAvailable()
                ]
            ], 422);
        }

        try {
            // Get or create conversation
            $conversation = $this->getOrCreateConversation($user, $conversationId, $message);

            // Save user message
            AmplifyMessage::createUserMessage($conversation->id, $message);

            // Get brand context
            $brandContext = $this->getBrandContext($user);

            // Perform search if enabled by user
            if ($searchEnabled) {
                Log::info('Search enabled in streaming, performing MCP search', ['message' => $message]);
                $searchResults = $this->searchMCPService->performSearch($message, $brandContext);
                $searchContext = $this->searchMCPService->formatForAI($searchResults);

                // Add search context to brand context for AI processing
                $brandContext['searchContext'] = $searchContext;
                $brandContext['searchResults'] = $searchResults;
            }

            // Return streaming response
            return $this->cerebrasService->streamResponse($user, $message, $brandContext);

        } catch (\Exception $e) {
            Log::error('Failed to process Amplify streaming chat', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to start streaming. Please try again.',
                'success' => false
            ], 500);
        }
    }

    /**
     * Update user's search preference
     */
    public function updateSearchPreference(Request $request)
    {
        $user = Auth::user();
        $enabled = $request->input('enabled', false);

        // Save search preference to user profile
        $user->update(['search_enabled' => $enabled]);

        return response()->json([
            'success' => true,
            'search_enabled' => $enabled
        ]);
    }

    /**
     * Update user's preferred AI model
     */
    public function updateModelPreference(Request $request)
    {
        $user = Auth::user();
        $model = $request->input('model');

        if (!$model || !in_array($model, array_keys($this->getAvailableModels()))) {
            return response()->json(['error' => 'Invalid model selection'], 422);
        }

        $user->update(['preferred_ai_model' => $model]);

        return response()->json([
            'success' => true,
            'model' => $model
        ]);
    }

    /**
     * Get conversation history
     */
    public function getConversations(Request $request)
    {
        $user = Auth::user();

        $conversations = AmplifyConversation::where('user_id', $user->id)
            ->active()
            ->with(['latestMessage'])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) {
                $lastMessage = $conversation->latestMessage->content ?? 'No messages yet';

                // Truncate title to 30 characters and last message to 60 characters
                $title = strlen($conversation->title) > 30
                    ? substr($conversation->title, 0, 27) . '...'
                    : $conversation->title;

                $truncatedLastMessage = strlen($lastMessage) > 60
                    ? substr($lastMessage, 0, 57) . '...'
                    : $lastMessage;

                return [
                    'id' => $conversation->id,
                    'title' => $title,
                    'lastMessage' => $truncatedLastMessage,
                    'timestamp' => $conversation->last_message_at,
                    'unread' => false, // TODO: Implement read/unread functionality
                    'category' => $conversation->category,
                ];
            });

        return response()->json([
            'conversations' => $conversations
        ]);
    }

    /**
     * Get conversation messages
     */
    public function getConversationMessages(Request $request, $conversationId)
    {
        $user = Auth::user();

        $conversation = AmplifyConversation::where('user_id', $user->id)
            ->where('id', $conversationId)
            ->firstOrFail();

        $messages = $conversation->messages()
            ->orderBy('created_at')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'type' => $message->type,
                    'content' => $message->content,
                    'timestamp' => $message->created_at,
                    'richData' => $message->rich_data,
                ];
            });

        return response()->json([
            'messages' => $messages,
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'category' => $conversation->category,
            ]
        ]);
    }

    /**
     * Create new conversation
     */
    public function createConversation(Request $request)
    {
        $user = Auth::user();
        $title = $request->input('title', 'New Conversation');
        $category = $request->input('category', 'general');

        $conversation = AmplifyConversation::create([
            'user_id' => $user->id,
            'title' => $title,
            'category' => $category,
            'context' => $this->getBrandContext($user),
        ]);

        return response()->json([
            'success' => true,
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'category' => $conversation->category,
            ]
        ]);
    }

    /**
     * Delete conversation
     */
    public function deleteConversation(Request $request, $id)
    {
        $user = Auth::user();

        try {
            $conversation = AmplifyConversation::where('user_id', $user->id)
                ->where('id', $id)
                ->firstOrFail();

            // Soft delete by archiving the conversation
            $conversation->archive();

            return response()->json([
                'success' => true,
                'message' => 'Conversation deleted successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to delete conversation', [
                'conversation_id' => $id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete conversation'
            ], 500);
        }
    }

    /**
     * Get or create conversation
     */
    private function getOrCreateConversation($user, $conversationId, $firstMessage)
    {
        if ($conversationId) {
            $conversation = AmplifyConversation::where('user_id', $user->id)
                ->where('id', $conversationId)
                ->first();

            if ($conversation) {
                return $conversation;
            }
        }

        // Create new conversation with smart title
        $title = $this->generateConversationTitle($firstMessage);
        $category = $this->classifyConversation($firstMessage);

        return AmplifyConversation::create([
            'user_id' => $user->id,
            'title' => $title,
            'category' => $category,
            'context' => $this->getBrandContext($user),
        ]);
    }

    /**
     * Generate conversation title from first message
     */
    private function generateConversationTitle(string $message): string
    {
        $message = strtolower($message);

        if (strpos($message, 'performance') !== false || strpos($message, 'how') !== false) {
            return 'Performance Analysis';
        }

        if (strpos($message, 'competitor') !== false) {
            return 'Competitor Analysis';
        }

        if (strpos($message, 'content') !== false || strpos($message, 'write') !== false) {
            return 'Content Strategy';
        }

        if (strpos($message, 'visibility') !== false || strpos($message, 'mention') !== false) {
            return 'Visibility Optimization';
        }

        if (strpos($message, 'strategy') !== false || strpos($message, 'recommend') !== false) {
            return 'Strategic Planning';
        }

        // Use first 50 characters as fallback
        return strlen($message) > 50 ? substr($message, 0, 47) . '...' : $message;
    }

    /**
     * Classify conversation category
     */
    private function classifyConversation(string $message): string
    {
        $message = strtolower($message);

        if (strpos($message, 'competitor') !== false) return 'competitors';
        if (strpos($message, 'content') !== false || strpos($message, 'write') !== false) return 'content';
        if (strpos($message, 'strategy') !== false || strpos($message, 'recommend') !== false) return 'strategy';
        if (strpos($message, 'performance') !== false || strpos($message, 'how') !== false) return 'performance';

        return 'general';
    }

    /**
     * Generate AI response based on selected model
     */
    private function generateAIResponse(User $user, string $model, string $message, array $context): array
    {
        Log::info('generateAIResponse called', [
            'model' => $model,
            'isAvailable' => $this->cerebrasService->isAvailable(),
            'match' => $model === 'cerebras-gpt-oss-120b'
        ]);

        // Only support Cerebras model
        if ($this->cerebrasService->isAvailable()) {
            return $this->cerebrasService->generateResponse($user, $message, $context);
        }

        throw new \Exception('Selected AI model is not available - Cerebras service unavailable');
    }

    /**
     * Get available AI models
     */
    private function getAvailableModels(): array
    {
        $models = [];

        // Only add Cerebras model if API key is configured
        if ($this->cerebrasService->isAvailable()) {
            $models['cerebras-gpt-oss-120b'] = array_merge($this->cerebrasService->getModelInfo(), [
                'streaming' => true,
                'recommended' => true
            ]);
        }

        return $models;
    }

    /**
     * Generate personalized trend search prompt
     */
    private function generateTrendSearchPrompt($brandContext): string
    {
        $brandName = $brandContext['brandName'] ?? 'your brand';
        $industry = $brandContext['industry'] ?? 'your industry';

        // Create a time-sensitive search prompt that will trigger DuckDuckGo
        return "What are the latest trends and breaking news in the {$industry} industry right now? Search for recent developments about {$brandName} and competitors. What's currently happening in the market that we should know about immediately?";
    }

    /**
     * Get trend search data insight
     */
    private function getTrendSearchDataInsight($brandContext): array
    {
        return [
            'has_data' => true,
            'metrics' => [
                'Real-time web search powered by Docker MCP DuckDuckGo',
                'Access to latest industry news and market trends',
                'Current competitor activities and announcements',
                'Emerging topics and conversations in your industry'
            ],
            'message' => 'Search for real-time market intelligence and trending topics to stay ahead of the curve and react quickly to market changes.'
        ];
    }

    /**
     * Check if a database table exists
     */
    private function tableExists($tableName): bool
    {
        try {
            return DB::getSchemaBuilder()->hasTable($tableName);
        } catch (\Exception $e) {
            return false;
        }
    }
}