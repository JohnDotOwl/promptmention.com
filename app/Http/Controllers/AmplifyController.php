<?php

namespace App\Http\Controllers;

use App\Http\Requests\AmplifyChatRequest;
use App\Models\AmplifyConversation;
use App\Models\AmplifyMessage;
use App\Services\BrandAssistantService;
use App\Services\CerebrasAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AmplifyController extends Controller
{
    private BrandAssistantService $brandAssistantService;
    private CerebrasAIService $cerebrasService;

    public function __construct(
        BrandAssistantService $brandAssistantService,
        CerebrasAIService $cerebrasService
    ) {
        $this->brandAssistantService = $brandAssistantService;
        $this->cerebrasService = $cerebrasService;
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

        // Get available AI models and user's preference
        $availableModels = $this->getAvailableModels();
        $userPreferredModel = $user->preferred_ai_model ?? 'cerebras-gpt-oss-120b';

        return Inertia::render('amplify', [
            'user' => $user,
            'brandContext' => $brandContext,
            'conversationHistory' => $conversationHistory,
            'suggestedPrompts' => $suggestedPrompts,
            'initialMessage' => $this->getInitialGreeting($user, $brandContext),
            'availableModels' => $availableModels,
            'userPreferredModel' => $userPreferredModel,
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
            'totalMentions' => 0,
            'visibilityScore' => 0,
            'hasData' => false,
            'competitors' => [],
            'recentActivity' => false,
        ];

        try {
            // Get project/brand name
            if ($this->tableExists('onboarding_progress')) {
                $onboarding = DB::table('onboarding_progress')
                    ->where('user_id', $user->id)
                    ->first();

                if ($onboarding) {
                    $context['brandName'] = $onboarding->company_name;
                    $context['website'] = $onboarding->company_website;
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
            'general' => [
                'How can we improve our brand visibility?',
                'What are the latest trends in our industry?',
                'Analyze our competitor performance',
                'Suggest content ideas for our brand',
            ],
            'data_specific' => [],
        ];

        // Add data-specific prompts if user has monitoring data
        if ($brandContext['hasData']) {
            $prompts['data_specific'] = [
                'How did our brand perform this week?',
                'Which AI models mention us most often?',
                'What\'s driving our mention trends?',
                'Compare our visibility to competitors',
            ];
        }

        // Add brand-specific prompts if we have brand name
        if ($brandContext['brandName']) {
            $prompts['personalized'] = [
                "How can {$brandContext['brandName']} get more mentions?",
                "What content strategies work for {$brandContext['brandName']}?",
                "Analyze {$brandContext['brandName']}'s competitive position",
            ];
        }

        return $prompts;
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
        $useStreaming = $request->input('stream', false);

        if (!$message) {
            return response()->json(['error' => 'Message is required'], 422);
        }

        try {
            // Get or create conversation
            $conversation = $this->getOrCreateConversation($user, $conversationId, $message);

            // Save user message
            AmplifyMessage::createUserMessage($conversation->id, $message);

            // Get brand context
            $brandContext = $this->getBrandContext($user);

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

            return response()->json([
                'success' => true,
                'response' => $aiResponse,
                'conversation_id' => $conversation->id,
                'model' => $selectedModel
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process Amplify chat message', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
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

        if (!$message) {
            return response()->json(['error' => 'Message is required'], 422);
        }

        // Only allow streaming for Cerebras model
        if ($selectedModel !== 'cerebras-gpt-oss-120b' || !$this->cerebrasService->isAvailable()) {
            return response()->json(['error' => 'Streaming not available for selected model'], 422);
        }

        try {
            // Get or create conversation
            $conversation = $this->getOrCreateConversation($user, $conversationId, $message);

            // Save user message
            AmplifyMessage::createUserMessage($conversation->id, $message);

            // Get brand context
            $brandContext = $this->getBrandContext($user);

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
                return [
                    'id' => $conversation->id,
                    'title' => $conversation->title,
                    'lastMessage' => $conversation->latestMessage->content ?? 'No messages yet',
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
        // Only support Cerebras model
        if ($model === 'cerebras-gpt-oss-120b' && $this->cerebrasService->isAvailable()) {
            return $this->cerebrasService->generateResponse($user, $message, $context);
        }

        throw new \Exception('Selected AI model is not available');
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