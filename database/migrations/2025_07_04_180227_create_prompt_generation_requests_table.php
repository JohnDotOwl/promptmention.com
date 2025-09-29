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
        Schema::create('prompt_generation_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->uuid('monitor_id')->nullable();
            $table->uuid('domain_analysis_id')->nullable();
            $table->string('company_name');
            $table->string('company_website');
            $table->string('industry')->nullable();
            $table->json('keywords')->nullable();
            $table->json('competitors')->nullable();
            $table->text('summary')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->integer('prompts_generated')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            // Add indexes for performance
            $table->index(['user_id', 'status']);
            $table->index('status');
            $table->index('created_at');
            
            // Add foreign key constraints if users table exists
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prompt_generation_requests');
    }
};
