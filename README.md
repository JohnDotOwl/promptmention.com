# PromptMention - Brand Monitoring & Analytics Platform

A comprehensive brand monitoring and analytics solution built with Laravel, React, and AI-powered domain analysis. Track mentions, analyze competitors, and monitor your brand presence across the web.

## 🚀 Features

- **Real-time Brand Monitoring**: Track mentions and brand presence across multiple platforms
- **AI-Powered Analysis**: Advanced domain analysis using Google Vertex AI and Gemini API
- **Competitor Intelligence**: Monitor competitor activities and market positioning
- **Analytics Dashboard**: Comprehensive analytics with interactive charts and visualizations
- **Multi-step Onboarding**: Guided setup process with company analysis
- **OAuth Authentication**: Secure Google OAuth integration with waitlist system
- **Background Processing**: Efficient Redis queue system for data processing
- **Responsive Design**: Mobile-first UI with Tailwind CSS and shadcn/ui components

## 🛠 Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+) with Inertia.js and Laravel Octane
- **Frontend**: React 19 + TypeScript 5.7 with Vite 6
- **Database**: PostgreSQL with Laravel Query Builder
- **Styling**: Tailwind CSS 4.0 with shadcn/ui components
- **AI Integration**: Google Vertex AI + Gemini API with search grounding
- **Queue System**: Redis for background processing
- **Authentication**: Laravel Socialite with Google OAuth
- **Python Service**: Domain analysis microservice

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- PHP 8.2 or higher
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis server
- Python 3.9+
- Composer
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd promptmention
cd frontend
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install

# Install Python dependencies
cd ../backend
pip install -r requirements.txt
cd ../frontend
```

### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Setup

```bash
# Configure your PostgreSQL database in .env
# Create database
createdb promptmention

# Run migrations
php artisan migrate
```

### 5. Configure Services

Set up the following in your `.env` file:

- Database credentials (PostgreSQL)
- Redis configuration
- Google OAuth credentials
- Vertex AI API keys
- Application URL

### 6. Start Development Environment

```bash
# Start all services concurrently
composer dev

# Or start services individually:
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Queue worker
php artisan queue:listen

# Terminal 3: Node development server
npm run dev

# Terminal 4: Python backend service
cd ../backend
python domain_search_consumer.py
```

### 7. Access Your Application

Visit `http://localhost:8000` in your browser.

## 📁 Project Structure

```
promptmention/
├── frontend/                 # Laravel application
│   ├── app/
│   │   └── Http/Controllers/ # Application controllers
│   ├── resources/js/
│   │   ├── pages/           # React pages
│   │   └── components/      # React components
│   ├── routes/              # Application routes
│   └── config/              # Configuration files
├── backend/                 # Python microservice
│   ├── domain_search_consumer.py
│   ├── domain_search_consumer_vertex.py
│   └── requirements.txt
└── README.md               # This file
```

## 🔧 Development Commands

### Frontend (React/TypeScript)
```bash
npm run dev              # Start development server with hot reload
npm run build           # Build production assets
npm run build:ssr       # Build with SSR support
npm run lint            # Run ESLint with auto-fix
npm run format          # Format code with Prettier
npm run types           # Run TypeScript type checking
```

### Backend (Laravel/PHP)
```bash
php artisan serve         # Start Laravel development server
php artisan test          # Run Pest tests
composer test             # Run tests with config clearing
composer dev              # Start full development environment
composer dev:ssr          # Start development with SSR support
php artisan migrate       # Run database migrations
php artisan queue:listen  # Start queue worker
```

### Python Backend Service
```bash
cd backend
python domain_search_consumer.py              # Start domain analysis consumer
python domain_search_consumer_vertex.py       # Start Vertex AI consumer
pip install -r requirements.txt               # Install dependencies
```

## 🔐 Authentication Setup

1. **Google OAuth Configuration**:
   - Create a project in Google Cloud Console
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Set redirect URI to `{APP_URL}/auth/google/callback`
   - Add credentials to `.env` file

2. **Environment Variables**:
   Add the following to your `.env`:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI={APP_URL}/auth/google/callback
   ```

## 🤖 AI Integration Setup

### Vertex AI Configuration
1. Enable Vertex AI API in your Google Cloud project
2. Create a service account with appropriate permissions
3. Download the JSON key file
4. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

### Environment Variables
Add AI service configuration to `.env`:
```
VERTEX_AI_PROJECT_ID=your_project_id
VERTEX_AI_LOCATION=your_location
GEMINI_API_KEY=your_gemini_api_key
```

## 📊 Key Features Implementation

### Domain Analysis Service
The Python backend service handles AI-powered domain analysis:
- Background processing via Redis queues
- Company and competitor analysis
- Industry classification and keyword extraction
- Integration with Google Vertex AI and search grounding

### Real-time Monitoring
- WebSocket connections for live updates
- Redis pub/sub for real-time data streaming
- Automated background job processing

### Analytics Dashboard
- Interactive charts using Recharts
- Responsive design for all screen sizes
- Real-time data refresh capabilities
- Export functionality for reports

## 🔧 Advanced Configuration

### Queue Management
```bash
# Configure Redis queue in config/queue.php
# Set queue driver to redis
# Configure connection parameters
```

### Database Optimization
```bash
# Optimize database performance
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Production Deployment
```bash
# Build assets and optimize for production
npm run build && php artisan optimize
```

## 📝 Environment Variables

Key environment variables to configure:

```bash
# Application
APP_NAME=PromptMention
APP_ENV=local
APP_KEY=base64:your_app_key
APP_DEBUG=true
APP_URL=http://localhost

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=promptmention
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# AI Services
VERTEX_AI_PROJECT_ID=your_project_id
VERTEX_AI_LOCATION=your_location
GEMINI_API_KEY=your_gemini_key
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Ensure PostgreSQL is running
   - Verify database credentials in `.env`
   - Check database exists

2. **Queue Jobs Not Processing**:
   - Start Redis server
   - Run queue worker: `php artisan queue:listen`
   - Check queue configuration

3. **AI Integration Issues**:
   - Verify API keys and permissions
   - Check service account credentials
   - Ensure Vertex AI API is enabled

4. **Frontend Build Errors**:
   - Clear npm cache: `npm cache clean --force`
   - Remove node_modules and reinstall
   - Check Node.js version compatibility

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Redis Documentation](https://redis.io/documentation)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License (CC BY-NC-ND 4.0) - see the [LICENSE](LICENSE) file for details.

This means:
- ✅ You can view and share the project
- ✅ You must give attribution to the original author
- ❌ No commercial use is permitted
- ❌ No derivative works may be created
- ❌ No modifications may be made and shared

## 📞 Support

If you encounter any issues or have questions:
- Check the troubleshooting section above
- Review the documentation
- Ensure all environment variables are properly configured
- Verify all services are running correctly

---

**Note**: This is a complex application requiring multiple services. Ensure all prerequisites are met and services are properly configured before attempting to run the application.