# CLAUDE.md

**CRITICAL: This is a production server. Do not run any commands that would delete or irreversibly alter existing data unless explicitly authorized.**

# To clear cache and build
npm run build && php artisan optimize

# General Rules
- This is a Laravel + Inertia.js + React project using TypeScript
- Database structure is located at agent/database.txt, not in migrations
- Do not read storage, vendor, bootstrap folders for source code - they contain logs and cached files
- All URL routes are located in routes/web.php, including controller names
- Backend logic is located in /app/Http/Controllers
- Frontend React pages are located in /resources/js/pages/
- Frontend React components are located in /resources/js/components/
- Use PostgreSQL query builders instead of Eloquent/Models in controllers
- Use Laravel Tinker to access database directly for data modification or reading
- PostgreSQL is the database, not SQLite - use query builders in controllers
- Keep PHP/business logic in Controllers and Services, not in React components
- Do not create tests unless specifically requested
- Do not create code structure that relies on fallbacks - it's better to fail and fix issues immediately
- Create controller logic and services first before modifying React components to minimize downtime
- For debugging, visit URLs directly at APP_URL from .env file - this is a production server hosted on the domain
- Connect to database directly using PostgreSQL credentials from .env file
- To schedule tasks, modify routes/console.php, not Kernel.php

# Inertia.js + React Specific Rules
- Controllers should return Inertia responses using `Inertia::render()`, not Blade views
- Pass data from controllers to React pages via Inertia response props
- React pages receive props from Laravel controllers automatically
- Use TypeScript interfaces for prop definitions in React components
- Frontend state management should be minimal - prefer server-side data fetching
- Navigation should use Inertia's `Link` component or `router.visit()`
- Data mutations should POST to Laravel routes and return Inertia responses

# Development Commands
- `php artisan tinker` - Access database directly
- `php artisan migrate` - Run migrations (**NEVER use migrate:fresh on production**)

# File Structure
- **Laravel Controllers:** /app/Http/Controllers/*.php - Business logic and Inertia responses
- **Laravel Routes:** routes/web.php - URL routing to controllers  
- **React Pages:** /resources/js/pages/*.tsx - Main page components that receive props from controllers
- **React Components:** /resources/js/components/*.tsx - Reusable UI components
- **TypeScript Types:** /resources/js/types/*.ts - Interface definitions
- **Database Schema:** agent/database.txt - Complete database structure documentation

# Development Workflow
1. Create/modify Laravel controller method to handle business logic
2. Ensure controller returns `Inertia::render('PageName', $data)` 
3. Create/modify React page component in /resources/js/pages/PageName.tsx
4. Define TypeScript interfaces for props received from controller
5. Test the flow: Route → Controller → Inertia Response → React Page
6. Run `npm run build && php artisan optimize` when changes are complete

# Important Notes
- Always visit deployed domain from APP_URL in .env instead of localhost
- Never run `migrate:fresh` or destructive commands without authorization
- This is a live production server - exercise extreme caution
- Inertia.js handles the bridge between Laravel and React - don't bypass it
- Prefer server-side data processing over client-side for better performance
