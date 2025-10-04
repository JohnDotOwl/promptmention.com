<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class SearchMCPService
{
    private string $mcpServerUrl;
    private int $timeout;
    private array $searchKeywords;

    public function __construct()
    {
        $this->mcpServerUrl = env('MCP_SERVER_URL', 'http://localhost:3000');
        $this->timeout = env('MCP_TIMEOUT', 30);

        $this->searchKeywords = [
            'search', 'find', 'look up', 'research', 'news', 'trending', 'latest',
            'what are people saying', 'what\'s happening', 'what\'s new',
            'competitor news', 'industry updates', 'recent', 'current',
            'what\'s trending', 'breaking news', 'latest news',
            'brand visibility', 'competitor analysis', 'market research',
            'how is', 'what about', 'tell me about', 'information about',
            'analyze', 'investigate', 'explore', 'competitive intelligence',
            'market insights', 'brand comparison', 'company research'
        ];
    }

    /**
     * Check if a message contains search-related keywords
     */
    public function isSearchQuery(string $message): bool
    {
        $message = strtolower($message);

        foreach ($this->searchKeywords as $keyword) {
            if (strpos($message, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Perform search using DuckDuckGo MCP server
     */
    public function performSearch(string $query, array $context = []): array
    {
        try {
            // Create cache key for this search
            $cacheKey = 'search_mcp_' . md5($query . serialize($context));

            // Check cache first (cache for 15 minutes)
            if (Cache::has($cacheKey)) {
                Log::info('Returning cached search result', ['query' => $query]);
                return Cache::get($cacheKey);
            }

            Log::info('Performing DuckDuckGo MCP search', ['query' => $query]);

            // Build enhanced search query with brand context
            $enhancedQuery = $this->buildEnhancedQuery($query, $context);

            $response = Http::timeout($this->timeout)
                ->post($this->mcpServerUrl . '/search', [
                    'query' => $enhancedQuery,
                    'source' => 'duckduckgo',
                    'max_results' => 10,
                    'context' => $context
                ]);

            if (!$response->successful()) {
                Log::error('MCP server search failed', [
                    'query' => $query,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                return $this->getFallbackResult($query);
            }

            $searchResults = $response->json();

            // Process and format results
            $processedResults = $this->processSearchResults($searchResults, $query, $context);

            // Cache the results
            Cache::put($cacheKey, $processedResults, now()->addMinutes(15));

            return $processedResults;

        } catch (\Exception $e) {
            Log::error('Search MCP service error', [
                'query' => $query,
                'error' => $e->getMessage()
            ]);

            return $this->getFallbackResult($query);
        }
    }

    /**
     * Build enhanced search query with brand context
     */
    private function buildEnhancedQuery(string $query, array $context): string
    {
        $enhancedQuery = $query;

        // Add brand name if available
        if (!empty($context['brandName'])) {
            if (strpos($query, $context['brandName']) === false) {
                $enhancedQuery .= ' ' . $context['brandName'];
            }
        }

        // Add industry context if available
        if (!empty($context['industry'])) {
            $enhancedQuery .= ' ' . $context['industry'];
        }

        // Add time context for recent/trending queries
        if ($this->isTimeSensitiveQuery($query)) {
            $enhancedQuery .= ' recent OR latest OR 2024 OR 2025';
        }

        return trim($enhancedQuery);
    }

    /**
     * Check if query is time-sensitive
     */
    private function isTimeSensitiveQuery(string $query): bool
    {
        $timeKeywords = ['latest', 'recent', 'new', 'current', 'trending', 'news', 'what\'s happening'];
        $query = strtolower($query);

        foreach ($timeKeywords as $keyword) {
            if (strpos($query, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Process and format search results
     */
    private function processSearchResults(array $results, string $query, array $context): array
    {
        return [
            'success' => true,
            'query' => $query,
            'enhanced_query' => $this->buildEnhancedQuery($query, $context),
            'results' => $results['results'] ?? [],
            'total_results' => count($results['results'] ?? []),
            'search_time' => $results['search_time'] ?? null,
            'sources' => $this->extractSources($results['results'] ?? []),
            'context_used' => [
                'brand_name' => $context['brandName'] ?? null,
                'industry' => $context['industry'] ?? null
            ],
            'mcp_info' => [
                'server' => 'Docker MCP - DuckDuckGo',
                'server_url' => $this->mcpServerUrl,
                'docker_image' => 'mcp/duckduckgo',
                'docker_hub' => 'https://hub.docker.com/r/mcp/duckduckgo',
                'model_context_protocol' => 'MCP Bridge Service',
                'fallback_used' => ($results['fallback'] ?? false),
                'search_engine' => 'DuckDuckGo Instant Answer API'
            ],
            'timestamp' => now()->toISOString()
        ];
    }

    /**
     * Extract unique sources from search results
     */
    private function extractSources(array $results): array
    {
        $sources = [];

        foreach ($results as $result) {
            if (isset($result['domain'])) {
                $sources[] = $result['domain'];
            }
        }

        return array_unique($sources);
    }

    /**
     * Get fallback result when MCP server fails
     */
    private function getFallbackResult(string $query): array
    {
        return [
            'success' => false,
            'query' => $query,
            'results' => [],
            'total_results' => 0,
            'error' => 'Search service temporarily unavailable',
            'timestamp' => now()->toISOString()
        ];
    }

    /**
     * Format search results for AI context
     */
    public function formatForAI(array $searchResults): string
    {
        if (!$searchResults['success'] || empty($searchResults['results'])) {
            return "No recent search results available for this query.";
        }

        $context = "Based on recent web search for '{$searchResults['query']}':\n\n";

        foreach ($searchResults['results'] as $index => $result) {
            $context .= ($index + 1) . ". {$result['title']}\n";
            $context .= "   Source: {$result['domain']}\n";
            $context .= "   Content: " . substr(strip_tags($result['snippet'] ?? ''), 0, 200) . "...\n\n";
        }

        $context .= "Search performed: {$searchResults['timestamp']}\n";

        if (!empty($searchResults['context_used']['brand_name'])) {
            $context .= "Brand context: {$searchResults['context_used']['brand_name']}\n";
        }

        return $context;
    }

    /**
     * Check if MCP server is available
     */
    public function isServerAvailable(): bool
    {
        try {
            $response = Http::timeout(5)->get($this->mcpServerUrl . '/health');
            return $response->successful();
        } catch (\Exception $e) {
            Log::error('MCP server health check failed', ['error' => $e->getMessage()]);
            return false;
        }
    }
}