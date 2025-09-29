<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CleanupOrphanedMonitors extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'monitors:cleanup-orphaned {--hours=24 : Hours to wait before cleaning up}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up monitors with pending setup for more than X hours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hours = (int) $this->option('hours');
        $cutoffTime = now()->subHours($hours);
        
        $this->info("Cleaning up monitors with pending setup for more than {$hours} hours...");
        
        // Find orphaned monitors
        $orphanedMonitors = DB::table('monitors')
            ->where('setup_status', 'pending')
            ->where('created_at', '<', $cutoffTime)
            ->get();
        
        if ($orphanedMonitors->isEmpty()) {
            $this->info('No orphaned monitors found.');
            return Command::SUCCESS;
        }
        
        $this->info("Found {$orphanedMonitors->count()} orphaned monitors.");
        
        foreach ($orphanedMonitors as $monitor) {
            $this->line("Processing monitor ID: {$monitor->id} (created: {$monitor->created_at})");
            
            try {
                // Check if user completed onboarding
                $onboardingProgress = DB::table('onboarding_progress')
                    ->where('monitor_id', $monitor->id)
                    ->first();
                
                if ($onboardingProgress && $onboardingProgress->completed_at) {
                    // User completed onboarding - monitor is already active, just log
                    
                    $this->info("  ✓ Monitor belongs to user who completed onboarding");
                    
                    Log::info('Monitor with pending setup belongs to completed user', [
                        'monitor_id' => $monitor->id,
                        'user_id' => $monitor->user_id
                    ]);
                } else {
                    // User abandoned onboarding - delete monitor and related data
                    DB::beginTransaction();
                    
                    try {
                        // Delete related prompts
                        $deletedPrompts = DB::table('prompts')
                            ->where('monitor_id', $monitor->id)
                            ->delete();
                        
                        // Delete related AI models
                        DB::table('monitor_ai_models')
                            ->where('monitor_id', $monitor->id)
                            ->delete();
                        
                        // Delete related stats
                        DB::table('monitor_stats')
                            ->where('monitor_id', $monitor->id)
                            ->delete();
                        
                        // Delete the monitor
                        DB::table('monitors')
                            ->where('id', $monitor->id)
                            ->delete();
                        
                        DB::commit();
                        
                        $this->info("  ✓ Monitor deleted - user abandoned onboarding (deleted {$deletedPrompts} prompts)");
                        
                        Log::info('Orphaned monitor deleted', [
                            'monitor_id' => $monitor->id,
                            'user_id' => $monitor->user_id,
                            'prompts_deleted' => $deletedPrompts
                        ]);
                    } catch (\Exception $e) {
                        DB::rollBack();
                        throw $e;
                    }
                }
            } catch (\Exception $e) {
                $this->error("  ✗ Error processing monitor: " . $e->getMessage());
                
                Log::error('Error cleaning up orphaned monitor', [
                    'monitor_id' => $monitor->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        $this->info('Cleanup completed.');
        
        return Command::SUCCESS;
    }
}