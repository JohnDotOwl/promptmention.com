<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingProgress extends Model
{
    protected $fillable = [
        'user_id',
        'current_step',
        'completed_at',
        'company_name',
        'company_website',
        'first_name',
        'last_name',
        'job_role',
        'company_size',
        'language',
        'country',
        'referral_source',
        'company_description',
        'industry',
        'website_analysis',
        'monitor_id',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'website_analysis' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isCompleted(): bool
    {
        return !is_null($this->completed_at);
    }

    public function canAccessStep(int $step): bool
    {
        return $step <= $this->current_step;
    }

    public function markStepCompleted(int $step): void
    {
        if ($step > $this->current_step) {
            $this->current_step = $step;
            $this->save();
        }
    }

    public function markCompleted(): void
    {
        $this->completed_at = now();
        $this->current_step = 3;
        $this->save();
    }
}
