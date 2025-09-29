<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoogleAuthController;
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

    // Analytics
    Route::get('analytics', function () {
        return Inertia::render('analytics');
    })->name('analytics');
});

// Catch-all route for 404 handling
Route::fallback(function () {
    if (request()->expectsJson()) {
        return response()->json(['message' => 'Page not found'], 404);
    }

    return Inertia::render('errors/404', [], 404);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
