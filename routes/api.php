<?php

use App\Http\Controllers\Api\MonitorApiController;
use App\Http\Controllers\Api\RedisStatusController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Monitor API endpoints
Route::prefix('monitors')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [MonitorApiController::class, 'index']);
    Route::get('/{monitor}', [MonitorApiController::class, 'show']);
    Route::post('/{monitor}/stats', [MonitorApiController::class, 'getStats']);
    Route::post('/{monitor}/citations', [MonitorApiController::class, 'getCitations']);
});

// Redis status endpoint
Route::get('/redis/status', [RedisStatusController::class, 'status']);