<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ResponsesController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get all responses for the user's monitors
        $responses = DB::table('responses')
            ->join('prompts', 'responses.prompt_id', '=', 'prompts.id')
            ->join('monitors', 'prompts.monitor_id', '=', 'monitors.id')
            ->where('monitors.user_id', $user->id)
            ->select(
                'responses.id',
                'responses.model_name',
                'responses.response_text',
                'responses.brand_mentioned',
                'responses.sentiment',
                'responses.visibility_score',
                'responses.competitors_mentioned',
                'responses.citation_sources',
                'responses.tokens_used',
                'responses.cost',
                'responses.created_at',
                'prompts.id as prompt_id',
                'prompts.text as prompt_text',
                'monitors.name as monitor_name'
            )
            ->orderBy('responses.created_at', 'desc')
            ->get()
            ->map(function ($response) {
                // Transform database response to match frontend interface
                $competitorMentions = [];
                if ($response->competitors_mentioned) {
                    $competitors = json_decode($response->competitors_mentioned, true);
                    if (is_array($competitors)) {
                        foreach ($competitors as $competitor) {
                            $competitorMentions[] = [
                                'competitorName' => $competitor,
                                'mentioned' => true
                            ];
                        }
                    }
                }
                
                $brandMentions = [];
                if ($response->brand_mentioned) {
                    $brandMentions[] = [
                        'brandName' => 'Brand',
                        'sentiment' => $response->sentiment ?? 'neutral',
                        'mentioned' => true
                    ];
                }
                
                // Map model names to display information
                $modelInfo = $this->getModelInfo($response->model_name);
                
                // Parse citation data if available
                $citations = null;
                if ($response->citation_sources) {
                    $sources = json_decode($response->citation_sources, true) ?: [];

                    $citations = [
                        'sources' => $sources,
                        'count' => count($sources)
                    ];
                }

                return [
                    'id' => $response->id,
                    'text' => $response->response_text ?? '',
                    'model' => $modelInfo,
                    'visibility' => (int) ($response->visibility_score ?? 0),
                    'brandMentions' => $brandMentions,
                    'competitorMentions' => $competitorMentions,
                    'answered' => $response->created_at,
                    'promptId' => $response->prompt_id,
                    'tokens' => (int) ($response->tokens_used ?? 0),
                    'cost' => (float) ($response->cost ?? 0.0),
                    'citations' => $citations
                ];
            });
        
        return Inertia::render('responses', [
            'responses' => $responses,
            'modelUsageData' => $this->getModelUsageData($responses),
            'responseTimelineData' => $this->getResponseTimelineData($responses)
        ]);
    }
    
    private function getModelInfo($modelName)
    {
        $models = [
            'gemini-2.0-flash' => [
                'id' => 'gemini-2.0-flash',
                'name' => 'gemini-2.0-flash',
                'displayName' => 'Gemini 2.0 Flash',
                'icon' => 'https://www.google.com/s2/favicons?domain=google.com&sz=256',
                'color' => 'fill-blue-500'
            ],
            'gemini-2.5-flash-preview-09-2025' => [
                'id' => 'gemini-2.5-flash-preview-09-2025',
                'name' => 'gemini-2.5-flash-preview-09-2025',
                'displayName' => 'Gemini 2.5 Flash Preview',
                'icon' => 'https://www.google.com/s2/favicons?domain=google.com&sz=256',
                'color' => 'fill-blue-500'
            ],
            'gpt-4o-search' => [
                'id' => 'gpt-4o-search',
                'name' => 'gpt-4o-search',
                'displayName' => 'ChatGPT Search',
                'icon' => 'https://www.google.com/s2/favicons?domain=openai.com&sz=256',
                'color' => 'fill-emerald-500'
            ],
            'gpt-oss-120b' => [
                'id' => 'gpt-oss-120b',
                'name' => 'gpt-oss-120b',
                'displayName' => 'GPT OSS 120B',
                'icon' => 'https://www.google.com/s2/favicons?domain=openai.com&sz=256',
                'color' => 'fill-emerald-500'
            ],
            'mistral-small-latest' => [
                'id' => 'mistral-small-latest',
                'name' => 'mistral-small-latest',
                'displayName' => 'Mistral Small',
                'icon' => 'https://www.google.com/s2/favicons?domain=mistral.ai&sz=256',
                'color' => 'fill-violet-500'
            ],
            'llama-4-scout-17b-16e-instruct' => [
                'id' => 'llama-4-scout-17b-16e-instruct',
                'name' => 'llama-4-scout-17b-16e-instruct',
                'displayName' => 'Llama 4 Scout',
                'icon' => 'https://www.google.com/s2/favicons?domain=meta.ai&sz=256',
                'color' => 'fill-purple-500'
            ]
        ];
        
        return $models[$modelName] ?? [
            'id' => $modelName,
            'name' => $modelName,
            'displayName' => $modelName,
            'icon' => '/llm-icons/default.svg',
            'color' => 'fill-gray-500'
        ];
    }
    
    private function getModelUsageData($responses)
    {
        $modelCounts = [];
        foreach ($responses as $response) {
            $modelName = $response['model']['name'];
            $modelCounts[$modelName] = ($modelCounts[$modelName] ?? 0) + 1;
        }
        
        $colors = [
            'gemini-2.0-flash' => '#3B82F6',
            'gemini-2.5-flash-preview-09-2025' => '#3B82F6',
            'gpt-4o-search' => '#10B981',
            'gpt-oss-120b' => '#10B981',
            'mistral-small-latest' => '#8B5CF6',
            'llama-4-scout-17b-16e-instruct' => '#8B5CF6'
        ];
        
        $result = [];
        foreach ($modelCounts as $modelName => $count) {
            $result[] = [
                'name' => $modelName,
                'count' => $count,
                'color' => $colors[$modelName] ?? '#6B7280'
            ];
        }
        
        return $result;
    }
    
    private function getResponseTimelineData($responses)
    {
        // Initialize date groups for the last 30 days
        $dateGroups = [];
        $today = new \DateTime();

        for ($i = 29; $i >= 0; $i--) {
            $date = (clone $today)->modify("-$i days");
            $dateStr = $date->format('Y-m-d');
            $dateGroups[$dateStr] = [
                'date' => $dateStr,
                'timestamp' => $date->getTimestamp() * 1000, // Add timestamp for JS Date compatibility
                'gemini-2.0-flash' => 0,
                'gemini-2.5-flash-preview-09-2025' => 0,
                'gpt-4o-search' => 0,
                'gpt-oss-120b' => 0,
                'mistral-small-latest' => 0,
                'llama-4-scout-17b-16e-instruct' => 0
            ];
        }

        // Group responses by date
        foreach ($responses as $response) {
            $date = date('Y-m-d', strtotime($response['answered']));
            if (isset($dateGroups[$date])) {
                $modelName = $response['model']['name'];
                if (isset($dateGroups[$date][$modelName])) {
                    $dateGroups[$date][$modelName]++;
                }
            }
        }

        // Sort by date and return as indexed array
        ksort($dateGroups);
        return array_values($dateGroups);
    }
}