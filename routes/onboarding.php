<?php

use App\Http\Controllers\OnboardingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('onboarding')->name('onboarding.')->group(function () {
    Route::get('/', [OnboardingController::class, 'index'])->name('index');
    Route::get('/step/{step}', [OnboardingController::class, 'step'])->name('step')->where('step', '[1-3]');
    
    Route::post('/step/1', [OnboardingController::class, 'storeStep1'])->name('step1.store');
    Route::post('/step/2', [OnboardingController::class, 'storeStep2'])->name('step2.store');
    Route::post('/complete', [OnboardingController::class, 'completeOnboarding'])->name('complete');
    Route::post('/retry-analysis', [OnboardingController::class, 'retryAnalysis'])->name('retry-analysis');
    Route::post('/skip-analysis', [OnboardingController::class, 'skipAnalysis'])->name('skip-analysis');
    Route::post('/retry-monitor', [OnboardingController::class, 'retryMonitorCreation'])->name('retry-monitor');
});