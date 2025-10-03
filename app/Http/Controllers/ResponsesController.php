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
                    $mapping = json_decode($response->citation_mapping, true) ?: [];
                    $positions = json_decode($response->citation_positions, true) ?: [];

                    $citations = [
                        'sources' => $sources,
                        'mapping' => $mapping,
                        'positions' => $positions,
                        'count' => (int) ($response->citation_sources_count ?? count($sources)),
                        'fingerprint' => json_decode($response->citation_fingerprint, true)
                    ];
                }

                return [
                    'id' => $response->id,
                    'text' => $response->response_text ?? '',
                    'textWithCitations' => $response->response_text_with_citations ?? '',
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
                'icon' => '/llm-icons/gemini.svg',
                'color' => 'fill-blue-500'
            ],
            'gpt-4o-search' => [
                'id' => 'gpt-4o-search',
                'name' => 'gpt-4o-search',
                'displayName' => 'ChatGPT Search',
                'icon' => '/llm-icons/openai.svg',
                'color' => 'fill-emerald-500'
            ],
            'mistral-small-latest' => [
                'id' => 'mistral-small-latest',
                'name' => 'mistral-small-latest',
                'displayName' => 'Mistral Small',
                'icon' => '/llm-icons/mistral.svg',
                'color' => 'fill-violet-500'
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
            'gpt-4o-search' => '#10B981',
            'mistral-small-latest' => '#8B5CF6'
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
        // Group responses by date
        $dateGroups = [];
        foreach ($responses as $response) {
            $date = date('Y-m-d', strtotime($response['answered']));
            if (!isset($dateGroups[$date])) {
                $dateGroups[$date] = [
                    'date' => $date,
                    'gemini-2.0-flash' => 0,
                    'gpt-4o-search' => 0,
                    'mistral-small-latest' => 0
                ];
            }
            $modelName = $response['model']['name'];
            if (isset($dateGroups[$date][$modelName])) {
                $dateGroups[$date][$modelName]++;
            }
        }
        
        // Sort by date and return last 7 days
        ksort($dateGroups);
        return array_slice(array_values($dateGroups), -7);
    }
}