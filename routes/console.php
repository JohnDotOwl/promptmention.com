<?php

use App\Models\User;
use App\Models\OnboardingProgress;
use App\Models\DomainAnalysis;
use App\Services\DomainAnalysisService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

// Schedule commands
Schedule::command('monitors:cleanup-orphaned --hours=24')->daily();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('onboarding:reset {--user=} {--email=} {--all} {--onboarding-only} {--domain-analysis-only} {--force}', function () {
    $userId = $this->option('user');
    $email = $this->option('email');
    $all = $this->option('all');
    $onboardingOnly = $this->option('onboarding-only');
    $domainAnalysisOnly = $this->option('domain-analysis-only');
    $force = $this->option('force');

    // Validate options
    if (!$userId && !$email && !$all) {
        $this->error('Please specify --user=ID, --email=user@example.com, or --all');
        return 1;
    }

    if (($userId ? 1 : 0) + ($email ? 1 : 0) + ($all ? 1 : 0) > 1) {
        $this->error('Please specify only one of: --user, --email, or --all');
        return 1;
    }

    // Get target users
    $users = collect();
    
    if ($userId) {
        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return 1;
        }
        $users->push($user);
    } elseif ($email) {
        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("User with email {$email} not found");
            return 1;
        }
        $users->push($user);
    } elseif ($all) {
        $users = User::all();
        if ($users->isEmpty()) {
            $this->warn('No users found');
            return 0;
        }
    }

    // Show what will be reset
    $this->info('Target users:');
    foreach ($users as $user) {
        $this->line("- {$user->name} ({$user->email}) [ID: {$user->id}]");
    }

    $actions = [];
    if ($onboardingOnly) {
        $actions[] = 'Reset onboarding progress';
    } elseif ($domainAnalysisOnly) {
        $actions[] = 'Clear domain analysis records';
    } else {
        $actions[] = 'Reset onboarding progress';
        $actions[] = 'Clear form data';
        $actions[] = 'Clear domain analysis records';
    }
    

    $this->info('Actions to perform:');
    foreach ($actions as $action) {
        $this->line("- {$action}");
    }

    // Confirmation
    if (!$force) {
        if (!$this->confirm('Are you sure you want to proceed?')) {
            $this->info('Operation cancelled');
            return 0;
        }
    }

    // Process each user
    $resetCount = 0;
    foreach ($users as $user) {
        try {
            DB::beginTransaction();

            if (!$domainAnalysisOnly) {
                // Reset onboarding progress
                $progress = $user->onboardingProgress;
                if ($progress) {
                    if ($onboardingOnly) {
                        // Only reset step and completion status
                        $progress->update([
                            'current_step' => 1,
                            'completed_at' => null,
                        ]);
                    } else {
                        // Clear all form data as well
                        $progress->update([
                            'current_step' => 1,
                            'completed_at' => null,
                            'company_name' => null,
                            'company_website' => null,
                            'first_name' => null,
                            'last_name' => null,
                            'job_role' => null,
                            'company_size' => null,
                            'language' => null,
                            'country' => null,
                            'referral_source' => null,
                            'company_description' => null,
                            'industry' => null,
                            'website_analysis' => null,
                        ]);
                    }
                } else {
                    // Create fresh onboarding progress record
                    OnboardingProgress::create([
                        'user_id' => $user->id,
                        'current_step' => 1,
                    ]);
                }
            }

            if (!$onboardingOnly) {
                // Clear domain analysis records
                DomainAnalysis::where('user_id', $user->id)->delete();
            }

            DB::commit();
            $resetCount++;
            $this->info("✓ Reset data for {$user->name} ({$user->email})");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("✗ Failed to reset data for {$user->name}: {$e->getMessage()}");
        }
    }


    $this->info("Successfully reset data for {$resetCount} user(s)");
    return 0;

})->purpose('Reset onboarding data for testing purposes');

Artisan::command('onboarding:test-queue {company?} {website?} {--user=}', function () {
    $companyName = $this->argument('company') ?? 'Test Company Inc';
    $website = $this->argument('website') ?? 'https://example.com';
    $userId = $this->option('user');

    // If no user specified, get the first available user
    if (!$userId) {
        $user = User::first();
        if (!$user) {
            $this->error('No users found. Please create a user first.');
            return 1;
        }
        $userId = $user->id;
        $this->info("Using user: {$user->name} ({$user->email}) [ID: {$userId}]");
    } else {
        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return 1;
        }
        $this->info("Using user: {$user->name} ({$user->email}) [ID: {$userId}]");
    }

    $this->info("Queueing domain analysis for:");
    $this->line("Company: {$companyName}");
    $this->line("Website: {$website}");

    try {
        // Use the DomainAnalysisService to create and queue analysis
        $domainAnalysisService = app(DomainAnalysisService::class);
        
        $analysis = $domainAnalysisService->createAndQueueAnalysis(
            $userId,
            $companyName,
            $website
        );

        $this->info("✓ Successfully queued domain analysis");
        $this->line("Analysis ID: {$analysis->id}");
        $this->line("Status: {$analysis->status}");
        
        // Check Redis queue
        $queueLength = \Illuminate\Support\Facades\Redis::llen('domain_search_queue');
        $this->info("Redis queue length: {$queueLength}");
        
        if ($queueLength > 0) {
            $this->info("✓ Job successfully added to Redis queue");
            $this->warn("Next step: Run the Python consumer to process the job:");
            $this->line("cd /var/www/backend && python3 domain_search_consumer.py");
        } else {
            $this->warn("Queue appears empty - check Redis connection");
        }

    } catch (\Exception $e) {
        $this->error("Failed to queue domain analysis: {$e->getMessage()}");
        return 1;
    }

    return 0;
})->purpose('Test domain analysis queue by pushing a job to Redis');
