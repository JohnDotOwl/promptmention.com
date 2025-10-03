<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BrandMentionCounter extends Command
{
    const BATCH_SIZE = 50;
    const POLL_INTERVAL = 15; // seconds

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'brand:count-mentions {--daemon : Run continuously as daemon}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Count brand mentions in responses';

    /**
     * Count brand mentions in text (case-insensitive)
     */
    private function countBrandMentions(string $text, string $brandName): int
    {
        if (empty($text) || empty($brandName)) {
            return 0;
        }

        try {
            $textLower = strtolower($text);
            $brandLower = strtolower($brandName);
            $pattern = '/\b' . preg_quote($brandLower, '/') . '\b/';

            $matches = [];
            $result = preg_match_all($pattern, $textLower, $matches);

            if ($result === false) {
                Log::warning("Error counting brand mentions for brand: {$brandName}");
                return 0;
            }

            return count($matches[0]);
        } catch (\Exception $e) {
            Log::warning("Error counting brand mentions: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get unprocessed responses
     */
    private function getUnprocessedResponses(int $batchSize = self::BATCH_SIZE): array
    {
        try {
            $responses = DB::table('responses as r')
                ->join('monitors as m', 'r.monitor_id', '=', 'm.id')
                ->select([
                    'r.id',
                    'r.response_text',
                    'r.brand_mention_count',
                    'r.created_at',
                    'm.id as monitor_id',
                    'm.website_name',
                    'm.name as monitor_name'
                ])
                ->whereNull('r.brand_mention_count')
                ->orderBy('r.created_at', 'asc')
                ->limit($batchSize)
                ->get()
                ->toArray();

            $this->info("Found " . count($responses) . " unprocessed responses");
            return $responses;
        } catch (\Exception $e) {
            Log::error("Error fetching unprocessed responses: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Update brand mention count for a response
     */
    private function updateResponseMentionCount(string $responseId, int $mentionCount, string $brandName): bool
    {
        try {
            $updated = DB::table('responses')
                ->where('id', $responseId)
                ->update(['brand_mention_count' => $mentionCount]);

            if ($updated) {
                $this->info("Updated response {$responseId} with {$mentionCount} mentions of '{$brandName}'");

                Log::info("BRAND_MENTION_UPDATE: " . json_encode([
                    'timestamp' => now()->toISOString(),
                    'response_id' => $responseId,
                    'brand_name' => $brandName,
                    'mention_count' => $mentionCount
                ]));
            }

            return $updated > 0;
        } catch (\Exception $e) {
            Log::error("Error updating mention count for response {$responseId}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Process a batch of responses
     */
    private function processResponseBatch(array $responses): array
    {
        $processedCount = 0;
        $totalMentions = 0;

        foreach ($responses as $response) {
            try {
                $responseId = $response->id;
                $responseText = $response->response_text;
                $brandName = $response->website_name ?: $response->monitor_name;

                if (empty($brandName)) {
                    $this->warn("No brand name available for response {$responseId}, skipping");
                    continue;
                }

                $mentionCount = $this->countBrandMentions($responseText, $brandName);

                if ($this->updateResponseMentionCount($responseId, $mentionCount, $brandName)) {
                    $processedCount++;
                    $totalMentions += $mentionCount;
                }
            } catch (\Exception $e) {
                $responseId = $response->id ?? 'unknown';
                Log::error("Error processing response {$responseId}: " . $e->getMessage());
                continue;
            }
        }

        return [
            'processed_count' => $processedCount,
            'total_mentions' => $totalMentions
        ];
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting Brand Mention Counter");

        do {
            $responses = $this->getUnprocessedResponses(self::BATCH_SIZE);

            if ($responses) {
                $this->info("Processing " . count($responses) . " responses...");

                $result = $this->processResponseBatch($responses);
                $processedCount = $result['processed_count'];
                $totalMentions = $result['total_mentions'];

                Log::info("BATCH_PROCESSING: " . json_encode([
                    'timestamp' => now()->toISOString(),
                    'batch_size' => count($responses),
                    'processed_count' => $processedCount,
                    'total_mentions' => $totalMentions
                ]));

                $this->info("Batch completed: {$processedCount}/" . count($responses) . " processed, {$totalMentions} total mentions");
            } else {
                $this->info("No unprocessed responses found.");
                if (!$this->option('daemon')) {
                    $this->info("Use --daemon flag to run continuously");
                    break;
                }
                $this->info("Sleeping for 15 seconds...");
                sleep(self::POLL_INTERVAL);
            }
        } while ($this->option('daemon'));

        $this->info("Brand Mention Counter finished");
    }
}
