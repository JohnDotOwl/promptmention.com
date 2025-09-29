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
        Schema::create('responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('prompt_id');
            $table->bigInteger('monitor_id');
            $table->string('model_name', 100);
            $table->text('response_text');
            $table->boolean('brand_mentioned')->default(false);
            $table->enum('sentiment', ['positive', 'neutral', 'negative', 'mixed'])->nullable();
            $table->decimal('visibility_score', 5, 2)->default(0.00);
            $table->json('competitors_mentioned')->nullable();
            $table->json('citation_sources')->nullable();
            $table->integer('tokens_used')->nullable();
            $table->decimal('cost', 10, 4)->default(0.0000);
            $table->timestamps();

            // Add indexes for performance
            $table->index(['prompt_id', 'created_at']);
            $table->index(['monitor_id', 'brand_mentioned']);
            $table->index(['model_name', 'created_at']);
            $table->index('created_at');

            // Add foreign key constraints
            $table->foreign('prompt_id')
                  ->references('id')
                  ->on('prompts')
                  ->onDelete('cascade');

            $table->foreign('monitor_id')
                  ->references('id')
                  ->on('monitors')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('responses');
    }
};