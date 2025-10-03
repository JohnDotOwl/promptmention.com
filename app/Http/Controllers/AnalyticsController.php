<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    /**
     * Display the analytics page
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        return Inertia::render('analytics', [
            'shareOfVoiceData' => $this->getShareOfVoice($user)
        ]);
    }

    /**
     * Calculate Share of Voice for analytics
     */
    private function getShareOfVoice($user): array
    {
        try {
            // Get user's monitors
            $monitorIds = [];
            if ($this->tableExists('monitors')) {
                $monitorIds = DB::table('monitors')
                    ->where('user_id', $user->id)
                    ->pluck('id')
                    ->toArray();
            }

            if (empty($monitorIds)) {
                return [
                    'ourBrand' => 0,
                    'otherBrands' => 100,
                    'trend' => 0,
                    'isPositive' => false,
                    'ourBrandMentions' => 0,
                    'totalMentions' => 0,
                ];
            }

            // Define time periods
            $currentPeriodStart = now()->subDays(7);
            $previousPeriodStart = now()->subDays(14);
            $previousPeriodEnd = now()->subDays(7);

            // Current period calculations
            $currentBrandMentions = 0;
            $currentCompetitorMentions = 0;

            if ($this->tableExists('responses')) {
                // Get brand mentions from current period - use brand_mentioned flag when count is 0
                $currentStats = DB::table('responses')
                    ->whereIn('monitor_id', $monitorIds)
                    ->where('created_at', '>=', $currentPeriodStart)
                    ->selectRaw('
                        SUM(CASE
                            WHEN COALESCE(brand_mention_count, 0) > 0 THEN brand_mention_count
                            WHEN brand_mentioned = true THEN 1
                            ELSE 0
                        END) as total_brand_mentions,
                        COUNT(*) as total_responses
                    ')
                    ->first();

                $currentBrandMentions = (int) ($currentStats->total_brand_mentions ?? 0);

                // Get competitor mentions from JSON field
                $responsesWithCompetitors = DB::table('responses')
                    ->whereIn('monitor_id', $monitorIds)
                    ->where('created_at', '>=', $currentPeriodStart)
                    ->whereNotNull('competitors_mentioned')
                    ->whereRaw("competitors_mentioned::text != 'null'")
                    ->pluck('competitors_mentioned');

                foreach ($responsesWithCompetitors as $competitorsJson) {
                    $competitors = json_decode($competitorsJson, true);
                    if (is_array($competitors)) {
                        $currentCompetitorMentions += count($competitors);
                    }
                }
            }

            // Previous period calculations for trend
            $previousBrandMentions = 0;
            $previousCompetitorMentions = 0;

            if ($this->tableExists('responses')) {
                $previousStats = DB::table('responses')
                    ->whereIn('monitor_id', $monitorIds)
                    ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
                    ->selectRaw('
                        SUM(CASE
                            WHEN COALESCE(brand_mention_count, 0) > 0 THEN brand_mention_count
                            WHEN brand_mentioned = true THEN 1
                            ELSE 0
                        END) as total_brand_mentions,
                        COUNT(*) as total_responses
                    ')
                    ->first();

                $previousBrandMentions = (int) ($previousStats->total_brand_mentions ?? 0);

                // Get competitor mentions from previous period
                $previousResponsesWithCompetitors = DB::table('responses')
                    ->whereIn('monitor_id', $monitorIds)
                    ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
                    ->whereNotNull('competitors_mentioned')
                    ->whereRaw("competitors_mentioned::text != 'null'")
                    ->pluck('competitors_mentioned');

                foreach ($previousResponsesWithCompetitors as $competitorsJson) {
                    $competitors = json_decode($competitorsJson, true);
                    if (is_array($competitors)) {
                        $previousCompetitorMentions += count($competitors);
                    }
                }
            }

            // Calculate totals
            $currentTotalMentions = $currentBrandMentions + $currentCompetitorMentions;
            $previousTotalMentions = $previousBrandMentions + $previousCompetitorMentions;

            // Calculate share of voice percentages
            $ourBrandShare = 0;
            $otherBrandsShare = 100;

            if ($currentTotalMentions > 0) {
                $ourBrandShare = round(($currentBrandMentions / $currentTotalMentions) * 100, 1);
                $otherBrandsShare = round(100 - $ourBrandShare, 1);
            }

            // Calculate trend
            $trend = 0;
            $isPositive = false;

            if ($previousTotalMentions > 0) {
                $previousShare = ($previousBrandMentions / $previousTotalMentions) * 100;
                $trend = round($ourBrandShare - $previousShare, 1);
                $isPositive = $trend > 0;
            }

            return [
                'ourBrand' => $ourBrandShare,
                'otherBrands' => $otherBrandsShare,
                'trend' => abs($trend),
                'isPositive' => $isPositive,
                'ourBrandMentions' => $currentBrandMentions,
                'totalMentions' => $currentTotalMentions,
            ];

        } catch (\Exception $e) {
            \Log::error('Failed to calculate Share of Voice for Analytics', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return [
                'ourBrand' => 0,
                'otherBrands' => 100,
                'trend' => 0,
                'isPositive' => false,
                'ourBrandMentions' => 0,
                'totalMentions' => 0,
            ];
        }
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
