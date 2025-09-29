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
        Schema::create('monitor_ai_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitor_id')->constrained()->onDelete('cascade');
            $table->string('ai_model_id'); // e.g., 'chatgpt-search'
            $table->string('ai_model_name'); // e.g., 'ChatGPT Search'
            $table->string('ai_model_icon'); // e.g., '/llm-icons/openai.svg'
            $table->timestamps();
            
            $table->unique(['monitor_id', 'ai_model_id']);
            $table->index('monitor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monitor_ai_models');
    }
};
