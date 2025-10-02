<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the user's profile with company and onboarding data.
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

        // Get user's monitors for additional context
        $monitors = [];
        if ($this->tableExists('monitors')) {
            $monitors = DB::table('monitors')
                ->select([
                    'monitors.id',
                    'monitors.name',
                    'monitors.website_name',
                    'monitors.website_url',
                    'monitors.status',
                    'monitors.created_at'
                ])
                ->where('monitors.user_id', $userId)
                ->orderBy('monitors.created_at', 'desc')
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
                        'createdAt' => date('M j, Y', strtotime($monitor->created_at))
                    ];
                })
                ->toArray();
        }

        // Prepare profile data
        $profileData = [
            'user' => [
                'name' => Auth::user()->name ?? null,
                'email' => Auth::user()->email ?? null,
                'avatar' => Auth::user()->avatar ?? null,
                'firstName' => $onboardingProgress->first_name ?? null,
                'lastName' => $onboardingProgress->last_name ?? null,
                'jobRole' => $onboardingProgress->job_role ?? null,
                'companySize' => $onboardingProgress->company_size ?? null,
                'language' => $onboardingProgress->language ?? null,
                'country' => $onboardingProgress->country ?? null,
                'referralSource' => $onboardingProgress->referral_source ?? null,
            ],
            'company' => [
                'name' => $onboardingProgress->company_name ?? null,
                'website' => $onboardingProgress->company_website ?? null,
                'description' => $onboardingProgress->company_description ?? null,
                'industry' => $onboardingProgress->industry ?? null,
                'websiteAnalysis' => $onboardingProgress->website_analysis ? json_decode($onboardingProgress->website_analysis, true) : null,
            ],
            'domainAnalysis' => $domainAnalysis ? [
                'summary' => $domainAnalysis->summary,
                'industry' => $domainAnalysis->industry,
                'keywords' => $domainAnalysis->keywords ? json_decode($domainAnalysis->keywords, true) : [],
                'competitors' => $domainAnalysis->competitors ? json_decode($domainAnalysis->competitors, true) : [],
                'analysisData' => $domainAnalysis->analysis_data ? json_decode($domainAnalysis->analysis_data, true) : null,
                'status' => $domainAnalysis->status,
                'processedAt' => $domainAnalysis->processed_at,
                'createdAt' => $domainAnalysis->created_at,
            ] : null,
            'monitors' => $monitors,
            'onboardingCompleted' => $onboardingProgress && !is_null($onboardingProgress->completed_at),
            'hasData' => ($onboardingProgress && $onboardingProgress->company_name) || !empty($monitors)
        ];

        return Inertia::render('profile', $profileData);
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