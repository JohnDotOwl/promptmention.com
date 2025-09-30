<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        if ($request->is('api/*') && $e instanceof ValidationException) {
            return new JsonResponse([
                'message' => 'The given data was invalid.',
                'errors' => $e->errors(),
            ], 422);
        }

        if ($request->is('api/*')) {
            return new JsonResponse([
                'message' => 'Internal Server Error',
                'error' => config('app.debug') ? $e->getMessage() : 'Something went wrong',
            ], 500);
        }

        return parent::render($request, $e);
    }
}