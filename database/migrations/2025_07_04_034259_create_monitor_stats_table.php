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
        Schema::create('monitor_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitor_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->decimal('visibility_score', 5, 2)->default(0); // e.g., 42.85
            $table->integer('total_prompts')->default(0);
            $table->integer('total_responses')->default(0);
            $table->integer('mentions')->default(0);
            $table->decimal('avg_citation_rank', 4, 1)->default(0); // e.g., 5.0
            $table->timestamps();
            
            $table->unique(['monitor_id', 'date']);
            $table->index(['monitor_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monitor_stats');
    }
};
