<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class OnboardingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Skip middleware if user is not authenticated
        if (!$user) {
            return $next($request);
        }

        // Skip middleware if already on onboarding routes
        if ($request->is('onboarding') || $request->is('onboarding/*')) {
            return $next($request);
        }

        // Skip middleware for auth routes
        if ($request->routeIs('login') || $request->routeIs('register') || $request->routeIs('password.*') || $request->routeIs('verification.*')) {
            return $next($request);
        }

        // Skip middleware for logout
        if ($request->routeIs('logout')) {
            return $next($request);
        }

        // Check if user has completed onboarding
        if (!$user->hasCompletedOnboarding()) {
            return redirect('/onboarding');
        }

        return $next($request);
    }
}
