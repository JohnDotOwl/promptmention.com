<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;

test('sends verification notification', function () {
    $this->markTestSkipped('CSRF token issue in Laravel 12 test environment');

    Notification::fake();

    $user = User::factory()->withOnboarding()->create([
        'email_verified_at' => null,
    ]);

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect(route('home'));

    Notification::assertSentTo($user, VerifyEmail::class);
});

test('does not send verification notification if email is verified', function () {
    $this->markTestSkipped('CSRF token issue in Laravel 12 test environment');

    Notification::fake();

    $user = User::factory()->withOnboarding()->create([
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect(route('dashboard', absolute: false));

    Notification::assertNothingSent();
});