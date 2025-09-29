<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PromptsController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get all prompts for the user's monitors with response data
        $prompts = DB::table('prompts')
            ->join('monitors', 'prompts.monitor_id', '=', 'monitors.id')
            ->where('monitors.user_id', $user->id)
            ->select(
                'prompts.*',
                'monitors.name as monitor_name',
                'monitors.id as monitor_id'
            )
            ->orderBy('prompts.created_at', 'desc')
            ->get()
            ->map(function ($prompt) {
                // Get responses for this prompt
                $responses = DB::table('responses')
                    ->where('prompt_id', $prompt->id)
                    ->select('id', 'model_name', 'response_text', 'brand_mentioned', 'sentiment', 'visibility_score', 'competitors_mentioned', 'citation_sources', 'created_at')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($response) {
                        // Safe JSON parsing for index page
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
                        
                        // Process response text to add line breaks and format properly
                        $processed_text = $response->response_text ?? 'No response available';
                        
                        // Add line breaks after sentences that end with periods followed by capital letters
                        $processed_text = preg_replace('/(\.) ([A-Z])/', "$1\n\n$2", $processed_text);
                        
                        // Add line breaks before bullet points and markdown headers
                        $processed_text = preg_replace('/(\.) (\* \*\*)/', "$1\n\n$2", $processed_text);
                        $processed_text = preg_replace('/(\.) (\*\*[^*]+\*\*:)/', "$1\n\n$2", $processed_text);
                        
                        // Convert markdown to HTML and preserve line breaks
                        $processed_text = \Illuminate\Support\Str::markdown($processed_text);
                        
                        return [
                            'id' => $response->id ?? 'N/A',
                            'model_name' => $response->model_name ?? 'Unknown Model',
                            'response_text' => $processed_text,
                            'brand_mentioned' => (bool) ($response->brand_mentioned ?? false),
                            'sentiment' => $response->sentiment ?? 'neutral',
                            'visibility_score' => (float) ($response->visibility_score ?? 0.0),
                            'competitors_mentioned' => $competitors,
                            'citation_sources' => $citations,
                            'created_at' => $response->created_at ?? now()->toISOString()
                        ];
                    });
                
                return [
                    'id' => $prompt->id ?? 'N/A',
                    'text' => $prompt->text ?? 'Untitled Prompt',
                    'type' => $prompt->type ?? 'brand-specific',
                    'intent' => $prompt->intent ?? 'informational',
                    'responseCount' => $responses->count(),
                    'visibility' => (float) ($prompt->visibility_percentage ?? 0.0),
                    'language' => [
                        'code' => $prompt->language_code ?? 'en',
                        'name' => $prompt->language_name ?? 'English',
                        'flag' => $prompt->language_flag ?? '🇺🇸'
                    ],
                    'monitor' => [
                        'id' => (int) ($prompt->monitor_id ?? 0),
                        'name' => $prompt->monitor_name ?? 'Unknown Monitor'
                    ],
                    'responses' => $responses,
                    'created' => $prompt->created_at ?? now()->toISOString()
                ];
            });

        // Get user's monitors for status checking
        $monitors = DB::table('monitors')
            ->where('user_id', $user->id)
            ->select('id', 'name', 'website_name', 'website_url', 'status', 'setup_status', 'prompts_generated', 'prompts_generated_at')
            ->get()
            ->map(function ($monitor) {
                return [
                    'id' => $monitor->id,
                    'name' => $monitor->name,
                    'website' => [
                        'name' => $monitor->website_name,
                        'url' => $monitor->website_url
                    ],
                    'status' => $monitor->status,
                    'setup_status' => $monitor->setup_status,
                    'prompts_generated' => $monitor->prompts_generated ?? 0,
                    'prompts_generated_at' => $monitor->prompts_generated_at
                ];
            });

        return Inertia::render('prompts', [
            'prompts' => $prompts,
            'monitors' => $monitors
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();
        
        // Get the specific prompt with monitor data
        $prompt = DB::table('prompts')
            ->join('monitors', 'prompts.monitor_id', '=', 'monitors.id')
            ->where('prompts.id', $id)
            ->where('monitors.user_id', $user->id)
            ->select(
                'prompts.*',
                'monitors.name as monitor_name',
                'monitors.id as monitor_id',
                'monitors.website_name',
                'monitors.website_url'
            )
            ->first();

        if (!$prompt) {
            abort(404, 'Prompt not found');
        }

        // Get responses for this prompt
        $responses = DB::table('responses')
            ->where('prompt_id', $prompt->id)
            ->select('id', 'model_name', 'response_text', 'brand_mentioned', 'sentiment', 'visibility_score', 'competitors_mentioned', 'citation_sources', 'tokens_used', 'cost', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($response) {
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
                
                // Process response text to add line breaks and format properly
                $processed_text = $response->response_text ?? 'No response text available';
                
                // Add line breaks after sentences that end with periods followed by capital letters
                $processed_text = preg_replace('/(\.) ([A-Z])/', "$1\n\n$2", $processed_text);
                
                // Add line breaks before bullet points and markdown headers
                $processed_text = preg_replace('/(\.) (\* \*\*)/', "$1\n\n$2", $processed_text);
                $processed_text = preg_replace('/(\.) (\*\*[^*]+\*\*:)/', "$1\n\n$2", $processed_text);
                
                // Convert markdown to HTML and preserve line breaks
                $processed_text = \Illuminate\Support\Str::markdown($processed_text);
                
                return [
                    'id' => $response->id ?? 'N/A',
                    'model_name' => $response->model_name ?? 'Unknown Model',
                    'response_text' => $processed_text,
                    'brand_mentioned' => (bool) ($response->brand_mentioned ?? false),
                    'sentiment' => $response->sentiment ?? 'neutral',
                    'visibility_score' => (float) ($response->visibility_score ?? 0.0),
                    'competitors_mentioned' => $competitors,
                    'citation_sources' => $citations,
                    'tokens_used' => (int) ($response->tokens_used ?? 0),
                    'cost' => (float) ($response->cost ?? 0.0),
                    'created_at' => $response->created_at ?? now()->toISOString()
                ];
            });

        // Format prompt data with safe defaults
        $promptData = [
            'id' => $prompt->id ?? 'N/A',
            'text' => $prompt->text ?? 'Untitled Prompt',
            'type' => $prompt->type ?? 'brand-specific',
            'intent' => $prompt->intent ?? 'informational',
            'responseCount' => $responses->count(),
            'visibility' => (float) ($prompt->visibility_percentage ?? 0.0),
            'language' => [
                'code' => $prompt->language_code ?? 'en',
                'name' => $prompt->language_name ?? 'English',
                'flag' => $prompt->language_flag ?? '🇺🇸'
            ],
            'monitor' => [
                'id' => (int) ($prompt->monitor_id ?? 0),
                'name' => $prompt->monitor_name ?? 'Unknown Monitor',
                'website' => [
                    'name' => $prompt->website_name ?? 'Unknown Website',
                    'url' => $prompt->website_url ?? '#'
                ]
            ],
            'responses' => $responses->toArray(),
            'created' => $prompt->created_at ?? now()->toISOString(),
            'updated' => $prompt->updated_at ?? now()->toISOString()
        ];

        return Inertia::render('prompts/show-new', [
            'prompt' => $promptData
        ]);
    }
}