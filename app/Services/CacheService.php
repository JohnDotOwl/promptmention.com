<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class CacheService
{
    /**
     * Cache tags for different data types
     */
    const TAG_MONITORS = 'monitors';
    const TAG_STATS = 'monitor_stats';
    const TAG_PROMPTS = 'prompts';
    const TAG_MENTIONS = 'mentions';
    const TAG_USER = 'user';

    /**
     * Get or store monitor data with caching
     */
    public static function rememberMonitors($userId, $callback, $ttl = 300)
    {
        $key = "user.{$userId}.monitors";
        
        return Cache::tags([self::TAG_MONITORS, self::TAG_USER . ".{$userId}"])
            ->remember($key, $ttl, $callback);
    }

    /**
     * Get or store monitor stats with caching
     */
    public static function rememberMonitorStats($monitorId, $date, $callback, $ttl = 3600)
    {
        $key = "monitor.{$monitorId}.stats.{$date}";
        
        return Cache::tags([self::TAG_STATS, "monitor.{$monitorId}"])
            ->remember($key, $ttl, $callback);
    }

    /**
     * Get or store prompts data with caching
     */
    public static function rememberPrompts($monitorId, $callback, $ttl = 600)
    {
        $key = "monitor.{$monitorId}.prompts";
        
        return Cache::tags([self::TAG_PROMPTS, "monitor.{$monitorId}"])
            ->remember($key, $ttl, $callback);
    }

    /**
     * Get or store mentions data with caching
     */
    public static function rememberMentions($monitorId, $callback, $ttl = 1800)
    {
        $key = "monitor.{$monitorId}.mentions";

        return Cache::tags([self::TAG_MENTIONS, "monitor.{$monitorId}"])
            ->remember($key, $ttl, $callback);
    }

    /**
     * Clear cache for a specific monitor
     */
    public static function clearMonitorCache($monitorId)
    {
        Cache::tags(["monitor.{$monitorId}"])->flush();
    }

    /**
     * Clear cache for a specific user
     */
    public static function clearUserCache($userId)
    {
        Cache::tags([self::TAG_USER . ".{$userId}"])->flush();
    }

    /**
     * Clear all monitor-related caches
     */
    public static function clearAllMonitorCaches()
    {
        Cache::tags([self::TAG_MONITORS, self::TAG_STATS, self::TAG_PROMPTS, self::TAG_MENTIONS])->flush();
    }

    /**
     * Cache query results with automatic invalidation
     */
    public static function rememberQuery($key, $tags, $callback, $ttl = 600)
    {
        // Use Redis cache driver for better performance with tags
        if (config('cache.default') === 'redis') {
            return Cache::tags($tags)->remember($key, $ttl, $callback);
        }
        
        // Fallback to regular cache without tags if not using Redis
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Warm up cache for a user's monitors
     */
    public static function warmUpUserCache($userId)
    {
        // This can be called after login or in a background job
        // to pre-load commonly accessed data
        
        $monitors = \App\Models\Monitor::where('user_id', $userId)
            ->with(['stats' => function($query) {
                $query->where('date', '>=', now()->subDays(30));
            }])
            ->get();
        
        foreach ($monitors as $monitor) {
            // Cache monitor stats
            self::rememberMonitorStats($monitor->id, now()->toDateString(), function() use ($monitor) {
                return $monitor->stats()->where('date', now()->toDateString())->first();
            });
            
            // Cache recent prompts
            self::rememberPrompts($monitor->id, function() use ($monitor) {
                return $monitor->prompts()->latest()->limit(100)->get();
            });
        }
    }
}