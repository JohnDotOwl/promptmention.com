<?php

namespace App\Http\Controllers;

use App\Models\OnboardingProgress;
use App\Services\DomainAnalysisService;
use App\Services\MonitorSetupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    protected DomainAnalysisService $domainAnalysisService;
    protected MonitorSetupService $monitorSetupService;

    public function __construct(
        DomainAnalysisService $domainAnalysisService,
        MonitorSetupService $monitorSetupService
    ) {
        $this->domainAnalysisService = $domainAnalysisService;
        $this->monitorSetupService = $monitorSetupService;
    }

    public function index()
    {
        $user = Auth::user();
        $progress = $user->onboardingProgress;

        if (!$progress) {
            $progress = OnboardingProgress::create([
                'user_id' => $user->id,
                'current_step' => 1,
            ]);
        }

        if ($progress->isCompleted()) {
            return redirect('/dashboard');
        }

        return redirect("/onboarding/step/{$progress->current_step}");
    }

    public function step(int $step)
    {
        $user = Auth::user();
        $progress = $user->onboardingProgress;

        if (!$progress) {
            $progress = OnboardingProgress::create([
                'user_id' => $user->id,
                'current_step' => 1,
            ]);
        }

        if ($progress->isCompleted()) {
            return redirect('/dashboard');
        }

        if (!$progress->canAccessStep($step)) {
            return redirect("/onboarding/step/{$progress->current_step}");
        }

        $additionalData = [];
        
        // For step 3, include domain analysis data
        if ($step === 3) {
            $analysisStatus = $this->domainAnalysisService->getAnalysisStatus($user->id);
            $additionalData['domainAnalysis'] = $analysisStatus;
        }

        return Inertia::render("onboarding/Step{$step}", [
            'progress' => $progress,
            'currentStep' => $step,
            ...$additionalData,
        ]);
    }

    public function storeStep1(Request $request)
    {
        \Log::info('OnboardingController::storeStep1 called', [
            'user_id' => Auth::id(),
            'request_data' => $request->all()
        ]);

        $validated = $request->validate([
            'companyName' => 'required|string|max:255',
            'website' => 'required|url|max:255',
        ]);

        $user = Auth::user();
        \Log::info('User for onboarding step 1', [
            'user_id' => $user->id,
            'user_email' => $user->email
        ]);

        $progress = $user->onboardingProgress ?? OnboardingProgress::create(['user_id' => $user->id]);

        $progress->update([
            'company_name' => $validated['companyName'],
            'company_website' => $validated['website'],
        ]);

        \Log::info('Onboarding progress updated', [
            'progress_id' => $progress->id,
            'company_name' => $validated['companyName'],
            'company_website' => $validated['website']
        ]);

        // Create temporary monitor for onboarding (new)
        $monitorId = null;
        if ($this->tableExists('monitors')) {
            // Check if monitor already exists for this user/website
            $existingMonitor = DB::table('monitors')
                ->where('user_id', $user->id)
                ->where('website_url', $validated['website'])
                ->first();

            if (!$existingMonitor) {
                $monitorId = DB::table('monitors')->insertGetId([
                    'user_id' => $user->id,
                    'name' => $validated['companyName'] . ' Brand Monitor',
                    'website_name' => $validated['companyName'],
                    'website_url' => $validated['website'],
                    'status' => 'active',
                    'setup_status' => 'pending',
                    'description' => 'Auto-generated monitor from onboarding for ' . $validated['companyName'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Store monitor_id in progress for later use
                $progress->update(['monitor_id' => $monitorId]);
                
                \Log::info('Temporary monitor created for onboarding', [
                    'monitor_id' => $monitorId,
                    'user_id' => $user->id
                ]);
            } else {
                $monitorId = $existingMonitor->id;
                $progress->update(['monitor_id' => $monitorId]);
            }
        }

        // Create domain analysis record and queue for processing with monitor_id
        try {
            $this->domainAnalysisService->createAndQueueAnalysisWithMonitor(
                $user->id,
                $validated['companyName'],
                $validated['website'],
                $monitorId
            );
            \Log::info('Domain analysis queued successfully with monitor', [
                'user_id' => $user->id,
                'company' => $validated['companyName'],
                'monitor_id' => $monitorId
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to queue domain analysis', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        $progress->markStepCompleted(2);

        return redirect('/onboarding/step/2');
    }

    public function storeStep2(Request $request)
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'companyJobRole' => 'required|string|max:255',
            'companySize' => 'required|string|max:255',
            'language' => 'nullable|string|max:10',
            'country' => 'nullable|string|max:10',
            'referralSource' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        $progress = $user->onboardingProgress;

        $progress->update([
            'first_name' => $validated['firstName'],
            'last_name' => $validated['lastName'],
            'job_role' => $validated['companyJobRole'],
            'company_size' => $validated['companySize'],
            'language' => $validated['language'] ?? 'en-US',
            'country' => $validated['country'] ?? 'US',
            'referral_source' => $validated['referralSource'],
        ]);

        $progress->markStepCompleted(3);

        // Analyze website
        $this->analyzeWebsite($progress);

        return redirect('/onboarding/step/3');
    }

    public function completeOnboarding(Request $request)
    {
        $user = Auth::user();
        $progress = $user->onboardingProgress;

        if ($progress && $progress->current_step >= 3) {
            $progress->markCompleted();
            
            // Use existing monitor from Step 1 instead of creating new one
            $monitorId = $progress->monitor_id;
            
            if ($monitorId) {
                // Monitor is already active, just add missing components
                
                // Add default AI models if not already present
                $this->addDefaultAiModels($monitorId);
                
                // Create initial stats entry
                $this->createInitialStats($monitorId);
                
                \Log::info('Monitor setup completed from onboarding', [
                    'user_id' => $user->id,
                    'monitor_id' => $monitorId,
                    'company_name' => $progress->company_name
                ]);
                
                // Note: Domain analysis and prompt generation were already triggered in Step 1
                // No need to queue monitor setup again
            } else {
                // Fallback: create monitor if not found (shouldn't happen in normal flow)
                $monitorId = $this->createMonitorFromOnboarding($user, $progress);
                
                if ($monitorId) {
                    $this->monitorSetupService->queueMonitorSetup(
                        $monitorId,
                        $progress->company_name,
                        $progress->company_website
                    );
                    
                    \Log::warning('Had to create monitor at completion - monitor_id was missing', [
                        'user_id' => $user->id,
                        'monitor_id' => $monitorId
                    ]);
                }
            }
        }

        return redirect('/dashboard');
    }

    /**
     * Retry domain analysis for users stuck at step 3
     */
    public function retryAnalysis(Request $request)
    {
        $user = Auth::user();
        $progress = $user->onboardingProgress;

        if (!$progress || $progress->current_step < 3) {
            return response()->json(['error' => 'Invalid onboarding state'], 400);
        }

        \Log::info('Retry analysis requested', [
            'user_id' => $user->id,
            'company_name' => $progress->company_name,
            'company_website' => $progress->company_website
        ]);

        // Force retry the domain analysis
        try {
            $this->domainAnalysisService->createAndQueueAnalysis(
                $user->id,
                $progress->company_name,
                $progress->company_website
            );
            
            return response()->json(['message' => 'Analysis retry queued successfully'], 200);
        } catch (\Exception $e) {
            \Log::error('Failed to retry analysis', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Failed to retry analysis'], 500);
        }
    }

    /**
     * Retry monitor creation for users who completed onboarding but don't have monitors
     */
    public function retryMonitorCreation(Request $request)
    {
        $user = Auth::user();
        $progress = $user->onboardingProgress;

        if (!$progress || !$progress->isCompleted()) {
            return response()->json(['error' => 'Onboarding not completed'], 400);
        }

        // Check if user already has monitors
        if ($this->tableExists('monitors')) {
            $existingMonitors = DB::table('monitors')
                ->where('user_id', $user->id)
                ->count();
            
            if ($existingMonitors > 0) {
                return response()->json(['message' => 'User already has monitors'], 200);
            }
        }

        // Try to create monitor from onboarding data
        $monitorId = $this->createMonitorFromOnboarding($user, $progress);

        if ($monitorId) {
            return response()->json(['message' => 'Monitor created successfully', 'monitor_id' => $monitorId], 200);
        } else {
            return response()->json(['error' => 'Failed to create monitor'], 500);
        }
    }

    /**
     * Create a monitor automatically from onboarding data
     */
    private function createMonitorFromOnboarding($user, OnboardingProgress $progress)
    {
        // Check if monitors table exists before creating monitor
        if (!$this->tableExists('monitors')) {
            return null; // Skip monitor creation if table doesn't exist
        }

        // Create the monitor record using Query Builder
        $monitorId = DB::table('monitors')->insertGetId([
            'user_id' => $user->id,
            'name' => $progress->company_name . ' Brand Monitor',
            'website_name' => $progress->company_name,
            'website_url' => $progress->company_website,
            'status' => 'active',
            'description' => 'Auto-generated monitor from onboarding for ' . $progress->company_name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Add default AI models to the monitor
        if ($this->tableExists('monitor_ai_models')) {
            $defaultAiModels = [
                [
                    'ai_model_id' => 'gemini-2.5-flash',
                    'ai_model_name' => 'Gemini 2.5 Flash',
                    'ai_model_icon' => '/llm-icons/google.svg'
                ]
            ];

            foreach ($defaultAiModels as $model) {
                DB::table('monitor_ai_models')->insert([
                    'monitor_id' => $monitorId,
                    'ai_model_id' => $model['ai_model_id'],
                    'ai_model_name' => $model['ai_model_name'],
                    'ai_model_icon' => $model['ai_model_icon'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Create initial stats entry with default values
        if ($this->tableExists('monitor_stats')) {
            DB::table('monitor_stats')->insert([
                'monitor_id' => $monitorId,
                'date' => now()->toDateString(),
                'visibility_score' => 0,
                'total_prompts' => 0,
                'total_responses' => 0,
                'mentions' => 0,
                'avg_citation_rank' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $monitorId;
    }

    /**
     * Add default AI models to monitor if not already present
     */
    private function addDefaultAiModels(int $monitorId): void
    {
        if (!$this->tableExists('monitor_ai_models')) {
            return;
        }

        // Check if models already exist
        $existingCount = DB::table('monitor_ai_models')
            ->where('monitor_id', $monitorId)
            ->count();

        if ($existingCount > 0) {
            return; // Models already added
        }

        $defaultAiModels = [
            [
                'ai_model_id' => 'gemini-2.5-flash',
                'ai_model_name' => 'Gemini 2.5 Flash',
                'ai_model_icon' => '/llm-icons/google.svg'
            ]
        ];

        foreach ($defaultAiModels as $model) {
            DB::table('monitor_ai_models')->insert([
                'monitor_id' => $monitorId,
                'ai_model_id' => $model['ai_model_id'],
                'ai_model_name' => $model['ai_model_name'],
                'ai_model_icon' => $model['ai_model_icon'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Create initial stats entry for monitor
     */
    private function createInitialStats(int $monitorId): void
    {
        if (!$this->tableExists('monitor_stats')) {
            return;
        }

        // Check if stats already exist
        $existingStats = DB::table('monitor_stats')
            ->where('monitor_id', $monitorId)
            ->where('date', now()->toDateString())
            ->exists();

        if ($existingStats) {
            return; // Stats already exist
        }

        DB::table('monitor_stats')->insert([
            'monitor_id' => $monitorId,
            'date' => now()->toDateString(),
            'visibility_score' => 0,
            'total_prompts' => 0,
            'total_responses' => 0,
            'mentions' => 0,
            'avg_citation_rank' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
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

    // NOTE: This method is deprecated - using MonitorSetupService instead
    // which combines domain analysis and prompt generation in a single job
    /*
    private function queuePromptGeneration($user, OnboardingProgress $progress, int $monitorId)
    {
        // Deprecated - see MonitorSetupService::queueMonitorSetup()
    }
    */

    private function analyzeWebsite(OnboardingProgress $progress)
    {
        try {
            // Simple website analysis - in a real app, you might use a more sophisticated service
            $response = Http::timeout(10)->get($progress->company_website);
            
            if ($response->successful()) {
                $content = $response->body();
                
                // Basic analysis
                $analysis = [
                    'title' => $this->extractTitle($content),
                    'description' => $this->extractDescription($content),
                    'industry' => $this->guessIndustry($content),
                ];

                $progress->update([
                    'website_analysis' => $analysis,
                    'company_description' => $analysis['description'] ?? 'No description found.',
                    'industry' => $analysis['industry'] ?? 'General Business',
                ]);
            }
        } catch (\Exception $e) {
            // Fallback if analysis fails
            $progress->update([
                'company_description' => 'Website analysis unavailable.',
                'industry' => 'General Business',
            ]);
        }
    }

    private function extractTitle(string $content): ?string
    {
        if (preg_match('/<title[^>]*>(.*?)<\/title>/i', $content, $matches)) {
            return trim(strip_tags($matches[1]));
        }
        return null;
    }

    private function extractDescription(string $content): ?string
    {
        if (preg_match('/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i', $content, $matches)) {
            return trim($matches[1]);
        }
        return null;
    }

    private function guessIndustry(string $content): string
    {
        $industries = [
            'HR Management Software' => ['hr', 'payroll', 'employee', 'management', 'human resources'],
            'Technology' => ['software', 'tech', 'developer', 'app', 'platform', 'digital'],
            'E-commerce' => ['shop', 'store', 'buy', 'sell', 'product', 'ecommerce'],
            'Finance' => ['finance', 'bank', 'loan', 'investment', 'money'],
            'Healthcare' => ['health', 'medical', 'doctor', 'patient', 'clinic'],
            'Education' => ['education', 'school', 'learn', 'course', 'training'],
            'Marketing' => ['marketing', 'advertising', 'campaign', 'promotion'],
        ];

        $content = strtolower($content);
        
        foreach ($industries as $industry => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($content, $keyword)) {
                    return $industry;
                }
            }
        }

        return 'General Business';
    }
}
