<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes for monitors table
        Schema::table('monitors', function (Blueprint $table) {
            if (!Schema::hasIndex('monitors', 'monitors_user_id_status_index')) {
                $table->index(['user_id', 'status'], 'monitors_user_id_status_index');
            }
            if (!Schema::hasIndex('monitors', 'monitors_created_at_index')) {
                $table->index('created_at', 'monitors_created_at_index');
            }
        });

        // Add indexes for prompts table
        if (Schema::hasTable('prompts')) {
            Schema::table('prompts', function (Blueprint $table) {
                if (!Schema::hasIndex('prompts', 'prompts_monitor_id_index') && Schema::hasColumn('prompts', 'monitor_id')) {
                    $table->index('monitor_id', 'prompts_monitor_id_index');
                }
                // Skip status index as the column doesn't exist
                if (!Schema::hasIndex('prompts', 'prompts_created_at_index') && Schema::hasColumn('prompts', 'created_at')) {
                    $table->index('created_at', 'prompts_created_at_index');
                }
            });
        }

        // Add indexes for monitor_stats table
        Schema::table('monitor_stats', function (Blueprint $table) {
            if (!Schema::hasIndex('monitor_stats', 'monitor_stats_monitor_id_date_index')) {
                $table->index(['monitor_id', 'date'], 'monitor_stats_monitor_id_date_index');
            }
        });

        // Add indexes for monitor_citations table
        Schema::table('monitor_citations', function (Blueprint $table) {
            if (!Schema::hasIndex('monitor_citations', 'monitor_citations_monitor_id_index')) {
                $table->index('monitor_id', 'monitor_citations_monitor_id_index');
            }
            if (!Schema::hasIndex('monitor_citations', 'monitor_citations_created_at_index')) {
                $table->index('created_at', 'monitor_citations_created_at_index');
            }
        });

        // Add indexes for domain_analysis table
        Schema::table('domain_analysis', function (Blueprint $table) {
            if (!Schema::hasIndex('domain_analysis', 'domain_analysis_user_id_status_index')) {
                $table->index(['user_id', 'status'], 'domain_analysis_user_id_status_index');
            }
            if (!Schema::hasIndex('domain_analysis', 'domain_analysis_created_at_index')) {
                $table->index('created_at', 'domain_analysis_created_at_index');
            }
        });

        // Add indexes for onboarding_progress table
        Schema::table('onboarding_progress', function (Blueprint $table) {
            if (!Schema::hasIndex('onboarding_progress', 'onboarding_progress_user_id_index')) {
                $table->index('user_id', 'onboarding_progress_user_id_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes from monitors table
        Schema::table('monitors', function (Blueprint $table) {
            $table->dropIndex('monitors_user_id_status_index');
            $table->dropIndex('monitors_created_at_index');
        });

        // Drop indexes from prompts table
        if (Schema::hasTable('prompts')) {
            Schema::table('prompts', function (Blueprint $table) {
                if (Schema::hasIndex('prompts', 'prompts_monitor_id_index')) {
                    $table->dropIndex('prompts_monitor_id_index');
                }
                if (Schema::hasIndex('prompts', 'prompts_created_at_index')) {
                    $table->dropIndex('prompts_created_at_index');
                }
            });
        }

        // Drop indexes from monitor_stats table
        Schema::table('monitor_stats', function (Blueprint $table) {
            $table->dropIndex('monitor_stats_monitor_id_date_index');
        });

        // Drop indexes from monitor_citations table
        Schema::table('monitor_citations', function (Blueprint $table) {
            $table->dropIndex('monitor_citations_monitor_id_index');
            $table->dropIndex('monitor_citations_created_at_index');
        });

        // Drop indexes from domain_analysis table
        Schema::table('domain_analysis', function (Blueprint $table) {
            $table->dropIndex('domain_analysis_user_id_status_index');
            $table->dropIndex('domain_analysis_created_at_index');
        });

        // Drop indexes from onboarding_progress table
        Schema::table('onboarding_progress', function (Blueprint $table) {
            $table->dropIndex('onboarding_progress_user_id_index');
        });
    }

    /**
     * Helper function to check if an index exists
     */
    private function hasIndex($table, $index): bool
    {
        return Schema::hasIndex($table, $index);
    }
};