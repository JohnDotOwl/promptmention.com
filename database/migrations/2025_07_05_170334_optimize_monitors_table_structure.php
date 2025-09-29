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
        Schema::table('monitors', function (Blueprint $table) {
            // Add domain analysis columns
            $table->enum('setup_status', ['pending', 'analyzing', 'generating_prompts', 'completed', 'failed'])
                  ->default('pending')
                  ->after('status');
            $table->text('setup_error')->nullable()->after('setup_status');
            
            // Domain analysis data (from domain_analysis table)
            $table->json('analysis_data')->nullable()->after('description');
            $table->text('company_summary')->nullable()->after('analysis_data');
            $table->string('industry')->nullable()->after('company_summary');
            $table->json('keywords')->nullable()->after('industry');
            $table->json('competitors')->nullable()->after('keywords');
            $table->timestamp('analyzed_at')->nullable()->after('competitors');
            
            // Prompt generation tracking
            $table->integer('prompts_generated')->default(0)->after('analyzed_at');
            $table->timestamp('prompts_generated_at')->nullable()->after('prompts_generated');
            
            // Add indexes
            $table->index('setup_status');
            $table->index(['user_id', 'setup_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('monitors', function (Blueprint $table) {
            // Drop indexes
            $table->dropIndex(['user_id', 'setup_status']);
            $table->dropIndex(['setup_status']);
            
            // Drop columns
            $table->dropColumn([
                'setup_status',
                'setup_error',
                'analysis_data',
                'company_summary',
                'industry',
                'keywords',
                'competitors',
                'analyzed_at',
                'prompts_generated',
                'prompts_generated_at'
            ]);
        });
    }
};
