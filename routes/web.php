<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\MonitorController;
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
    Route::get('profile', function () {
        return Inertia::render('profile');
    })->name('profile');
    
    Route::get('competitors', function () {
        return Inertia::render('competitors');
    })->name('competitors');

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
    
    Route::get('citations', function () {
        return Inertia::render('citations');
    })->name('citations');

    // Analytics
    Route::get('analytics', function () {
        return Inertia::render('analytics');
    })->name('analytics');
    
    Route::get('crawlers', function () {
        return Inertia::render('crawlers');
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
