# PromptMention Data Flow & Database Research

## Overview
This document analyzes the current state of the PromptMention application and outlines the missing components needed to build a fully functional AI brand monitoring system. The application is designed to track how brands are mentioned in AI model responses across different queries and competitors.

---

## Part 1: Web Application Analysis

### Current Database Structure (PostgreSQL)

The application currently has a minimal database schema with only user management and onboarding functionality:

#### Existing Tables

**users**
- `id` (bigint, primary key)
- `email` (varchar, unique)
- `password` (varchar, hashed)
- `name` (varchar)
- `email_verified_at` (timestamp)
- `remember_token` (varchar)
- `created_at`, `updated_at` (timestamps)

**onboarding_progress**
- `id` (bigint, primary key)
- `user_id` (bigint, foreign key to users)
- `current_step` (integer, default 1)
- `completed_at` (timestamp)
- Company info: `company_name`, `company_website`, `company_description`, `industry`
- User details: `first_name`, `last_name`, `job_role`, `company_size`, `language`, `country`, `referral_source`
- `website_analysis` (json)
- `created_at`, `updated_at` (timestamps)

**Standard Laravel Tables**
- `password_reset_tokens`
- `jobs` (for queue processing)

### Missing Database Schema

Based on the TypeScript interfaces and mock data, the following tables are needed:

#### Core Business Logic Tables

**monitors**
```sql
CREATE TABLE monitors (
    id UUID PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP
);
```

