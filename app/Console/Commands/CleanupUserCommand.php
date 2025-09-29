<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class CleanupUserCommand extends Command
{
    protected $signature = 'user:cleanup {user_id?} {--dry-run : Preview what would be deleted without actually deleting}';
    
    protected $description = 'Completely remove a user and all their related data from the database';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $dryRun = $this->option('dry-run');
        
        // If no user ID provided, show interactive selection
        if (!$userId) {
            $userId = $this->selectUser();
            if (!$userId) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }
        
        // Find user
        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return 1;
        }
        
        $this->info("Found user: {$user->name} ({$user->email})");
        
        if ($dryRun) {
            $this->warn("DRY RUN MODE - No data will be deleted");
        }
        
        // Get counts before deletion
        $counts = $this->getRecordCounts($userId);
        
        // Display what will be deleted
        $this->displayDeletionSummary($counts);
        
        if ($dryRun) {
            $this->info("Dry run complete. No data was deleted.");
            return 0;
        }
        
        // Confirm deletion
        if (!$this->confirmDeletion()) {
            $this->info("Operation cancelled.");
            return 0;
        }
        
        // Perform deletion
        return $this->performDeletion($userId, $user, $counts);
    }
    
    private function getRecordCounts($userId)
    {
        $counts = [];
        
        // Get monitor IDs for this user
        $monitorIds = DB::table('monitors')->where('user_id', $userId)->pluck('id');
        
        // Count records in each table
        $counts['onboarding_progress'] = DB::table('onboarding_progress')->where('user_id', $userId)->count();
        $counts['domain_analysis'] = DB::table('domain_analysis')->where('user_id', $userId)->count();
        $counts['monitors'] = DB::table('monitors')->where('user_id', $userId)->count();
        $counts['prompt_generation_requests'] = DB::table('prompt_generation_requests')->where('user_id', $userId)->count();
        
        // Count related monitor records
        if ($monitorIds->isNotEmpty()) {
            $counts['monitor_ai_models'] = DB::table('monitor_ai_models')->whereIn('monitor_id', $monitorIds)->count();
            $counts['monitor_stats'] = DB::table('monitor_stats')->whereIn('monitor_id', $monitorIds)->count();
            $counts['monitor_chart_data'] = DB::table('monitor_chart_data')->whereIn('monitor_id', $monitorIds)->count();
            $counts['monitor_citations'] = DB::table('monitor_citations')->whereIn('monitor_id', $monitorIds)->count();
            $counts['prompts'] = DB::table('prompts')->whereIn('monitor_id', $monitorIds)->count();
        } else {
            $counts['monitor_ai_models'] = 0;
            $counts['monitor_stats'] = 0;
            $counts['monitor_chart_data'] = 0;
            $counts['monitor_citations'] = 0;
            $counts['prompts'] = 0;
        }
        
        // Count password reset tokens
        $userEmail = DB::table('users')->where('id', $userId)->value('email');
        $counts['password_reset_tokens'] = DB::table('password_reset_tokens')->where('email', $userEmail)->count();
        
        return $counts;
    }
    
    private function showUserList()
    {
        $users = User::select(['id', 'name', 'email', 'created_at', 'google_id', 'waitlist_joined_at'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
            
        if ($users->isEmpty()) {
            $this->warn('No users found in the database.');
            return;
        }
        
        $this->info('Recent Users:');
        $this->line('┌────┬─────────────────────────┬─────────────────────────────┬──────────┬────────────┬────────────┐');
        $this->line('│ ID │ Name                    │ Email                       │ Records  │ OAuth      │ Registered │');
        $this->line('├────┼─────────────────────────┼─────────────────────────────┼──────────┼────────────┼────────────┤');
        
        foreach ($users as $user) {
            $recordCount = $this->getUserRecordCount($user->id);
            $oauthStatus = $user->google_id ? 'Google' : 'Local';
            $registeredDate = $user->created_at->format('M j, Y');
            
            $this->line(sprintf(
                '│ %2d │ %-23s │ %-27s │ %8d │ %-10s │ %-10s │',
                $user->id,
                $this->truncate($user->name, 23),
                $this->truncate($user->email, 27),
                $recordCount,
                $oauthStatus,
                $registeredDate
            ));
        }
        
        $this->line('└────┴─────────────────────────┴─────────────────────────────┴──────────┴────────────┴────────────┘');
    }
    
    private function selectUser()
    {
        $this->showUserList();
        
        $userId = $this->ask('Enter the User ID to cleanup (or press Enter to cancel)');
        
        if (empty($userId)) {
            return null;
        }
        
        if (!is_numeric($userId)) {
            $this->error('Invalid user ID. Please enter a number.');
            return $this->selectUser();
        }
        
        return (int) $userId;
    }
    
    private function getUserRecordCount($userId)
    {
        $counts = $this->getRecordCounts($userId);
        return array_sum($counts);
    }
    
    private function truncate($text, $length)
    {
        if (strlen($text) <= $length) {
            return $text;
        }
        return substr($text, 0, $length - 3) . '...';
    }
    
    private function displayDeletionSummary($counts)
    {
        $this->info("Records to be deleted:");
        $this->line("┌─────────────────────────────┬───────┐");
        $this->line("│ Table                       │ Count │");
        $this->line("├─────────────────────────────┼───────┤");
        
        foreach ($counts as $table => $count) {
            $this->line(sprintf("│ %-27s │ %5d │", $table, $count));
        }
        
        $this->line("└─────────────────────────────┴───────┘");
        
        $total = array_sum($counts);
        $this->info("Total records: {$total}");
    }
    
    private function confirmDeletion()
    {
        $this->warn("⚠️  WARNING: This action cannot be undone!");
        $this->warn("⚠️  This will permanently delete all user data from the database.");
        
        return $this->confirm("Are you sure you want to proceed?");
    }
    
    private function performDeletion($userId, $user, $counts)
    {
        try {
            DB::beginTransaction();
            
            $this->info("Starting deletion process...");
            
            // Get monitor IDs for this user
            $monitorIds = DB::table('monitors')->where('user_id', $userId)->pluck('id');
            
            // Delete in order to respect foreign key constraints
            $deletedCounts = [];
            
            // 1. Delete prompts (linked to monitors)
            if ($monitorIds->isNotEmpty()) {
                $deletedCounts['prompts'] = DB::table('prompts')->whereIn('monitor_id', $monitorIds)->delete();
                $this->line("✓ Deleted {$deletedCounts['prompts']} prompts");
            }
            
            // 2. Delete monitor-related records (will cascade)
            if ($monitorIds->isNotEmpty()) {
                $deletedCounts['monitor_ai_models'] = DB::table('monitor_ai_models')->whereIn('monitor_id', $monitorIds)->delete();
                $this->line("✓ Deleted {$deletedCounts['monitor_ai_models']} monitor AI models");
                
                $deletedCounts['monitor_stats'] = DB::table('monitor_stats')->whereIn('monitor_id', $monitorIds)->delete();
                $this->line("✓ Deleted {$deletedCounts['monitor_stats']} monitor stats");
                
                $deletedCounts['monitor_chart_data'] = DB::table('monitor_chart_data')->whereIn('monitor_id', $monitorIds)->delete();
                $this->line("✓ Deleted {$deletedCounts['monitor_chart_data']} monitor chart data");
                
                $deletedCounts['monitor_citations'] = DB::table('monitor_citations')->whereIn('monitor_id', $monitorIds)->delete();
                $this->line("✓ Deleted {$deletedCounts['monitor_citations']} monitor citations");
            }
            
            // 3. Delete monitors
            $deletedCounts['monitors'] = DB::table('monitors')->where('user_id', $userId)->delete();
            $this->line("✓ Deleted {$deletedCounts['monitors']} monitors");
            
            // 4. Delete prompt generation requests
            $deletedCounts['prompt_generation_requests'] = DB::table('prompt_generation_requests')->where('user_id', $userId)->delete();
            $this->line("✓ Deleted {$deletedCounts['prompt_generation_requests']} prompt generation requests");
            
            // 5. Delete domain analysis
            $deletedCounts['domain_analysis'] = DB::table('domain_analysis')->where('user_id', $userId)->delete();
            $this->line("✓ Deleted {$deletedCounts['domain_analysis']} domain analysis records");
            
            // 6. Delete onboarding progress
            $deletedCounts['onboarding_progress'] = DB::table('onboarding_progress')->where('user_id', $userId)->delete();
            $this->line("✓ Deleted {$deletedCounts['onboarding_progress']} onboarding progress records");
            
            // 7. Delete password reset tokens
            $deletedCounts['password_reset_tokens'] = DB::table('password_reset_tokens')->where('email', $user->email)->delete();
            $this->line("✓ Deleted {$deletedCounts['password_reset_tokens']} password reset tokens");
            
            // 8. Finally delete the user
            $deletedCounts['users'] = DB::table('users')->where('id', $userId)->delete();
            $this->line("✓ Deleted user record");
            
            DB::commit();
            
            // Log the deletion
            Log::info("User cleanup completed", [
                'user_id' => $userId,
                'user_email' => $user->email,
                'deleted_counts' => $deletedCounts,
                'total_records' => array_sum($deletedCounts)
            ]);
            
            $this->info("✅ User cleanup completed successfully!");
            $this->info("Total records deleted: " . array_sum($deletedCounts));
            
            return 0;
            
        } catch (\Exception $e) {
            DB::rollback();
            
            $this->error("❌ Error during deletion: " . $e->getMessage());
            Log::error("User cleanup failed", [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return 1;
        }
    }
}