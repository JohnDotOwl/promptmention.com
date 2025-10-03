<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'website',
        'description',
        'industry',
        'source',
        'raw_data',
    ];

    protected $casts = [
        'raw_data' => 'array',
    ];

    /**
     * Scope to get brands by industry
     */
    public function scopeByIndustry($query, $industry)
    {
        return $query->where('industry', $industry);
    }

    /**
     * Scope to get brands by source
     */
    public function scopeBySource($query, $source)
    {
        return $query->where('source', $source);
    }

    /**
     * Scope to get brands with websites
     */
    public function scopeWithWebsite($query)
    {
        return $query->whereNotNull('website')->where('website', '!=', '');
    }

    /**
     * Scope to search by name or description
     */
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'ILIKE', "%{$term}%")
              ->orWhere('description', 'ILIKE', "%{$term}%");
        });
    }

    /**
     * Get formatted website URL
     */
    public function getFormattedWebsiteAttribute()
    {
        if (!$this->website) {
            return null;
        }

        // Add protocol if missing
        if (!preg_match('/^https?:\/\//', $this->website)) {
            return 'https://' . $this->website;
        }

        return $this->website;
    }

    /**
     * Check if brand has complete information
     */
    public function isComplete(): bool
    {
        return !empty($this->name) &&
               !empty($this->website) &&
               !empty($this->description) &&
               !empty($this->industry);
    }

    /**
     * Create brand from competitor data
     */
    public static function createFromCompetitor(array $competitor, string $source = 'manual'): self
    {
        return static::create([
            'name' => $competitor['name'] ?? 'Unknown',
            'website' => $competitor['website'] ?? null,
            'description' => $competitor['description'] ?? null,
            'industry' => $competitor['industry'] ?? null,
            'source' => $source,
            'raw_data' => $competitor,
        ]);
    }

    /**
     * Find or create brand from competitor data
     */
    public static function findOrCreateFromCompetitor(array $competitor, string $source = 'manual'): self
    {
        $brandName = $competitor['name'] ?? 'Unknown';

        $brand = static::where('name', $brandName)->first();

        if (!$brand) {
            $brand = static::createFromCompetitor($competitor, $source);
        }

        return $brand;
    }
}