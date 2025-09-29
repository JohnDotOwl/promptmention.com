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
        Schema::create('monitor_chart_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitor_id')->constrained()->onDelete('cascade');
            $table->enum('chart_type', ['visibility', 'mentions', 'citation_rank']);
            $table->date('date');
            $table->decimal('value', 8, 2); // Flexible for different chart types
            $table->timestamps();
            
            $table->unique(['monitor_id', 'chart_type', 'date']);
            $table->index(['monitor_id', 'chart_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monitor_chart_data');
    }
};
