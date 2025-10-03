<?php

namespace App\Services;

use App\Models\User;
use App\Models\AmplifyInsightCache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BrandAssistantService
{
    /**
     * Analyze user's query and generate intelligent response
     */
    public function analyzeQuery(User $user, string $query): array
    {
        $queryType = $this->classifyQuery($query);
        $brandContext = $this->getBrandContext($user);

        switch ($queryType) {
            case 'performance':
                return $this->generatePerformanceAnalysis($user, $brandContext);
            case 'competitors':
                return $this->generateCompetitorAnalysis($user, $brandContext);
            case 'visibility':
                return $this->generateVisibilityRecommendations($user, $brandContext);
            case 'content':
                return $this->generateContentIdeas($user, $brandContext);
            case 'strategy':
                return $this->generateStrategyInsights($user, $brandContext);
            default:
                return $this->generateGeneralResponse($user, $brandContext, $query);
        }
    }

    /**
     * Classify the user's query type
     */
    private function classifyQuery(string $query): string
    {
        $query = strtolower($query);

        if (preg_match('/\b(performance|how.*doing|results|metrics|analytics|perform)\b/', $query)) {
            return 'performance';
        }

        if (preg_match('/\b(competitor|competition|compare|versus|vs|对手|竞争)\b/', $query)) {
            return 'competitors';
        }

        if (preg_match('/\b(visibility|mention|citation|seen|found|exposure|reach)\b/', $query)) {
            return 'visibility';
        }

        if (preg_match('/\b(content|article|blog|write|create|draft|content)\b/', $query)) {
            return 'content';
        }

        if (preg_match('/\b(strategy|recommendation|improve|optimize|better|should)\b/', $query)) {
            return 'strategy';
        }

        return 'general';
    }

    /**
     * Get comprehensive brand context
     */
    private function getBrandContext(User $user): array
    {
        return AmplifyInsightCache::getOrCreate(
            $user->id,
            'brand_context',
            'context',
            function () use ($user) {
                return $this->generateBrandContext($user);
            },
            6 // Cache for 6 hours
        );
    }

    /**
     * Generate fresh brand context
     */
    private function generateBrandContext(User $user): array
    {
        $context = [
            'brandName' => null,
            'website' => null,
            'industry' => null,
            'totalMentions' => 0,
            'visibilityScore' => 0,
            'hasData' => false,
            'monitorIds' => [],
            'competitors' => [],
            'recentActivity' => false,
            'topAiModels' => [],
            'weeklyTrend' => 'neutral',
        ];

        try {
            // Get brand name from onboarding or monitors
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
                $monitors = DB::table('monitors')
                    ->where('user_id', $user->id)
                    ->get();

                $context['monitorIds'] = $monitors->pluck('id')->toArray();

                if ($monitors->isNotEmpty() && !$context['brandName']) {
                    $context['brandName'] = $monitors->first()->name;
                    $context['website'] = $monitors->first()->website_url;
                }
            }

            // Get comprehensive mention statistics
            if (!empty($context['monitorIds']) && $this->tableExists('responses')) {
                $context = array_merge($context, $this->getMentionStatistics($context['monitorIds']));
            }

            // Get competitor data
            if ($this->tableExists('brands')) {
                $competitors = DB::table('brands')
                    ->whereNot('name', $context['brandName'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(['name', 'industry', 'website']);

                $context['competitors'] = $competitors->toArray();
            }

            $context['hasData'] = $context['totalMentions'] > 0;

        } catch (\Exception $e) {
            Log::error('Failed to generate brand context for BrandAssistantService', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }

        return $context;
    }

    /**
     * Get comprehensive mention statistics
     */
    private function getMentionStatistics(array $monitorIds): array
    {
        $stats = [
            'totalMentions' => 0,
            'weeklyMentions' => 0,
            'topAiModels' => [],
            'weeklyTrend' => 'neutral',
            'visibilityScore' => 0,
        ];

        try {
            // Current week (last 7 days)
            $currentPeriodStart = now()->subDays(7);
            $previousPeriodStart = now()->subDays(14);
            $previousPeriodEnd = now()->subDays(7);

            // Current period stats
            $currentStats = DB::table('responses')
                ->whereIn('monitor_id', $monitorIds)
                ->where('created_at', '>=', $currentPeriodStart)
                ->selectRaw('
                    SUM(CASE
                        WHEN COALESCE(brand_mention_count, 0) > 0 THEN brand_mention_count
                        WHEN brand_mentioned = true THEN 1
                        ELSE 0
                    END) as total_mentions,
                    COUNT(*) as total_responses
                ')
                ->first();

            $stats['weeklyMentions'] = (int) ($currentStats->total_mentions ?? 0);

            // Previous period for trend
            $previousStats = DB::table('responses')
                ->whereIn('monitor_id', $monitorIds)
                ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
                ->selectRaw('
                    SUM(CASE
                        WHEN COALESCE(brand_mention_count, 0) > 0 THEN brand_mention_count
                        WHEN brand_mentioned = true THEN 1
                        ELSE 0
                    END) as total_mentions
                ')
                ->first();

            $previousMentions = (int) ($previousStats->total_mentions ?? 0);

            // Calculate trend
            if ($previousMentions > 0) {
                $changePercent = (($stats['weeklyMentions'] - $previousMentions) / $previousMentions) * 100;
                if ($changePercent > 10) {
                    $stats['weeklyTrend'] = 'increasing';
                } elseif ($changePercent < -10) {
                    $stats['weeklyTrend'] = 'decreasing';
                }
            }

            // Get top AI models
            $modelStats = DB::table('responses')
                ->whereIn('monitor_id', $monitorIds)
                ->where('created_at', '>=', $currentPeriodStart)
                ->whereNotNull('model_name')
                ->selectRaw('model_name, COUNT(*) as mention_count')
                ->groupBy('model_name')
                ->orderBy('mention_count', 'desc')
                ->limit(5)
                ->get();

            $stats['topAiModels'] = $modelStats->toArray();

            // Calculate visibility score (0-100)
            $stats['visibilityScore'] = $this->calculateVisibilityScore($stats['weeklyMentions'], count($stats['topAiModels']));

            // Get total mentions (all time)
            $totalStats = DB::table('responses')
                ->whereIn('monitor_id', $monitorIds)
                ->selectRaw('
                    SUM(CASE
                        WHEN COALESCE(brand_mention_count, 0) > 0 THEN brand_mention_count
                        WHEN brand_mentioned = true THEN 1
                        ELSE 0
                    END) as total_mentions
                ')
                ->first();

            $stats['totalMentions'] = (int) ($totalStats->total_mentions ?? 0);

        } catch (\Exception $e) {
            Log::error('Failed to get mention statistics', ['error' => $e->getMessage()]);
        }

        return $stats;
    }

    /**
     * Calculate visibility score (0-100)
     */
    private function calculateVisibilityScore(int $mentions, int $aiModelCount): float
    {
        if ($mentions === 0) return 0;

        // Base score from mention count (logarithmic scale)
        $mentionScore = min(50, log10($mentions + 1) * 10);

        // Bonus for AI model diversity
        $diversityScore = min(30, $aiModelCount * 6);

        // Bonus for consistent activity
        $activityScore = $mentions > 5 ? 20 : ($mentions > 0 ? 10 : 0);

        return round(min(100, $mentionScore + $diversityScore + $activityScore), 1);
    }

    /**
     * Generate performance analysis response
     */
    private function generatePerformanceAnalysis(User $user, array $context): array
    {
        if (!$context['hasData']) {
            return [
                'content' => "I don't see enough monitoring data yet to provide a detailed performance analysis. Let's set up brand monitoring first so I can track your mentions across AI models and provide comprehensive insights!",
                'richData' => [
                    'type' => 'insight',
                    'data' => [
                        'title' => 'Start Monitoring',
                        'type' => 'recommendation',
                        'description' => 'Begin monitoring your brand to start receiving performance insights and recommendations.',
                        'action' => [
                            'text' => 'Set Up Monitoring',
                            'onClick' => 'navigate:/monitors'
                        ]
                    ]
                ]
            ];
        }

        $insightData = [
            'title' => 'Performance Overview',
            'type' => 'metric',
            'value' => $context['weeklyMentions'] . ' this week',
            'change' => [
                'value' => $context['weeklyTrend'] === 'increasing' ? 15 : ($context['weeklyTrend'] === 'decreasing' ? -8 : 0),
                'isPositive' => $context['weeklyTrend'] === 'increasing'
            ],
            'description' => "Your brand received {$context['weeklyMentions']} mentions this week. Your visibility score is {$context['visibilityScore']}/100.",
            'action' => [
                'text' => 'View Detailed Analytics',
                'onClick' => 'navigate:/analytics'
            ]
        ];

        $content = "Here's your performance breakdown:\n\n";
        $content .= "📊 **Weekly Performance**: {$context['weeklyMentions']} mentions\n";
        $content .= "📈 **Trend**: " . ucfirst($context['weeklyTrend']) . "\n";
        $content .= "🎯 **Visibility Score**: {$context['visibilityScore']}/100\n\n";

        if (!empty($context['topAiModels'])) {
            $content .= "**Top AI Models mentioning you**:\n";
            foreach ($context['topAiModels'] as $model) {
                $content .= "- {$model['model_name']}: {$model['mention_count']} mentions\n";
            }
        }

        return [
            'content' => $content,
            'richData' => [
                'type' => 'insight',
                'data' => $insightData
            ]
        ];
    }

    /**
     * Generate competitor analysis response
     */
    private function generateCompetitorAnalysis(User $user, array $context): array
    {
        if (empty($context['competitors'])) {
            return [
                'content' => "Let me help you identify and analyze your competitors. I can see you're monitoring '{$context['brandName']}', but let's identify your key competitors so I can provide detailed competitive intelligence and benchmarking insights.",
                'richData' => [
                    'type' => 'insight',
                    'data' => [
                        'title' => 'Competitor Intelligence',
                        'type' => 'recommendation',
                        'description' => 'Add competitors to your monitoring to get competitive insights and benchmarking.',
                        'action' => [
                            'text' => 'Add Competitors',
                            'onClick' => 'navigate:/competitors'
                        ]
                    ]
                ]
            ];
        }

        $content = "I can see you're monitoring {$context['competitorCount']} competitors. Here's your competitive landscape:\n\n";

        foreach (array_slice($context['competitors'], 0, 3) as $competitor) {
            $content .= "🏢 **{$competitor['name']}**\n";
            if (isset($competitor['industry'])) {
                $content .= "   Industry: {$competitor['industry']}\n";
            }
            $content .= "\n";
        }

        $content .= "I can help you:\n";
        $content .= "• Analyze their mention patterns\n";
        $content .= "• Identify content gaps\n";
        $content .= "• Find citation opportunities\n";
        $content .= "• Benchmark your performance\n\n";
        $content .= "What aspect of competitor analysis would you like to explore?";

        return [
            'content' => $content,
            'richData' => [
                'type' => 'comparison',
                'data' => $context['competitors']
            ]
        ];
    }

    /**
     * Generate visibility recommendations
     */
    private function generateVisibilityRecommendations(User $user, array $context): array
    {
        $recommendations = [];

        // Base recommendations
        $recommendations[] = "Create authoritative content about trending topics in your industry";
        $recommendations[] = "Build citations from high-authority domains that AI models reference";
        $recommendations[] = "Optimize your website for keywords that AI models frequently search for";

        // Context-specific recommendations
        if ($context['visibilityScore'] < 30) {
            $recommendations[] = "Focus on creating more shareable content to increase baseline visibility";
        }

        if (empty($context['topAiModels'])) {
            $recommendations[] = "Ensure your brand monitoring is properly set up to track AI model mentions";
        }

        $content = "Here are my top recommendations to amplify your brand's visibility:\n\n";

        foreach ($recommendations as $index => $recommendation) {
            $content .= ($index + 1) . ". {$recommendation}\n";
        }

        $content .= "\nWould you like me to elaborate on any of these strategies or create a specific action plan?";

        return [
            'content' => $content,
            'richData' => [
                'type' => 'recommendation',
                'data' => [
                    'title' => 'Visibility Optimization Strategies',
                    'type' => 'recommendation',
                    'description' => count($recommendations) . " personalized strategies to increase your AI visibility",
                    'action' => [
                        'text' => 'Create Action Plan',
                        'onClick' => 'message:Create a detailed visibility action plan for my brand'
                    ]
                ]
            ]
        ];
    }

    /**
     * Generate content ideas
     */
    private function generateContentIdeas(User $user, array $context): array
    {
        $content = "Based on your brand profile and industry trends, here are content ideas that could boost your visibility:\n\n";

        $content .= "🎯 **Trending Topics**:\n";
        $content .= "• Industry analysis and predictions\n";
        $content .= "• How-to guides for your niche\n";
        $content .= "• Case studies and success stories\n\n";

        $content .= "📝 **Content Formats**:\n";
        $content .= "• In-depth blog posts (2000+ words)\n";
        $content .= "• Research-backed whitepapers\n";
        $content .= "• Expert interviews and insights\n\n";

        $content .= "🔍 **SEO Keywords to Target**:\n";
        $content .= "• '[Your Industry] Best Practices'\n";
        $content .= "• 'How to [Solve Industry Problem]'\n";
        $content .= "• '[Your Brand] vs Competitors'\n\n";

        $content .= "Would you like me to create a detailed content strategy or draft a specific article?";

        return [
            'content' => $content,
            'richData' => [
                'type' => 'content',
                'data' => [
                    'title' => 'Content Strategy Ideas',
                    'type' => 'content',
                    'description' => 'AI-powered content recommendations to boost brand visibility',
                    'action' => [
                        'text' => 'Draft Content Strategy',
                        'onClick' => 'message:Create a comprehensive content strategy for my brand'
                    ]
                ]
            ]
        ];
    }

    /**
     * Generate strategy insights
     */
    private function generateStrategyInsights(User $user, array $context): array
    {
        $content = "Here's my strategic analysis for {$context['brandName']}:\n\n";

        $content .= "📊 **Current Position**:\n";
        $content .= "• Visibility Score: {$context['visibilityScore']}/100\n";
        $content .= "• Weekly Mentions: {$context['weeklyMentions']}\n";
        $content .= "• Trend: " . ucfirst($context['weeklyTrend']) . "\n\n";

        $content .= "🎯 **Strategic Priorities**:\n";

        if ($context['visibilityScore'] < 30) {
            $content .= "1. **Foundation Building** - Focus on creating baseline visibility\n";
        } elseif ($context['visibilityScore'] < 60) {
            $content .= "1. **Growth Optimization** - Amplify what's working\n";
        } else {
            $content .= "1. **Market Leadership** - Maintain and expand dominance\n";
        }

        $content .= "2. **Content Authority** - Become the go-to resource\n";
        $content .= "3. **AI Model Relationships** - Increase citations across platforms\n\n";

        $content .= "Which strategic area would you like to dive deeper into?";

        return [
            'content' => $content,
            'richData' => [
                'type' => 'strategy',
                'data' => [
                    'title' => 'Strategic Insights',
                    'type' => 'strategy',
                    'description' => 'Data-driven strategy recommendations based on your current performance',
                    'action' => [
                        'text' => 'Develop Strategy',
                        'onClick' => 'message:Create a detailed brand strategy for the next quarter'
                    ]
                ]
            ]
        ];
    }

    /**
     * Generate general response
     */
    private function generateGeneralResponse(User $user, array $context, string $query): array
    {
        $content = "I'm here to help you amplify {$context['brandName']}'s visibility across AI models! ";

        if ($context['hasData']) {
            $content .= "I can see you have {$context['weeklyMentions']} mentions this week. ";
        }

        $content .= "I can help you with:\n\n";
        $content .= "📊 **Performance Analysis** - Track your mentions and visibility trends\n";
        $content .= "🏢 **Competitor Intelligence** - Benchmark against competitors\n";
        $content .= "📝 **Content Strategy** - Create content that gets cited by AI\n";
        $content .= "🎯 **Optimization Recommendations** - Improve your visibility strategy\n\n";
        $content .= "What would you like to focus on?";

        return [
            'content' => $content,
            'richData' => null
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