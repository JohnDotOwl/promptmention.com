<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CompetitorsController extends Controller
{
    /**
     * Display competitor analysis data.
     */
    public function index()
    {
        $userId = Auth::id();

        // Get user's onboarding progress
        $onboardingProgress = null;
        if ($this->tableExists('onboarding_progress')) {
            $onboardingProgress = DB::table('onboarding_progress')
                ->where('user_id', $userId)
                ->first();
        }

        // Get domain analysis data
        $domainAnalysis = null;
        if ($this->tableExists('domain_analysis')) {
            $domainAnalysis = DB::table('domain_analysis')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->first();
        }

        // Get user's monitors for competitor data
        $monitors = [];
        if ($this->tableExists('monitors')) {
            $monitors = DB::table('monitors')
                ->select([
                    'monitors.id',
                    'monitors.name',
                    'monitors.website_name',
                    'monitors.website_url',
                    'monitors.status',
                    'monitors.competitors',
                    'monitors.created_at'
                ])
                ->where('monitors.user_id', $userId)
                ->orderBy('monitors.created_at', 'desc')
                ->get()
                ->map(function ($monitor) {
                    $monitorCompetitors = $monitor->competitors ? json_decode($monitor->competitors, true) : [];

                    return [
                        'id' => $monitor->id,
                        'name' => $monitor->name,
                        'website' => [
                            'name' => $monitor->website_name,
                            'url' => $monitor->website_url
                        ],
                        'status' => $monitor->status,
                        'competitors' => $monitorCompetitors,
                        'competitorCount' => count($monitorCompetitors),
                        'createdAt' => date('M j, Y', strtotime($monitor->created_at))
                    ];
                })
                ->toArray();
        }

        // Extract and process competitor data
        $competitors = [];
        $industry = null;

        if ($domainAnalysis && $domainAnalysis->competitors) {
            $domainCompetitors = json_decode($domainAnalysis->competitors, true);
            if (is_array($domainCompetitors)) {
                $competitors = array_map(function($competitor) use ($domainAnalysis) {
                    // Handle both string domains and competitor objects
                    if (is_string($competitor)) {
                        // Extract company name from domain
                        $domain = $competitor;
                        $companyName = $this->extractCompanyNameFromDomain($domain);
                        $website = $this->formatWebsiteUrl($domain);
                        $description = $this->generateCompetitorDescription($companyName, $domainAnalysis->industry);

                        return [
                            'name' => $companyName,
                            'website' => $website,
                            'description' => $description,
                            'industry' => $domainAnalysis->industry,
                            'source' => 'domain_analysis'
                        ];
                    } elseif (is_array($competitor)) {
                        // Handle existing competitor objects
                        return [
                            'name' => $competitor['name'] ?? 'Unknown',
                            'website' => isset($competitor['website']) ? $this->formatWebsiteUrl($competitor['website']) : null,
                            'description' => $competitor['description'] ?? null,
                            'industry' => $competitor['industry'] ?? $domainAnalysis->industry,
                            'source' => 'domain_analysis'
                        ];
                    } else {
                        return [
                            'name' => 'Unknown',
                            'website' => null,
                            'description' => null,
                            'industry' => $domainAnalysis->industry,
                            'source' => 'domain_analysis'
                        ];
                    }
                }, $domainCompetitors);
            }
            $industry = $domainAnalysis->industry;
        } elseif ($onboardingProgress) {
            $industry = $onboardingProgress->industry;
        }

        // Collect competitors from monitors
        foreach ($monitors as $monitor) {
            foreach ($monitor['competitors'] as $monitorCompetitor) {
                $competitorName = $monitorCompetitor['name'] ?? 'Unknown';

                // Avoid duplicates
                $exists = false;
                foreach ($competitors as $existing) {
                    if ($existing['name'] === $competitorName) {
                        $exists = true;
                        break;
                    }
                }

                if (!$exists) {
                    $competitors[] = [
                        'name' => $competitorName,
                        'website' => $monitorCompetitor['website'] ?? null,
                        'description' => $monitorCompetitor['description'] ?? null,
                        'industry' => $monitorCompetitor['industry'] ?? null,
                        'source' => 'monitor',
                        'monitorName' => $monitor['name']
                    ];
                }
            }
        }

        // Calculate stats
        $totalCompetitors = count($competitors);
        $activeMonitors = count(array_filter($monitors, fn($m) => $m['status'] === 'active'));
        $totalMonitorCompetitors = array_sum(array_column($monitors, 'competitorCount'));

        // Prepare competitor analysis data
        $competitorData = [
            'user' => [
                'company' => [
                    'name' => $onboardingProgress?->company_name ?? null,
                    'website' => $onboardingProgress?->company_website ?? null,
                    'industry' => $industry,
                ]
            ],
            'competitors' => $competitors,
            'stats' => [
                'totalCompetitors' => $totalCompetitors,
                'activeMonitors' => $activeMonitors,
                'totalMonitorCompetitors' => $totalMonitorCompetitors,
                'monitorsCount' => count($monitors)
            ],
            'domainAnalysis' => $domainAnalysis ? [
                'summary' => $domainAnalysis->summary,
                'keywords' => $domainAnalysis->keywords ? json_decode($domainAnalysis->keywords, true) : [],
                'status' => $domainAnalysis->status,
                'processedAt' => $domainAnalysis->processed_at,
            ] : null,
            'monitors' => $monitors,
            'onboardingCompleted' => $onboardingProgress && !is_null($onboardingProgress->completed_at),
            'hasData' => !empty($competitors) || !empty($monitors) || ($domainAnalysis && $domainAnalysis->status === 'completed')
        ];

        return Inertia::render('competitors', $competitorData);
    }

    /**
     * Extract company name from domain
     */
    private function extractCompanyNameFromDomain(string $domain): string
    {
        // Remove protocol and www, then extract domain name
        $domain = preg_replace('/^https?:\/\//', '', $domain);
        $domain = preg_replace('/^www\./', '', $domain);

        // Extract the main domain part (before TLD)
        $parts = explode('.', $domain);
        if (count($parts) >= 2) {
            $companyName = $parts[0];

            // Capitalize properly (nvidia -> NVIDIA, graphcore -> Graphcore, etc.)
            $companyName = strtoupper($companyName);

            // Handle special cases
            $specialCases = [
                'NVIDIA' => 'NVIDIA',
                'GRAPHCORE' => 'Graphcore',
                'GROQ' => 'Groq',
                'AMD' => 'AMD',
                'IBM' => 'IBM',
                'HP' => 'HP',
                'AI' => 'AI'
            ];

            return $specialCases[$companyName] ?? ucfirst(strtolower($companyName));
        }

        return ucfirst($domain);
    }

    /**
     * Format website URL with proper protocol
     */
    private function formatWebsiteUrl(string $url): string
    {
        // Add protocol if missing
        if (!preg_match('/^https?:\/\//', $url)) {
            return 'https://' . $url;
        }
        return $url;
    }

    /**
     * Generate competitor description based on company name and industry
     */
    private function generateCompetitorDescription(string $companyName, string $industry): string
    {
        $descriptions = [
            'Artificial Intelligence (AI) and Semiconductor' => [
                'Leading semiconductor company specializing in AI chips and processors.',
                'AI hardware manufacturer developing advanced computing solutions.',
                'Technology company focused on AI acceleration and machine learning infrastructure.',
                'Innovative semiconductor company building next-generation AI processors.'
            ],
            'Technology' => [
                'Technology company developing innovative software and hardware solutions.',
                'Leading tech firm specializing in digital transformation and innovation.',
                'Software and technology provider for modern businesses.',
                'Technology company focused on cutting-edge digital solutions.'
            ],
            'E-commerce' => [
                'E-commerce platform providing online shopping solutions.',
                'Digital retail company offering innovative shopping experiences.',
                'Online marketplace connecting buyers and sellers globally.',
                'E-commerce technology company specializing in retail solutions.'
            ],
            'default' => [
                'Competitive company in the {industry} sector.',
                'Leading business operating in {industry}.',
                'Key player in the {industry} industry.',
                'Innovative company in the {industry} space.'
            ]
        ];

        $industryKey = $industry ?? 'default';
        $descriptionList = $descriptions[$industryKey] ?? $descriptions['default'];

        // Select a random description or use the first one
        $description = $descriptionList[array_rand($descriptionList)];

        // Replace placeholder if using default description
        if ($industryKey === 'default') {
            $description = str_replace('{industry}', strtolower($industry ?? 'technology'), $description);
        }

        return $description;
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
}