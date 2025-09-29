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
        Schema::create('onboarding_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('current_step')->default(1);
            $table->timestamp('completed_at')->nullable();
            
            // Step 1: Company Information
            $table->string('company_name')->nullable();
            $table->string('company_website')->nullable();
            
            // Step 2: User Details
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('job_role')->nullable();
            $table->string('company_size')->nullable();
            $table->string('language')->nullable();
            $table->string('country')->nullable();
            $table->string('referral_source')->nullable();
            
            // Step 3: Website Analysis
            $table->text('company_description')->nullable();
            $table->string('industry')->nullable();
            $table->json('website_analysis')->nullable();
            
            $table->timestamps();
            
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('onboarding_progress');
    }
};
