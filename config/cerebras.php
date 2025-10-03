<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cerebras API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Cerebras AI API integration. This includes the API key
    | and other settings needed to interact with Cerebras AI services.
    |
    */

    'api_key' => env('CEREBRAS_API_KEY'),

    'base_url' => env('CEREBRAS_BASE_URL', 'https://api.cerebras.ai/v1'),

    'model' => env('CEREBRAS_MODEL', 'gpt-oss-120b'),

    'max_tokens' => env('CEREBRAS_MAX_TOKENS', 4096),

    'temperature' => env('CEREBRAS_TEMPERATURE', 0.7),

    'timeout' => env('CEREBRAS_TIMEOUT', 120),

];
