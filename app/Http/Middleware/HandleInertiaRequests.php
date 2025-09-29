<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\OnboardingProgress;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        // Use manifest file for versioning in production
        if (app()->environment('production')) {
            $manifestPath = public_path('build/manifest.json');
            if (file_exists($manifestPath)) {
                return md5_file($manifestPath);
            }
        }
        
        // In development, use parent implementation
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Cache static data that doesn't change frequently
        $appName = cache()->remember('app.name', 3600, fn() => config('app.name'));
        
        // Only get quote if not already cached (refresh every hour)
        $quote = cache()->remember('inspiring.quote', 3600, function() {
            [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
            return ['message' => trim($message), 'author' => trim($author)];
        });

        $sharedData = [
            ...parent::share($request),
            'name' => $appName,
            'quote' => $quote,
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];

        // Only load monitors data for pages that need it
        $routesNeedingMonitors = [
            'dashboard*',
            'monitors*', 
            'prompts*',
            'responses*',
            'citations*',
            'analytics*',
            'crawlers*',
            'sitemap*',
            'settings*',
        ];

        $currentRoute = $request->route()->getName() ?? '';
        $needsMonitors = false;
        
        foreach ($routesNeedingMonitors as $pattern) {
            if (fnmatch($pattern, $currentRoute) || str_starts_with($request->path(), rtrim($pattern, '*'))) {
                $needsMonitors = true;
                break;
            }
        }

        if ($needsMonitors && $request->user()) {
            $sharedData['monitors'] = $this->getMonitorsForSidebar($request);
        } else {
            $sharedData['monitors'] = [];
        }

        return $sharedData;
    }

    /**
     * Get monitors for the sidebar
     */
    private function getMonitorsForSidebar(Request $request): array
    {
        $user = $request->user();
        if (!$user) {
            return [];
        }

        // Cache monitors for 5 minutes per user
        $cacheKey = 'user.monitors.' . $user->id;
        
        return cache()->remember($cacheKey, 300, function() use ($user) {
            try {
                // Check if monitors table exists
                if (!$this->tableExists('monitors')) {
                    // Return onboarding fallback if no monitors table
                    return $this->getOnboardingFallbackMonitors($user->id);
                }

                // Get monitors from database
                $monitors = DB::table('monitors')
                    ->select([
                        'monitors.id',
                        'monitors.name',
                        'monitors.website_name',
                        'monitors.website_url',
                        'monitors.status',
                        'monitors.created_at'
                    ])
                    ->where('monitors.user_id', $user->id)
                    ->orderBy('monitors.created_at', 'desc')
                    ->limit(10) // Limit to 10 for sidebar
                    ->get()
                    ->map(function ($monitor) {
                        return [
                            'id' => $monitor->id,
                            'name' => $monitor->name,
                            'website' => [
                                'name' => $monitor->website_name,
                                'url' => $monitor->website_url
                            ],
                            'status' => $monitor->status,
                            'isPending' => false
                        ];
                    })
                    ->toArray();

                // If no monitors exist, try onboarding fallback
                if (empty($monitors)) {
                    return $this->getOnboardingFallbackMonitors($user->id);
                }

                return $monitors;

            } catch (\Exception $e) {
                // Return empty array on error
                return [];
            }
        });
    }

    /**
     * Get fallback monitors from onboarding data
     */
    private function getOnboardingFallbackMonitors($userId): array
    {
        try {
            $onboardingProgress = OnboardingProgress::where('user_id', $userId)
                ->whereNotNull('completed_at')
                ->first();

            if (!$onboardingProgress || !$onboardingProgress->company_name || !$onboardingProgress->company_website) {
                return [];
            }

            return [[
                'id' => 'onboarding-fallback',
                'name' => $onboardingProgress->company_name . ' Brand Monitor',
                'website' => [
                    'name' => $onboardingProgress->company_name,
                    'url' => $onboardingProgress->company_website
                ],
                'status' => 'pending',
                'isPending' => true
            ]];

        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Check if a database table exists
     */
    private function tableExists($tableName): bool
    {
        try {
            return DB::getSchemaBuilder()->hasTable($tableName);
        } catch (\Exception $e) {
            return false;
        }
    }
}
