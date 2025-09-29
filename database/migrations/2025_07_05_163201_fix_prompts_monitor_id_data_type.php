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
        // Since prompts table is empty, drop and recreate it with correct schema
        Schema::dropIfExists('prompts');
        
        Schema::create('prompts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->bigInteger('monitor_id'); // Changed from UUID to bigint to match monitors.id
            $table->text('text');
            $table->enum('type', ['brand-specific', 'organic', 'competitor'])->default('brand-specific');
            $table->enum('intent', ['informational', 'commercial'])->default('informational');
            $table->string('language_code', 5)->default('en');
            $table->string('language_name', 50)->default('English');
            $table->string('language_flag', 10)->default('🇺🇸');
            $table->boolean('generated_by_ai')->default(true);
            $table->uuid('prompt_generation_request_id')->nullable();
            $table->integer('response_count')->default(0);
            $table->decimal('visibility_percentage', 5, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Add indexes for performance
            $table->index(['monitor_id', 'type']);
            $table->index(['monitor_id', 'is_active']);
            $table->index('prompt_generation_request_id');
            $table->index('created_at');
            
            // Add foreign key constraints
            $table->foreign('monitor_id')
                  ->references('id')
                  ->on('monitors')
                  ->onDelete('cascade');
                  
            $table->foreign('prompt_generation_request_id')
                  ->references('id')
                  ->on('prompt_generation_requests')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop and recreate with original UUID schema
        Schema::dropIfExists('prompts');
        
        Schema::create('prompts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('monitor_id'); // Original UUID type
            $table->text('text');
            $table->enum('type', ['brand-specific', 'organic', 'competitor'])->default('brand-specific');
            $table->enum('intent', ['informational', 'commercial'])->default('informational');
            $table->string('language_code', 5)->default('en');
            $table->string('language_name', 50)->default('English');
            $table->string('language_flag', 10)->default('🇺🇸');
            $table->boolean('generated_by_ai')->default(true);
            $table->uuid('prompt_generation_request_id')->nullable();
            $table->integer('response_count')->default(0);
            $table->decimal('visibility_percentage', 5, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Add indexes for performance
            $table->index(['monitor_id', 'type']);
            $table->index(['monitor_id', 'is_active']);
            $table->index('prompt_generation_request_id');
            $table->index('created_at');
            
            // Add foreign key constraints
            $table->foreign('prompt_generation_request_id')
                  ->references('id')
                  ->on('prompt_generation_requests')
                  ->onDelete('set null');
        });
    }
};
