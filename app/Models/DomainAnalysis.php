<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DomainAnalysis extends Model
{
    use HasFactory;

    protected $table = 'domain_analysis';

    protected $fillable = [
        'user_id',
        'company_name',
        'company_website',
        'analysis_data',
        'summary',
        'industry',
        'keywords',
        'competitors',
        'website_info',
        'status',
        'error_message',
        'processed_at',
    ];

    protected $casts = [
        'analysis_data' => 'array',
        'keywords' => 'array',
        'competitors' => 'array',
        'website_info' => 'array',
        'processed_at' => 'datetime',
    ];

    /**
     * Get the user that owns the domain analysis.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the analysis is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the analysis failed.
     */
    public function hasFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Mark the analysis as processing.
     */
    public function markAsProcessing(): void
    {
        $this->update(['status' => 'processing']);
    }

    /**
     * Mark the analysis as completed.
     */
    public function markAsCompleted(array $analysisData, string $summary): void
    {
        $this->update([
            'status' => 'completed',
            'analysis_data' => $analysisData,
            'summary' => $summary,
            'industry' => $analysisData['domain_analysis']['industry'] ?? null,
            'keywords' => $analysisData['domain_analysis']['keywords'] ?? [],
            'competitors' => $analysisData['domain_analysis']['competitors'] ?? [],
            'website_info' => $analysisData['website_info'] ?? [],
            'processed_at' => now(),
        ]);
    }

    /**
     * Mark the analysis as failed.
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'processed_at' => now(),
        ]);
    }
}