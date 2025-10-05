<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AmplifyController;
use App\Http\Controllers\CompetitorsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\MentionsController;
use App\Http\Controllers\MonitorController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PromptsController;
use App\Http\Controllers\ResponsesController;
use App\Http\Controllers\Api\RedisStatusController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Google Auth routes
Route::get('/auth/google', [GoogleAuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Brand and Marketing
    Route::get('amplify', [AmplifyController::class, 'index'])->name('amplify');
    Route::post('amplify/chat', [AmplifyController::class, 'chat'])->name('amplify.chat');
    Route::post('amplify/chat/stream', [AmplifyController::class, 'chatStream'])->name('amplify.chat.stream');
    Route::post('amplify/model-preference', [AmplifyController::class, 'updateModelPreference'])->name('amplify.model.preference');
    Route::post('amplify/search-preference', [AmplifyController::class, 'updateSearchPreference'])->name('amplify.search.preference');
    Route::get('amplify/conversations', [AmplifyController::class, 'getConversations'])->name('amplify.conversations');
    Route::post('amplify/conversations', [AmplifyController::class, 'createConversation'])->name('amplify.conversations.create');
    Route::get('amplify/conversations/{id}/messages', [AmplifyController::class, 'getConversationMessages'])->name('amplify.conversations.messages');
    Route::delete('amplify/conversations/{id}', [AmplifyController::class, 'deleteConversation'])->name('amplify.conversations.delete');
    Route::get('profile', [ProfileController::class, 'index'])->name('profile');
    Route::patch('profile', [ProfileController::class, 'update'])->name('brand-profile.update');
    Route::get('competitors', [CompetitorsController::class, 'index'])->name('competitors');

    Route::get('personas', function () {
        return Inertia::render('errors/404');
    })->name('personas');

    // Monitoring
    Route::get('monitors', [MonitorController::class, 'index'])->name('monitors');
    Route::get('monitors/create', [MonitorController::class, 'create'])->name('monitors.create');
    Route::post('monitors', [MonitorController::class, 'store'])->name('monitors.store');
    Route::get('monitors/{id}', [MonitorController::class, 'show'])->name('monitors.show');
    
    Route::get('prompts', [PromptsController::class, 'index'])->name('prompts');
    Route::get('prompts/{id}', [PromptsController::class, 'show'])->name('prompts.show');
    
    Route::get('responses', [ResponsesController::class, 'index'])->name('responses');
    
    Route::get('mentions', [MentionsController::class, 'index'])->name('mentions');

    // Analytics
    Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics');
    
    Route::get('crawlers', function () {
        $user = Auth::user();
        $monitors = [];

        // Get monitors data similar to DashboardController
        if (app('db')->getSchemaBuilder()->hasTable('monitors')) {
            $monitors = app('db')->table('monitors')
                ->select(['name', 'website_name', 'website_url'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->toArray();
        }

        // Get fallback from onboarding if no monitors exist
        if (empty($monitors)) {
            $onboardingProgress = \App\Models\OnboardingProgress::where('user_id', $user->id)
                ->whereNotNull('completed_at')
                ->first();

            if ($onboardingProgress && $onboardingProgress->company_name) {
                $monitors = [[
                    'name' => $onboardingProgress->company_name,
                    'website_name' => $onboardingProgress->company_name,
                    'website_url' => $onboardingProgress->company_website ?? ''
                ]];
            }
        }

        return Inertia::render('crawlers', [
            'monitors' => $monitors
        ]);
    })->name('crawlers');

    // Website
    Route::get('sitemap', function () {
        return Inertia::render('sitemap');
    })->name('sitemap');
});

// API Routes for Redis status monitoring
Route::prefix('api')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/redis/queue-status', [RedisStatusController::class, 'queueStatus']);
    Route::get('/monitors/{monitor}/status', [RedisStatusController::class, 'monitorStatus']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/onboarding.php';
