<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AmplifyMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'type',
        'content',
        'ai_model',
        'ai_provider',
        'is_streamed',
        'rich_data',
        'metadata',
        'token_count',
    ];

    protected $casts = [
        'rich_data' => 'array',
        'metadata' => 'array',
        'token_count' => 'integer',
        'is_streamed' => 'boolean',
    ];

    /**
     * Get the conversation that owns the message.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(AmplifyConversation::class);
    }

    /**
     * Scope to get user messages.
     */
    public function scopeUserMessages($query)
    {
        return $query->where('type', 'user');
    }

    /**
     * Scope to get assistant messages.
     */
    public function scopeAssistantMessages($query)
    {
        return $query->where('type', 'assistant');
    }

    /**
     * Check if message contains rich data.
     */
    public function hasRichData(): bool
    {
        return !empty($this->rich_data);
    }

    /**
     * Get insight data if present.
     */
    public function getInsightData(): ?array
    {
        return $this->rich_data['data'] ?? null;
    }

    /**
     * Check if message contains actionable insights.
     */
    public function hasActionableInsights(): bool
    {
        return isset($this->rich_data['data']['action']);
    }

    /**
     * Create a new user message.
     */
    public static function createUserMessage(int $conversationId, string $content, array $metadata = []): self
    {
        return static::create([
            'conversation_id' => $conversationId,
            'type' => 'user',
            'content' => $content,
            'metadata' => $metadata,
            'token_count' => str_word_count($content),
        ]);
    }

    /**
     * Create a new assistant message.
     */
    public static function createAssistantMessage(int $conversationId, string $content, array $richData = null, string $aiModel = null, string $aiProvider = null, bool $isStreamed = false, array $metadata = []): self
    {
        return static::create([
            'conversation_id' => $conversationId,
            'type' => 'assistant',
            'content' => $content,
            'ai_model' => $aiModel,
            'ai_provider' => $aiProvider,
            'is_streamed' => $isStreamed,
            'rich_data' => $richData,
            'metadata' => $metadata,
            'token_count' => str_word_count($content),
        ]);
    }
}