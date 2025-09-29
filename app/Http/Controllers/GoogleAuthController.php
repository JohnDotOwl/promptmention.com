<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Inertia\Inertia;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            // Check if user already exists
            $user = User::where('email', $googleUser->email)->first();
            
            if ($user) {
                // User exists - update Google info and add to waitlist if not already
                $updateData = [
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                ];
                
                // Add to waitlist if not already on it
                if (!$user->waitlist_joined_at) {
                    $updateData['waitlist_joined_at'] = now();
                }
                
                $user->update($updateData);
                
                Auth::login($user, true);
                
                // All users go to dashboard
                return redirect()->route('dashboard');
            } else {
                // New user - create account and add to waitlist
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'waitlist_joined_at' => now(),
                    'password' => '', // No password needed for OAuth users
                ]);
                
                Auth::login($user, true);
                
                // All users go to dashboard
                return redirect()->route('dashboard');
            }
        } catch (\Exception $e) {
            return redirect()->route('home')->with('error', 'Authentication failed. Please try again.');
        }
    }

    /**
     * Show waitlist success page
     */
    public function show()
    {
        return Inertia::render('waitlist-success', [
            'user' => Auth::user(),
        ]);
    }
}
