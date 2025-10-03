<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Brand;

class ImportCompetitorsAsBrandsCommand extends Command
{
    protected $signature = 'brands:import-competitors {--auto : Run automatically without confirmation}';

    protected $description = 'Import competitors from domain_analysis and monitors tables into brands table';

    protected $stats = [
        'domain_analysis_processed' => 0,
        'monitors_processed' => 0,
        'competitors_found' => 0,
        'competitors_new' => 0,
        'competitors_already_processed' => 0,
        'brands_created' => 0,
        'brands_updated' => 0,
        'errors' => 0,
    ];

    public function handle()
    {
        $this->info('Starting competitors to brands import...');

        if (!$this->option('auto')) {
            if (!$this->confirm('This will import competitors from domain_analysis and monitors tables. Continue?')) {
                $this->info('Import cancelled.');
                return 0;
            }
        }

        try {
            DB::beginTransaction();

            // Import from domain_analysis table
            $this->importFromDomainAnalysis();

            // Import from monitors table
            $this->importFromMonitors();

            DB::commit();

            $this->displaySummary();
            $this->logResults();

            return 0;

        } catch (\Exception $e) {
            DB::rollBack();

            $this->error('Import failed: ' . $e->getMessage());
            $this->error('Transaction rolled back. No data was saved.');

            Log::error('Competitors import failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return 1;
        }
    }

    private function importFromDomainAnalysis()
    {
        $this->info('Importing competitors from domain_analysis table...');

        $domainAnalyses = DB::table('domain_analysis')
            ->whereNotNull('competitors')
            ->get();

        foreach ($domainAnalyses as $analysis) {
            $this->stats['domain_analysis_processed']++;

            try {
                $competitors = json_decode($analysis->competitors, true);

                if (!is_array($competitors)) {
                    $this->warn("Invalid competitor data in domain_analysis ID: {$analysis->id}");
                    $this->stats['errors']++;
                    continue;
                }

                foreach ($competitors as $competitor) {
                    $this->processCompetitor($competitor, 'domain_analysis', $analysis);
                }

            } catch (\Exception $e) {
                $this->error("Error processing domain_analysis ID {$analysis->id}: " . $e->getMessage());
                $this->stats['errors']++;
            }
        }

        $this->info("Processed {$this->stats['domain_analysis_processed']} domain analysis records");
    }

    private function importFromMonitors()
    {
        $this->info('Importing competitors from monitors table...');

        $monitors = DB::table('monitors')
            ->whereNotNull('competitors')
            ->get();

        foreach ($monitors as $monitor) {
            $this->stats['monitors_processed']++;

            try {
                $competitors = json_decode($monitor->competitors, true);

                if (!is_array($competitors)) {
                    $this->warn("Invalid competitor data in monitors ID: {$monitor->id}");
                    $this->stats['errors']++;
                    continue;
                }

                foreach ($competitors as $competitor) {
                    $this->processCompetitor($competitor, 'monitor', $monitor);
                }

            } catch (\Exception $e) {
                $this->error("Error processing monitor ID {$monitor->id}: " . $e->getMessage());
                $this->stats['errors']++;
            }
        }

        $this->info("Processed {$this->stats['monitors_processed']} monitor records");
    }

    private function processCompetitor($competitor, string $source, $sourceRecord)
    {
        $this->stats['competitors_found']++;

        // Normalize competitor data
        $normalizedCompetitor = $this->normalizeCompetitorData($competitor, $sourceRecord);

        if (empty($normalizedCompetitor['name'])) {
            $this->warn('Skipping competitor without name: ' . json_encode($competitor));
            $this->stats['errors']++;
            return;
        }

        $sourceType = $source === 'domain_analysis' ? 'domain_analysis' : 'monitor';
        $sourceId = $sourceRecord->id;
        $competitorName = $normalizedCompetitor['name'];

        // Check if this competitor has already been processed
        $existingProcessing = DB::table('competitor_processing')
            ->where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->where('competitor_name', $competitorName)
            ->first();

        if ($existingProcessing && $existingProcessing->processed_at) {
            $this->stats['competitors_already_processed']++;

            if ($this->option('verbose')) {
                $this->line("- Already processed: {$competitorName} (from {$sourceType} ID: {$sourceId})");
            }
            return;
        }

        $this->stats['competitors_new']++;

        // Find existing brand
        $existingBrand = Brand::where('name', $normalizedCompetitor['name'])->first();

        if ($existingBrand) {
            // Update existing brand if it has incomplete information
            if ($this->shouldUpdateBrand($existingBrand, $normalizedCompetitor)) {
                $this->updateBrand($existingBrand, $normalizedCompetitor);
                $this->stats['brands_updated']++;

                if ($this->option('verbose')) {
                    $this->line("✓ Updated brand: {$normalizedCompetitor['name']}");
                }
            } else {
                if ($this->option('verbose')) {
                    $this->line("- Brand exists: {$normalizedCompetitor['name']} (no update needed)");
                }
            }
            $brandId = $existingBrand->id;
        } else {
            // Create new brand
            $brand = $this->createBrand($normalizedCompetitor, $source);
            $this->stats['brands_created']++;
            $brandId = $brand->id;

            if ($this->option('verbose')) {
                $this->line("+ Created brand: {$normalizedCompetitor['name']}");
            }
        }

        // Track the processing
        $this->trackCompetitorProcessing($sourceType, $sourceId, $competitorName, $competitor, $brandId);
    }

    private function trackCompetitorProcessing(string $sourceType, int $sourceId, string $competitorName, $competitorData, int $brandId)
    {
        // Check if tracking record exists
        $existing = DB::table('competitor_processing')
            ->where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->where('competitor_name', $competitorName)
            ->first();

        if ($existing) {
            // Update existing record
            DB::table('competitor_processing')
                ->where('id', $existing->id)
                ->update([
                    'processed_at' => now(),
                    'competitor_data' => json_encode(is_array($competitorData) ? $competitorData : ['name' => $competitorData]),
                    'brand_id' => $brandId,
                    'updated_at' => now(),
                ]);
        } else {
            // Create new tracking record
            DB::table('competitor_processing')->insert([
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'competitor_name' => $competitorName,
                'processed_at' => now(),
                'competitor_data' => json_encode(is_array($competitorData) ? $competitorData : ['name' => $competitorData]),
                'brand_id' => $brandId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function normalizeCompetitorData($competitor, $sourceRecord)
    {
        // Handle different competitor data formats
        if (is_string($competitor)) {
            // Convert domain string to competitor object
            $companyName = $this->extractCompanyNameFromDomain($competitor);
            $website = $this->formatWebsiteUrl($competitor);

            return [
                'name' => $companyName,
                'website' => $website,
                'description' => $this->generateCompetitorDescription($companyName, $sourceRecord->industry ?? null),
                'industry' => $sourceRecord->industry ?? null,
            ];
        } elseif (is_array($competitor)) {
            // Handle array competitor data
            return [
                'name' => $competitor['name'] ?? 'Unknown',
                'website' => isset($competitor['website']) ? $this->formatWebsiteUrl($competitor['website']) : null,
                'description' => $competitor['description'] ?? null,
                'industry' => $competitor['industry'] ?? $sourceRecord->industry ?? null,
            ];
        }

        return ['name' => 'Unknown'];
    }

    private function extractCompanyNameFromDomain(string $domain): string
    {
        // Remove protocol and www, then extract domain name
        $domain = preg_replace('/^https?:\/\//', '', $domain);
        $domain = preg_replace('/^www\./', '', $domain);

        // Extract the main domain part (before TLD)
        $parts = explode('.', $domain);
        if (count($parts) >= 2) {
            $companyName = $parts[0];

            // Capitalize properly
            $companyName = strtoupper($companyName);

            // Handle special cases
            $specialCases = [
                'NVIDIA' => 'NVIDIA',
                'GRAPHCORE' => 'Graphcore',
                'GROQ' => 'Groq',
                'AMD' => 'AMD',
                'IBM' => 'IBM',
                'HP' => 'HP',
                'AI' => 'AI'
            ];

            return $specialCases[$companyName] ?? ucfirst(strtolower($companyName));
        }

        return ucfirst($domain);
    }

    private function formatWebsiteUrl(string $url): string
    {
        // Add protocol if missing
        if (!preg_match('/^https?:\/\//', $url)) {
            return 'https://' . $url;
        }
        return $url;
    }

    private function generateCompetitorDescription(string $companyName, string $industry = null): string
    {
        $descriptions = [
            'Artificial Intelligence (AI) and Semiconductor' => [
                'Leading semiconductor company specializing in AI chips and processors.',
                'AI hardware manufacturer developing advanced computing solutions.',
                'Technology company focused on AI acceleration and machine learning infrastructure.',
                'Innovative semiconductor company building next-generation AI processors.'
            ],
            'Technology' => [
                'Technology company developing innovative software and hardware solutions.',
                'Leading tech firm specializing in digital transformation and innovation.',
                'Software and technology provider for modern businesses.',
                'Technology company focused on cutting-edge digital solutions.'
            ],
            'E-commerce' => [
                'E-commerce platform providing online shopping solutions.',
                'Digital retail company offering innovative shopping experiences.',
                'Online marketplace connecting buyers and sellers globally.',
                'E-commerce technology company specializing in retail solutions.'
            ],
            'default' => [
                'Competitive company in the {industry} sector.',
                'Leading business operating in {industry}.',
                'Key player in the {industry} industry.',
                'Innovative company in the {industry} space.'
            ]
        ];

        $industryKey = $industry ?? 'default';
        $descriptionList = $descriptions[$industryKey] ?? $descriptions['default'];

        // Select a random description or use the first one
        $description = $descriptionList[array_rand($descriptionList)];

        // Replace placeholder if using default description
        if ($industryKey === 'default') {
            $description = str_replace('{industry}', strtolower($industry ?? 'technology'), $description);
        }

        return $description;
    }

    private function shouldUpdateBrand(Brand $brand, array $competitor): bool
    {
        // Update if brand has incomplete information and competitor provides more data
        if (empty($brand->website) && !empty($competitor['website'])) {
            return true;
        }
        if (empty($brand->description) && !empty($competitor['description'])) {
            return true;
        }
        if (empty($brand->industry) && !empty($competitor['industry'])) {
            return true;
        }

        return false;
    }

    private function updateBrand(Brand $brand, array $competitor)
    {
        $brand->update([
            'website' => empty($brand->website) && !empty($competitor['website']) ? $competitor['website'] : $brand->website,
            'description' => empty($brand->description) && !empty($competitor['description']) ? $competitor['description'] : $brand->description,
            'industry' => empty($brand->industry) && !empty($competitor['industry']) ? $competitor['industry'] : $brand->industry,
        ]);
    }

    private function createBrand(array $competitor, string $source)
    {
        $brand = Brand::create([
            'name' => $competitor['name'],
            'website' => $competitor['website'] ?? null,
            'description' => $competitor['description'] ?? null,
            'industry' => $competitor['industry'] ?? null,
            'source' => $source,
            'raw_data' => $competitor,
        ]);

        return $brand;
    }

    private function displaySummary()
    {
        $this->info("\n=== Import Summary ===");
        $this->info("Domain Analysis Records: {$this->stats['domain_analysis_processed']}");
        $this->info("Monitor Records: {$this->stats['monitors_processed']}");
        $this->info("Competitors Found: {$this->stats['competitors_found']}");
        $this->info("New Competitors: {$this->stats['competitors_new']}");
        $this->info("Already Processed: {$this->stats['competitors_already_processed']}");
        $this->info("Brands Created: {$this->stats['brands_created']}");
        $this->info("Brands Updated: {$this->stats['brands_updated']}");
        $this->info("Errors: {$this->stats['errors']}");

        $totalProcessed = $this->stats['brands_created'] + $this->stats['brands_updated'];
        $this->info("Total Brands Processed: {$totalProcessed}");
    }

    private function logResults()
    {
        Log::info('Competitors to brands import completed', [
            'stats' => $this->stats,
            'total_brands_before' => Brand::count() - $this->stats['brands_created'],
            'total_brands_after' => Brand::count(),
        ]);
    }
}