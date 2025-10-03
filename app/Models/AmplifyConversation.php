<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AmplifyConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'summary',
        'category',
        'context',
        'last_message_at',
        'is_archived',
    ];

    protected $casts = [
        'context' => 'array',
        'last_message_at' => 'datetime',
        'is_archived' => 'boolean',
    ];

    /**
     * Get the user that owns the conversation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the messages for the conversation.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(AmplifyMessage::class)->orderBy('created_at');
    }

    /**
     * Get the latest message for the conversation.
     */
    public function latestMessage(): HasMany
    {
        return $this->hasMany(AmplifyMessage::class)->latest();
    }

    /**
     * Scope to get only active conversations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    /**
     * Scope to get conversations by category.
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Get formatted last message time.
     */
    public function getLastMessageTimeAttribute(): string
    {
        if (!$this->last_message_at) {
            return '';
        }

        $now = now();
        $diffInHours = $now->diffInHours($this->last_message_at);

        if ($diffInHours < 1) {
            return 'Just now';
        } else if ($diffInHours < 24) {
            return "{$diffInHours}h ago";
        } else if ($diffInHours < 168) {
            return floor($diffInHours / 24) . 'd ago';
        } else {
            return $this->last_message_at->format('M j');
        }
    }

    /**
     * Get message count for the conversation.
     */
    public function getMessageCountAttribute(): int
    {
        return $this->messages()->count();
    }

    /**
     * Update the last message timestamp.
     */
    public function updateLastMessageTime(): void
    {
        $this->update(['last_message_at' => now()]);
    }

    /**
     * Archive the conversation.
     */
    public function archive(): void
    {
        $this->update(['is_archived' => true]);
    }

    /**
     * Restore the conversation from archive.
     */
    public function restore(): void
    {
        $this->update(['is_archived' => false]);
    }
}