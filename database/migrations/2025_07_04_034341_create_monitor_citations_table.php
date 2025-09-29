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
        Schema::create('monitor_citations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitor_id')->constrained()->onDelete('cascade');
            $table->string('domain'); // e.g., 'reddit.com'
            $table->integer('count'); // Number of citations
            $table->decimal('percentage', 5, 2); // Percentage relative to total
            $table->string('favicon_url')->nullable(); // URL to domain favicon
            $table->timestamps();
            
            $table->unique(['monitor_id', 'domain']);
            $table->index(['monitor_id', 'count']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monitor_citations');
    }
};
