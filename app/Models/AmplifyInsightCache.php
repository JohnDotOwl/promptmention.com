<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AmplifyInsightCache extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'cache_key',
        'insight_type',
        'insight_data',
        'context',
        'expires_at',
        'hit_count',
    ];

    protected $casts = [
        'insight_data' => 'array',
        'context' => 'array',
        'expires_at' => 'datetime',
        'hit_count' => 'integer',
    ];

    /**
     * Get the user that owns the cache.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get non-expired cache entries.
     */
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }

    /**
     * Scope to get expired cache entries.
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    /**
     * Scope to get cache by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('insight_type', $type);
    }

    /**
     * Scope to get cache by key.
     */
    public function scopeByKey($query, $key)
    {
        return $query->where('cache_key', $key);
    }

    /**
     * Check if the cache entry is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Increment the hit count.
     */
    public function incrementHits(): void
    {
        $this->increment('hit_count');
    }

    /**
     * Get or create a cached insight.
     */
    public static function getOrCreate(int $userId, string $cacheKey, string $insightType, callable $dataGenerator, int $ttlHours = 24): array
    {
        $cache = static::where('user_id', $userId)
            ->where('cache_key', $cacheKey)
            ->where('expires_at', '>', now())
            ->first();

        if ($cache) {
            $cache->incrementHits();
            return $cache->insight_data;
        }

        // Generate new insight data
        $insightData = $dataGenerator();

        // Create or update cache
        static::updateOrCreate(
            ['user_id' => $userId, 'cache_key' => $cacheKey],
            [
                'insight_type' => $insightType,
                'insight_data' => $insightData,
                'expires_at' => now()->addHours($ttlHours),
                'hit_count' => 1,
            ]
        );

        return $insightData;
    }

    /**
     * Clear expired cache entries.
     */
    public static function clearExpired(): int
    {
        return static::expired()->delete();
    }

    /**
     * Clear cache for a specific user.
     */
    public static function clearForUser(int $userId): int
    {
        return static::where('user_id', $userId)->delete();
    }

    /**
     * Clear cache by key pattern.
     */
    public static function clearByKeyPattern(int $userId, string $pattern): int
    {
        return static::where('user_id', $userId)
            ->where('cache_key', 'LIKE', $pattern)
            ->delete();
    }
}