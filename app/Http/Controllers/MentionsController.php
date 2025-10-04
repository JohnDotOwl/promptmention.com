<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MentionsController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Try to get mentions data from the database
        $dbMentions = $this->getMentionsFromDatabase($user);

        // If no database mentions, fallback to mock data
        $mentions = !empty($dbMentions) ? $dbMentions : $this->getMockMentions();

        return Inertia::render('mentions', [
            'mentions' => $mentions,
            'useDatabaseData' => !empty($dbMentions)
        ]);
    }

    private function getMentionsFromDatabase($user)
    {
        // Get responses with citation sources for the user's monitors
        $responses = DB::table('responses')
            ->join('prompts', 'responses.prompt_id', '=', 'prompts.id')
            ->join('monitors', 'prompts.monitor_id', '=', 'monitors.id')
            ->where('monitors.user_id', $user->id)
            ->whereNotNull('responses.citation_sources')
            ->whereRaw("responses.citation_sources::text != 'null'")
            ->select(
                'responses.id as response_id',
                'responses.prompt_id',
                'responses.citation_sources',
                'responses.model_name',
                'responses.created_at',
                'monitors.name as monitor_name',
                'monitors.website_url'
            )
            ->orderBy('responses.created_at', 'desc')
            ->get();

        if ($responses->isEmpty()) {
            return [];
        }

        $mentions = [];
        $idCounter = 1;

        foreach ($responses as $response) {
            $citationData = json_decode($response->citation_sources, true);

            if (!$citationData) {
                continue;
            }

            // Handle both direct array and nested structure
            $sources = [];
            if (isset($citationData['sources']) && is_array($citationData['sources'])) {
                $sources = $citationData['sources'];
            } elseif (is_array($citationData) && !isset($citationData['sources'])) {
                $sources = $citationData;
            }

            // Create a mention for each citation source
            foreach ($sources as $source) {
                if (!isset($source['url']) || empty($source['url'])) {
                    continue;
                }

                // The actual domain being cited is in the 'title' field
                $domain = $source['title'] ?? 'unknown.domain';
                $citationUrl = $source['url']; // Vertex AI redirect URL (keep for reference)

                // Generate a proper title for the mention
                $title = $this->generateTitleForDomain($domain);

                // Create URL that points to the prompt/response that generated this citation
                $promptUrl = '/prompts/' . $response->prompt_id;

                $mention = [
                    'id' => 'mention-' . $idCounter++,
                    'domain' => $domain,
                    'url' => $promptUrl, // Link to the prompt that generated this citation
                    'title' => $title,
                    'domainRating' => $this->calculateDomainRating($domain),
                    'pageRank' => 1, // Default value
                    'position' => 1, // Default value
                    'estimatedTraffic' => $this->calculateEstimatedTraffic($domain),
                    'model' => $this->getModelInfo($response->model_name),
                    'firstSeen' => date('M d, Y', strtotime($response->created_at)),
                    'responseId' => $response->response_id,
                    'promptId' => $response->prompt_id,
                    'monitorName' => $response->monitor_name,
                    'isExternal' => false // This now links to internal prompt page
                ];

                $mentions[] = $mention;
            }
        }

        return $mentions;
    }

    private function extractDomain($url)
    {
        $parsedUrl = parse_url($url);
        if (isset($parsedUrl['host'])) {
            return $parsedUrl['host'];
        }

        // Fallback for malformed URLs
        $parts = explode('/', $url);
        if (count($parts) >= 3) {
            return $parts[2];
        }

        return 'unknown.domain';
    }

    private function calculateDomainRating($domain)
    {
        // Base DR calculation for real business domains
        $baseDR = 35;

        // High Authority Business Domains (established companies, major platforms)
        $highAuthorityDomains = [
            'hrplussoftware.com', 'gethrplus.com', 'sap.com', 'workday.com', 'oracle.com',
            'microsoft.com', 'google.com', 'amazon.com', 'salesforce.com', 'adobe.com',
            'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com', 'youtube.com'
        ];

        // Medium Authority Business Domains (growing companies, established SaaS)
        $mediumAuthorityDomains = [
            'apidog.com', 'subscribe-hr.com.au', 'zoominfo.com', 'hubspot.com', 'slack.com',
            'notion.so', 'airtable.com', 'figma.com', 'canva.com', 'shopify.com',
            'stripe.com', 'twilio.com', 'sendgrid.com', 'mailchimp.com'
        ];

        // SaaS/Software Company Patterns
        $saasPatterns = [
            'software', 'solutions', 'tech', 'systems', 'platform', 'app', 'cloud',
            'hr', 'payroll', 'workforce', 'management', 'automation', 'analytics'
        ];

        // Check if domain matches known high-authority domains
        if (in_array($domain, $highAuthorityDomains)) {
            $baseDR = 85;
        } elseif (in_array($domain, $mediumAuthorityDomains)) {
            $baseDR = 65;
        } else {
            // Check for SaaS/Software company patterns in domain
            foreach ($saasPatterns as $pattern) {
                if (strpos($domain, $pattern) !== false) {
                    $baseDR = 55;
                    break;
                }
            }

            // Additional heuristics for business domains
            if (preg_match('/\.(com|org|net|io|ai|co|app|tech)$/', $domain)) {
                $baseDR += 5;
            }

            // Bonus for domains that look like established businesses
            if (strlen($domain) > 8 && !preg_match('/(test|demo|staging|dev)/', $domain)) {
                $baseDR += 3;
            }
        }

        return min(100, max(20, $baseDR + rand(-5, 5)));
    }

    private function calculatePageRank($domain)
    {
        $domainRating = $this->calculateDomainRating($domain);
        return min(100, max(0, $domainRating + rand(-10, 10)));
    }

    private function calculateEstimatedTraffic($domain)
    {
        // Business domains typically have more consistent traffic patterns
        $baseTraffic = 500;

        // Adjust traffic based on domain rating
        $domainRating = $this->calculateDomainRating($domain);

        if ($domainRating >= 80) {
            // High authority domains get significant traffic
            $baseTraffic = rand(10000, 100000);
        } elseif ($domainRating >= 60) {
            // Medium authority domains get moderate traffic
            $baseTraffic = rand(2000, 20000);
        } elseif ($domainRating >= 40) {
            // Growing business domains get decent traffic
            $baseTraffic = rand(500, 5000);
        }

        // 85% chance of having traffic data for business domains
        if (rand(1, 100) > 15) {
            return $baseTraffic;
        }
        return null;
    }

    private function generateTitleForDomain($domain)
    {
        // Generate a realistic title based on the domain name
        $titles = [
            "Comprehensive review of {$domain} - Features, pricing, and alternatives",
            "Why {$domain} is gaining traction in 2025: An in-depth analysis",
            "{$domain} vs competitors: Which solution offers better value?",
            "Inside look at {$domain}: Business model and market position",
            "How {$domain} is transforming their industry in 2025",
            "{$domain} review: Pros, cons, and user experiences",
            "The rise of {$domain}: Market analysis and future predictions",
            "Is {$domain} worth the investment? Complete evaluation",
            "{$domain} business model: How they succeed in competitive markets",
            "Industry experts weigh in on {$domain}'s impact and potential"
        ];

        return $titles[array_rand($titles)];
    }

    private function generatePageTitle()
    {
        $titles = [
            'AI Revolution in 2025: What\'s Next for Machine Learning',
            'Machine Learning Breakthrough: New Algorithm Changes Everything',
            'Startup Funding Trends: How AI Companies Are Raising Capital',
            'Tech Industry Analysis: The Rise of Artificial Intelligence',
            '7 SEO Pro Tips to Boost Your Website Traffic in 2025',
            'The Future of Cloud Computing: Trends and Predictions',
            'Cybersecurity in the Age of AI: New Threats and Solutions',
            'Understanding Blockchain: Beyond Cryptocurrency',
            'The Impact of 5G on Business Innovation',
            'Digital Transformation: A Guide for Traditional Businesses'
        ];

        return $titles[array_rand($titles)];
    }

    private function getModelInfo($modelName)
    {
        $models = [
            'gemini-2.5-flash-preview-09-2025' => [
                'id' => 'gemini-2.5-flash-preview-09-2025',
                'name' => 'Gemini 2.5 Flash',
                'icon' => '/llm-icons/google.svg',
                'color' => 'bg-purple-100 text-purple-800'
            ],
            'gpt-oss-120b' => [
                'id' => 'gpt-oss-120b',
                'name' => 'GPT OSS 120B',
                'icon' => '/llm-icons/openai.svg',
                'color' => 'bg-blue-100 text-blue-800'
            ],
            'llama-4-scout-17b-16e-instruct' => [
                'id' => 'llama-4-scout-17b-16e-instruct',
                'name' => 'Llama 4 Scout',
                'icon' => '/llm-icons/meta.svg',
                'color' => 'bg-orange-100 text-orange-800'
            ]
        ];

        return $models[$modelName] ?? [
            'id' => $modelName,
            'name' => $modelName,
            'icon' => '/llm-icons/default.svg',
            'color' => 'bg-gray-100 text-gray-800'
        ];
    }

    private function getMockMentions()
    {
        // Return the mock mentions data (same as frontend)
        $mentionModels = [
            [
                'id' => 'chatgpt-search',
                'name' => 'ChatGPT Search',
                'icon' => '/llm-icons/openai.svg',
                'color' => 'bg-green-100 text-green-800'
            ],
            [
                'id' => 'gpt-4o',
                'name' => 'GPT-4o',
                'icon' => '/llm-icons/openai.svg',
                'color' => 'bg-blue-100 text-blue-800'
            ],
            [
                'id' => 'claude-3-sonnet',
                'name' => 'Claude 3 Sonnet',
                'icon' => '/llm-icons/anthropic.svg',
                'color' => 'bg-orange-100 text-orange-800'
            ],
            [
                'id' => 'gemini-2.5-flash',
                'name' => 'Gemini 2.5 Flash',
                'icon' => '/llm-icons/google.svg',
                'color' => 'bg-purple-100 text-purple-800'
            ],
            [
                'id' => 'mistral-small',
                'name' => 'Mistral Small',
                'icon' => '/llm-icons/mistral.svg',
                'color' => 'bg-red-100 text-red-800'
            ]
        ];

        $sampleDomains = [
            'reddit.com', 'en.wikipedia.org', 'businessinsider.com', 'investopedia.com',
            'wsj.com', 'theverge.com', 'wired.com', 'techcrunch.com', 'github.com',
            'stackoverflow.com', 'medium.com', 'forbes.com', 'bloomberg.com', 'reuters.com'
        ];

        $mockMentions = [];
        for ($i = 0; $i < 50; $i++) {
            $domain = $sampleDomains[array_rand($sampleDomains)];
            $model = $mentionModels[array_rand($mentionModels)];

            $baseDR = 30;
            if (in_array($domain, ['techcrunch.com', 'github.com', 'stackoverflow.com', 'forbes.com', 'wired.com', 'wsj.com'])) {
                $baseDR = 85;
            } elseif (in_array($domain, ['medium.com', 'reddit.com', 'theverge.com', 'businessinsider.com'])) {
                $baseDR = 70;
            }

            $domainRating = min(100, $baseDR + rand(-7, 7));
            $pageRank = min(100, max(0, $domainRating + rand(-10, 10)));

            $mockMentions[] = [
                'id' => 'mention-' . ($i + 1),
                'domain' => $domain,
                'url' => 'https://' . $domain . '/article/' . rand(1000, 9999),
                'title' => $this->generatePageTitle(),
                'domainRating' => $domainRating,
                'pageRank' => $pageRank,
                'position' => rand(1, 20),
                'estimatedTraffic' => rand(1, 100) > 30 ? rand(1000, 50000) : null,
                'model' => $model,
                'firstSeen' => date('M d, Y', strtotime('-' . rand(1, 90) . ' days')),
                'isExternal' => true
            ];
        }

        return $mockMentions;
    }
}