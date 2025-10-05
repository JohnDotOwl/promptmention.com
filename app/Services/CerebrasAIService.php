<?php

namespace App\Services;

use App\Models\User;
use App\Models\AmplifyInsightCache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CerebrasAIService
{
    private ?string $apiKey;
    private string $baseUrl;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('cerebras.api_key');
        $this->baseUrl = config('cerebras.base_url');
        $this->model = config('cerebras.model');
    }

    /**
     * Generate a streaming response using Cerebras AI
     */
    public function streamResponse(User $user, string $message, array $context = []): StreamedResponse
    {
        return new StreamedResponse(function () use ($user, $message, $context) {
            $this->sendStreamingRequest($user, $message, $context);
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable nginx buffering
        ]);
    }

    /**
     * Generate a non-streaming response
     */
    public function generateResponse(User $user, string $message, array $context = []): array
    {
        try {
            $systemPrompt = $this->buildSystemPrompt($user, $context);

            $headers = [
                    'Content-Type' => 'application/json',
                ];

                if ($this->apiKey) {
                    $headers['Authorization'] = 'Bearer ' . $this->apiKey;
                }

                $response = Http::timeout(config('cerebras.timeout', 60))
                    ->withHeaders($headers)
                ->post($this->baseUrl . '/chat/completions', [
                    'model' => $this->model,
                    'stream' => false,
                    'max_tokens' => config('cerebras.max_tokens', 4096),
                    'temperature' => config('cerebras.temperature', 0.7),
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $systemPrompt
                        ],
                        [
                            'role' => 'user',
                            'content' => $message
                        ]
                    ]
                ]);

            if (!$response->successful()) {
                Log::error('Cerebras API request failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'user_id' => $user->id
                ]);

                return [
                    'content' => "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
                    'richData' => null,
                    'model' => $this->model,
                    'provider' => 'cerebras',
                    'error' => true
                ];
            }

            $data = $response->json();
            $content = $data['choices'][0]['message']['content'] ?? '';

            return [
                'content' => $content,
                'richData' => $this->extractRichData($content, $context),
                'model' => $this->model,
                'provider' => 'cerebras'
            ];

        } catch (\Exception $e) {
            Log::error('CerebrasAIService error', [
                'error' => $e->getMessage(),
                'user_id' => $user->id
            ]);

            throw $e;
        }
    }

    /**
     * Send streaming request to Cerebras API
     */
    private function sendStreamingRequest(User $user, string $message, array $context): void
    {
        $systemPrompt = $this->buildSystemPrompt($user, $context);

        $postData = [
            'model' => $this->model,
            'stream' => true,
            'max_tokens' => config('cerebras.max_tokens', 4096),
            'temperature' => config('cerebras.temperature', 0.7),
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt
                ],
                [
                    'role' => 'user',
                    'content' => $message
                ]
            ]
        ];

        $ch = curl_init($this->baseUrl . '/chat/completions');

        $headers = [
            'Content-Type: application/json',
        ];

        if ($this->apiKey) {
            $headers[] = 'Authorization: Bearer ' . $this->apiKey;
        }

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($postData),
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_WRITEFUNCTION => function($ch, $data) {
                $this->handleStreamChunk($data);
                return strlen($data);
            },
            CURLOPT_TIMEOUT => config('cerebras.timeout', 120),
        ]);

        // Send search metadata if available
        if (isset($context['searchResults']) && $context['searchResults']['success'] === true) {
            $this->sendStreamChunk([
                'type' => 'search_metadata',
                'search_metadata' => [
                    'performed' => true,
                    'query' => $context['searchResults']['query'],
                    'totalResults' => $context['searchResults']['total_results'],
                    'sources' => $context['searchResults']['sources'],
                    'searchTime' => $context['searchResults']['timestamp'],
                    'enhancedQuery' => $context['searchResults']['enhanced_query'] ?? $context['searchResults']['query'],
                    'mcpInfo' => $context['searchResults']['mcp_info'] ?? []
                ]
            ]);
        }

        $result = curl_exec($ch);

        if (curl_errno($ch)) {
            $this->sendStreamError('Stream connection error: ' . curl_error($ch));
        }

        curl_close($ch);

        // Send final chunk to indicate completion
        $this->sendStreamChunk([
            'type' => 'done',
            'provider' => 'cerebras',
            'model' => $this->model
        ]);
    }

    /**
     * Handle individual stream chunks
     */
    private function handleStreamChunk(string $data): void
    {
        $lines = explode("\n", $data);

        foreach ($lines as $line) {
            $line = trim($line);

            if (empty($line) || !str_starts_with($line, 'data: ')) {
                continue;
            }

            $jsonStr = substr($line, 6); // Remove "data: " prefix

            if ($jsonStr === '[DONE]') {
                $this->sendStreamChunk([
                    'type' => 'done',
                    'provider' => 'cerebras',
                    'model' => $this->model
                ]);
                break;
            }

            $chunk = json_decode($jsonStr, true);

            if (isset($chunk['choices'][0]['delta']['content'])) {
                $content = $chunk['choices'][0]['delta']['content'];

                $this->sendStreamChunk([
                    'type' => 'content',
                    'content' => $content,
                    'provider' => 'cerebras',
                    'model' => $this->model
                ]);
            }
        }
    }

    /**
     * Send chunk to frontend via Server-Sent Events
     */
    private function sendStreamChunk(array $data): void
    {
        echo "data: " . json_encode($data) . "\n\n";
        ob_flush();
        flush();
    }

    /**
     * Send error message via stream
     */
    private function sendStreamError(string $error): void
    {
        $this->sendStreamChunk([
            'type' => 'error',
            'error' => $error
        ]);
    }

    /**
     * Build system prompt with brand context
     */
    private function buildSystemPrompt(User $user, array $context): string
    {
        $brandName = $context['brandName'] ?? 'the brand';
        $hasData = $context['hasData'] ?? false;
        $visibilityScore = $context['visibilityScore'] ?? 0;
        $weeklyMentions = $context['weeklyMentions'] ?? 0;

        $prompt = "You are Amplify, an AI-powered brand growth assistant powered by Cerebras AI. ";

        if ($brandName !== 'the brand') {
            $prompt .= "You're helping {$brandName} amplify its visibility across AI models. ";
        }

        if ($hasData) {
            $prompt .= "The brand currently has {$weeklyMentions} mentions this week and a visibility score of {$visibilityScore}/100. ";
        }

        $prompt .= "\n\nYour role is to:\n";
        $prompt .= "• Analyze brand performance and visibility trends\n";
        $prompt .= "• Provide data-driven insights and recommendations\n";
        $prompt .= "• Suggest content strategies to increase AI model mentions\n";
        $prompt .= "• Help with competitive analysis and benchmarking\n";
        $prompt .= "• Create actionable strategies for brand amplification\n\n";

        $prompt .= "Guidelines:\n";
        $prompt .= "• Be conversational yet professional\n";
        $prompt .= "• Provide specific, actionable advice\n";
        $prompt .= "• Reference the user's brand data when available\n";
        $prompt .= "• Focus on practical strategies that can improve AI visibility\n";
        $prompt .= "• Keep responses concise but comprehensive\n\n";

        $prompt .= "Always mention that you're powered by Cerebras AI in your first response.";

        return $prompt;
    }

    /**
     * Extract rich data for UI components from response content
     */
    private function extractRichData(string $content, array $context): ?array
    {
        // Check if content contains specific patterns for rich data
        if (preg_match('/\*\*Performance Overview\*\*/', $content)) {
            return [
                'type' => 'insight',
                'data' => [
                    'title' => 'Performance Analysis',
                    'type' => 'metric',
                    'description' => 'AI-powered performance insights',
                    'action' => [
                        'text' => 'View Analytics',
                        'onClick' => 'navigate:/analytics'
                    ]
                ]
            ];
        }

        if (preg_match('/\*\*Strategic Priorities\*\*/', $content)) {
            return [
                'type' => 'strategy',
                'data' => [
                    'title' => 'Strategic Insights',
                    'type' => 'strategy',
                    'description' => 'Data-driven strategy recommendations',
                    'action' => [
                        'text' => 'Develop Strategy',
                        'onClick' => 'message:Create a detailed brand strategy'
                    ]
                ]
            ];
        }

        return null;
    }

    
    /**
     * Check if Cerebras API is available
     */
    public function isAvailable(): bool
    {
        return !empty($this->apiKey) && $this->apiKey !== 'your_cerebras_api_key_here';
    }

    /**
     * Get model information
     */
    public function getModelInfo(): array
    {
        return [
            'id' => 'cerebras-gpt-oss-120b',
            'name' => 'GPT-OSS-120B',
            'provider' => 'Cerebras AI',
            'description' => 'High-performance open-source language model',
            'maxTokens' => 65536,
            'features' => ['streaming', 'reasoning', 'analysis']
        ];
    }
}