**monitor_models** (AI models used for each monitor)
```sql
CREATE TABLE monitor_models (
    id UUID PRIMARY KEY,
    monitor_id UUID REFERENCES monitors(id) ON DELETE CASCADE,
    model_id VARCHAR(100), -- 'gpt-4o', 'claude-3-sonnet', etc.
    model_name VARCHAR(255),
    icon_path VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**prompts**
```sql
CREATE TABLE prompts (
    id UUID PRIMARY KEY,
    monitor_id UUID REFERENCES monitors(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type VARCHAR(50), -- 'brand-specific', 'organic', 'competitor'
    intent VARCHAR(50), -- 'informational', 'commercial'
    language_code VARCHAR(10),
    language_name VARCHAR(100),
    language_flag_url VARCHAR(255),
    visibility_score INTEGER DEFAULT 0, -- percentage
    response_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**responses**
```sql
CREATE TABLE responses (
    id UUID PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    model_id VARCHAR(100),
    model_name VARCHAR(255),
    model_display_name VARCHAR(255),
    model_icon VARCHAR(255),
    model_color VARCHAR(50),
    text TEXT NOT NULL,
    visibility_score INTEGER DEFAULT 0, -- percentage
    tokens INTEGER,
    cost DECIMAL(10,4),
    answered_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**brand_mentions**
```sql
CREATE TABLE brand_mentions (
    id UUID PRIMARY KEY,
    response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
    brand_name VARCHAR(255),
    sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
    mentioned BOOLEAN DEFAULT false,
    context TEXT, -- surrounding text context
    created_at TIMESTAMP DEFAULT NOW()
);
```

**competitor_mentions**
```sql
CREATE TABLE competitor_mentions (
    id UUID PRIMARY KEY,
    response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255),
    mentioned BOOLEAN DEFAULT false,
    context TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**citations**
```sql
CREATE TABLE citations (
    id UUID PRIMARY KEY,
    response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
    url VARCHAR(2048),
    title VARCHAR(500),
    domain VARCHAR(255),
    citation_rank INTEGER, -- position in response
    is_brand_domain BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Analytics Tables

**monitor_stats** (aggregated statistics)
```sql
CREATE TABLE monitor_stats (
    id UUID PRIMARY KEY,
    monitor_id UUID REFERENCES monitors(id) ON DELETE CASCADE,
    date DATE,
    visibility_score INTEGER,
    total_prompts INTEGER,
    total_responses INTEGER,
    mentions_count INTEGER,
    avg_citation_rank DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**crawler_logs** (website analytics tracking)
```sql
CREATE TABLE crawler_logs (
    id UUID PRIMARY KEY,
    project_id UUID, -- for future multi-project support
    url VARCHAR(2048),
    user_agent TEXT,
    ip_address INET,
    referrer VARCHAR(2048),
    timestamp TIMESTAMP DEFAULT NOW(),
    session_id VARCHAR(255),
    page_title VARCHAR(500),
    event_type VARCHAR(50), -- 'pageview', 'click', 'conversion'
    metadata JSONB
);
```

### Current Frontend Data Structure

The application frontend is built with React/TypeScript and defines comprehensive interfaces:

#### Key TypeScript Interfaces

**Monitor Interface** (`/resources/js/types/monitor.ts`)
- Tracks brand monitoring queries with associated AI models
- Includes stats: visibility score, prompts, responses, mentions, citation rank
- Has time-series data for charts (visibility, mentions, citations)

**Prompt Interface** (`/resources/js/types/prompt.ts`)
- Categorizes prompts by type (brand-specific, organic, competitor)
- Tracks intent (informational, commercial)
- Includes visibility scoring and language support

**Response Interface** (`/resources/js/types/response.ts`)
- Links responses to specific AI models
- Tracks brand mentions with sentiment analysis
- Includes competitor mentions and cost/token metrics

### Route Structure Analysis

**Current Routes** (`/routes/web.php`):
- Dashboard, monitoring, prompts, responses, citations, analytics
- All routes currently render static pages with mock data
- No backend controllers for data processing

**Missing Backend Logic**:
- API endpoints for CRUD operations on monitors, prompts, responses
- Data aggregation for analytics dashboard
- Integration with AI model APIs
- Webhook handling for real-time updates

### Data Flow Architecture

**Current State**: Frontend → Mock Data → UI Components
**Target State**: Frontend → Laravel API → Database ← Python Scripts ← AI Models

---

## Part 2: AI Model Integration Scripts

### Required Python Scripts Architecture

#### 1. Prompt Generation Script (`scripts/generate_prompts.py`)

**Purpose**: Create targeted prompts for brand monitoring

```python
# Pseudo-code structure
class PromptGenerator:
    def __init__(self, monitor_config):
        self.brand_name = monitor_config['brand_name']
        self.competitors = monitor_config['competitors']
        self.industry = monitor_config['industry']
    
    def generate_brand_specific_prompts(self):
        # Generate prompts specifically mentioning the brand
        # Example: "How does [Brand] compare to other HR software?"
        pass
    
    def generate_organic_prompts(self):
        # Generate industry-related prompts without brand mention
        # Example: "What's the best HR software for small businesses?"
        pass
    
    def generate_competitor_prompts(self):
        # Generate prompts comparing with competitors
        # Example: "Should I choose [Brand] or [Competitor] for payroll?"
        pass
```

#### 2. AI Model Query Script (`scripts/query_models.py`)

**Purpose**: Send prompts to various AI models and collect responses

```python
# Required integrations
class AIModelManager:
    def __init__(self):
        self.models = {
            'openai': {
                'gpt-4o': OpenAIClient(),
                'gpt-4o-search': OpenAISearchClient()
            },
            'anthropic': {
                'claude-3-sonnet': AnthropicClient(),
                'claude-3-haiku': AnthropicClient()
            },
            'google': {
                'gemini-2.0-flash': GeminiClient(),
                'gemini-pro': GeminiClient()
            },
            'mistral': {
                'mistral-small-latest': MistralClient()
            }
        }
    
    def query_model(self, model_id, prompt_text):
        # Send prompt to specific model
        # Return response with metadata (tokens, cost, timing)
        pass
    
    def batch_query(self, prompts, model_list):
        # Query multiple models with multiple prompts
        # Handle rate limiting and retries
        pass
```

#### 3. Response Analysis Script (`scripts/analyze_responses.py`)

**Purpose**: Analyze AI responses for brand mentions, sentiment, and competitor analysis

```python
class ResponseAnalyzer:
    def __init__(self):
        self.nlp_processor = self.setup_nlp()
    
    def extract_brand_mentions(self, response_text, brand_name):
        # Use NLP to find brand mentions
        # Analyze sentiment (positive/neutral/negative)
        # Extract surrounding context
        pass
    
    def extract_competitor_mentions(self, response_text, competitor_list):
        # Find mentions of competitor brands
        # Rank competitors by mention frequency/prominence
        pass
    
    def extract_citations(self, response_text):
        # Extract URLs and citations from response
        # Rank by position and relevance
        pass
    
    def calculate_visibility_score(self, response_data):
        # Algorithm to calculate brand visibility (0-100%)
        # Consider: mention prominence, sentiment, citation rank
        pass
```

#### 4. Database Integration Script (`scripts/database_sync.py`)

**Purpose**: Store processed data in PostgreSQL database

```python
class DatabaseSync:
    def __init__(self, db_connection):
        self.db = db_connection
    
    def store_prompt(self, prompt_data):
        # Insert prompt into prompts table
        # Link to monitor_id
        pass
    
    def store_response(self, response_data):
        # Insert response into responses table
        # Link to prompt_id and model info
        pass
    
    def store_mentions(self, response_id, mentions_data):
        # Insert brand_mentions and competitor_mentions
        # Include sentiment and context
        pass
    
    def store_citations(self, response_id, citations_data):
        # Insert citations with ranking and metadata
        pass
    
    def update_monitor_stats(self, monitor_id):
        # Aggregate data for monitor statistics
        # Update visibility scores and metrics
        pass
```

### Workflow Architecture

#### End-to-End Process Flow

1. **Monitor Setup** (Web App)
   - User creates monitor with brand name, competitors, industry
   - Configure AI models to query
   - Set monitoring frequency and parameters

2. **Prompt Generation** (Python Script)
   - Generate brand-specific, organic, and competitor prompts
   - Vary prompts to avoid detection/bias
   - Store prompts in database with metadata

3. **AI Model Querying** (Python Script)
   - Batch query multiple AI models with prompts
   - Handle rate limiting and API quotas
   - Collect responses with timing and cost data

4. **Response Analysis** (Python Script)
   - Analyze responses for brand/competitor mentions
   - Perform sentiment analysis
   - Extract citations and calculate visibility scores
   - Store processed data in database

5. **Data Visualization** (Web App)
   - Aggregate data for dashboard analytics
   - Generate charts and reports
   - Provide insights and recommendations

#### API Integration Points

**Laravel API Endpoints Needed**:
```php
// Monitor management
POST /api/monitors
GET /api/monitors/{id}
PUT /api/monitors/{id}
DELETE /api/monitors/{id}

// Prompt management
POST /api/monitors/{id}/prompts
GET /api/prompts/{id}/responses

// Analytics data
GET /api/monitors/{id}/stats
GET /api/analytics/dashboard
GET /api/analytics/trends

// Webhook for Python script updates
POST /api/webhooks/analysis-complete
```

**Python Script API Calls**:
```python
# Fetch pending prompts
requests.get(f"{API_BASE}/api/prompts/pending")

# Update response data
requests.post(f"{API_BASE}/api/responses", data=response_data)

# Trigger analytics refresh
requests.post(f"{API_BASE}/api/webhooks/analysis-complete")
```

### Required External Services

#### AI Model APIs
- **OpenAI API**: GPT-4o, ChatGPT Search
- **Anthropic API**: Claude 3 Sonnet, Claude 3 Haiku
- **Google AI API**: Gemini 2.0 Flash, Gemini Pro
- **Mistral API**: Mistral Small, Mistral Large

#### Supporting Services
- **NLP Processing**: spaCy, NLTK, or Hugging Face Transformers
- **Queue System**: Redis/Laravel Queues for background processing
- **Monitoring**: Application monitoring for script health
- **Rate Limiting**: Smart throttling to respect API limits

### Development Priority

#### Phase 1: Core Infrastructure
1. Implement missing database tables
2. Create Laravel API endpoints
3. Build basic Python script framework

#### Phase 2: AI Integration
1. Implement AI model clients
2. Build response analysis system
3. Create data synchronization pipeline

#### Phase 3: Analytics & Optimization
1. Build comprehensive analytics dashboard
2. Implement advanced scoring algorithms
3. Add monitoring and alerting systems

---

## Key Technical Challenges

1. **Rate Limiting**: Managing API quotas across multiple AI services
2. **Cost Control**: Optimizing queries to minimize API costs
3. **Data Quality**: Ensuring accurate mention detection and sentiment analysis
4. **Scalability**: Handling multiple monitors and high query volumes
5. **Real-time Updates**: Providing timely data updates to the dashboard

## Conclusion

The current PromptMention application is a well-designed frontend with comprehensive TypeScript interfaces and UI components, but lacks the backend infrastructure and AI integration necessary for core functionality. The missing components include:

- Complete database schema for storing monitors, prompts, responses, and analytics
- Python scripts for AI model integration and response analysis
- Laravel API endpoints for data management
- Background processing systems for automated monitoring

Building these components will transform the current mockup into a fully functional AI brand monitoring platform.