<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::get('settings/crawler-analytics', function () {
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

        return Inertia::render('settings/crawler-analytics', [
            'monitors' => $monitors
        ]);
    })->name('crawler-analytics');

    Route::get('settings/billing', function () {
        return Inertia::render('settings/billing');
    })->name('billing');

    Route::get('settings/billing/usage', function () {
        return Inertia::render('settings/billing/usage');
    })->name('billing.usage');
});
