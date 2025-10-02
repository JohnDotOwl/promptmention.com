<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Monitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class MonitorApiController extends Controller
{
    /**
     * Get monitors with filtering options
     */
    public function index(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'nullable|in:active,pending,failed,inactive',
                'date_from' => 'nullable|date',
                'date_to' => 'nullable|date|after_or_equal:date_from',
                'model' => 'nullable|string',
                'per_page' => 'nullable|integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $query = Monitor::where('user_id', $request->user()->id);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('model')) {
                $query->whereHas('aiModels', function ($q) use ($request) {
                    $q->where('model_name', $request->model);
                });
            }

            $monitors = $query->with(['aiModels', 'stats' => function ($q) use ($request) {
                if ($request->has('date_from')) {
                    $q->where('date', '>=', $request->date_from);
                }
                if ($request->has('date_to')) {
                    $q->where('date', '<=', $request->date_to);
                }
            }])->orderBy('created_at', 'desc')
              ->paginate($request->input('per_page', 20));

            return response()->json([
                'data' => $monitors->items(),
                'meta' => [
                    'total' => $monitors->total(),
                    'per_page' => $monitors->perPage(),
                    'current_page' => $monitors->currentPage(),
                    'last_page' => $monitors->lastPage(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('API Error - Monitor index', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get single monitor details
     */
    public function show(Request $request, $id)
    {
        try {
            $monitor = Monitor::where('user_id', $request->user()->id)
                             ->with(['aiModels', 'stats' => function ($q) {
                                 $q->where('date', '>=', now()->subDays(30))
                                   ->orderBy('date', 'desc');
                             }])
                             ->findOrFail($id);

            return response()->json(['data' => $monitor]);

        } catch (\Exception $e) {
            Log::error('API Error - Monitor show', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Monitor not found'], 404);
        }
    }

    /**
     * Get monitor statistics with date range filtering
     */
    public function getStats(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date_from' => 'nullable|date',
                'date_to' => 'nullable|date|after_or_equal:date_from',
                'group_by' => 'nullable|in:day,week,month'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $monitor = Monitor::where('user_id', $request->user()->id)->findOrFail($id);

            $query = $monitor->stats();

            if ($request->has('date_from')) {
                $query->where('date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('date', '<=', $request->date_to);
            }

            if ($request->input('group_by') === 'week') {
                $stats = $query->selectRaw('
                    DATE_TRUNC(\'week\', date) as period,
                    SUM(total_prompts) as total_prompts,
                    SUM(total_responses) as total_responses,
                    AVG(visibility_score) as avg_visibility,
                    SUM(mentions) as total_mentions
                ')->groupBy('period')->get();
            } elseif ($request->input('group_by') === 'month') {
                $stats = $query->selectRaw('
                    DATE_TRUNC(\'month\', date) as period,
                    SUM(total_prompts) as total_prompts,
                    SUM(total_responses) as total_responses,
                    AVG(visibility_score) as avg_visibility,
                    SUM(mentions) as total_mentions
                ')->groupBy('period')->get();
            } else {
                $stats = $query->orderBy('date', 'desc')->get();
            }

            return response()->json(['data' => $stats]);

        } catch (\Exception $e) {
            Log::error('API Error - Monitor stats', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get monitor mentions with filtering
     */
    public function getMentions(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date_from' => 'nullable|date',
                'date_to' => 'nullable|date|after_or_equal:date_from',
                'domain' => 'nullable|string',
                'ai_model' => 'nullable|string',
                'per_page' => 'nullable|integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $monitor = Monitor::where('user_id', $request->user()->id)->findOrFail($id);

            $query = $monitor->mentions();

            if ($request->has('date_from')) {
                $query->where('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('created_at', '<=', $request->date_to);
            }

            if ($request->has('domain')) {
                $query->where('domain', 'like', '%' . $request->domain . '%');
            }

            if ($request->has('ai_model')) {
                $query->where('ai_model', $request->ai_model);
            }

            $mentions = $query->orderBy('created_at', 'desc')
                            ->paginate($request->input('per_page', 50));

            return response()->json([
                'data' => $mentions->items(),
                'meta' => [
                    'total' => $mentions->total(),
                    'per_page' => $mentions->perPage(),
                    'current_page' => $mentions->currentPage(),
                    'last_page' => $mentions->lastPage(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('API Error - Monitor mentions', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }
}