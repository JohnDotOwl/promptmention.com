# Project: PromptMention

## 1. Vision & Core Architecture
- **The Goal:** A SaaS platform for monitoring and analyzing brand visibility across Large Language Models (LLMs) and AI systems, helping businesses track and optimize how their brands appear in AI-generated content.
- **Tech Stack:** Laravel 11, React with Inertia.js, TypeScript, Tailwind CSS, SQLite, Vite, shadcn/ui components.
- **Key Decisions:** 
  - Server-side rendering with Inertia.js for seamless SPA experience
  - Component-based architecture using shadcn/ui for consistent UI
  - Multi-step onboarding process to capture essential business information
  - Mock data implementation for MVP demonstration

---

## 2. Active Task Board
*This is the queue for work that is planned or in progress. When a task is done, its row is deleted from here and the Application Structure below is updated.*

| Task                          | Status | Spec File                                              |
| ----------------------------- | :----: | ------------------------------------------------------ |
| Implement Monitor Creation    |   🧊   | _(Spec not created yet)_                               |
| Connect Real LLM APIs         |   🧊   | _(Spec not created yet)_                               |
| Build Prompt Management       |   🧊   | _(Spec not created yet)_                               |
| Implement Analytics Backend   |   🧊   | _(Spec not created yet)_                               |
| Add Team Management           |   🧊   | _(Spec not created yet)_                               |
| Create Billing Integration    |   🧊   | _(Spec not created yet)_                               |

**Status Key:** 🧊 Backlog | 📝 Spec in Progress | ⏳ In Development

---

## 3. Application Structure & Features (The Site Map)
*This is a living blueprint of the application. It maps every page, its purpose, and its features.*

### 🌐 Public-Facing Site
*This section covers all pages accessible to non-logged-in users.*

- **`/` (Welcome Page)**
  - **Purpose:** Marketing landing page to explain PromptMention's value proposition.
  - **Features:**
    - Hero section with product description
    - Feature highlights (AI monitoring, analytics, brand tracking)
    - Call-to-action for registration
    - Login/Register navigation links

### 🔑 Authentication Pages
*This section covers pages related to user authentication.*

- **`/login` (Login Page)**
  - **Purpose:** Allow existing users to sign in.
  - **Features:**
    - Email and password fields
    - "Remember me" checkbox
    - "Login" button
    - Link to password reset
    - Link to registration

- **`/register` (Registration Page)**
  - **Purpose:** Allow new users to create an account.
  - **Features:**
    - Name, email, and password fields
    - Password confirmation
    - "Register" button
    - Link to login page

- **`/forgot-password` (Password Reset Request)**
  - **Purpose:** Request password reset email.
  - **Features:**
    - Email field
    - "Send reset link" button

### 🎯 Onboarding Flow (Requires Authentication)
*Multi-step process for new users to set up their account.*

- **`/onboarding/step/1` (Company Information)**
  - **Purpose:** Collect basic company details.
  - **Features:**
    - Company name input
    - Website URL input
    - Navigation to next step

- **`/onboarding/step/2` (User Details)**
  - **Purpose:** Collect user profile information.
  - **Features:**
    - First and last name
    - Job title selection
    - Company size dropdown
    - Industry selection
    - Usage goals checkboxes

- **`/onboarding/step/3` (Website Analysis)**
  - **Purpose:** Analyze and confirm website details.
  - **Features:**
    - Automatic website analysis
    - Industry detection
    - Meta description extraction
    - Completion confirmation

### 🔒 Main Application (Requires Login & Onboarding)
*Core application features accessible after authentication and onboarding.*

- **`/dashboard` (Main Dashboard)**
  - **Purpose:** Central hub showing key metrics and insights.
  - **Features:**
    - Trial status alert
    - Key metrics cards (monitors, citations, visibility score)
    - Recent activity feed
    - Quick action buttons
    - Brand visibility chart

#### 📊 Brand & Marketing Section

- **`/brand-book` (Brand Book)**
  - **Purpose:** Manage brand guidelines and assets.
  - **Features:**
    - _(To be implemented)_

- **`/competitors` (Competitors)**
  - **Purpose:** Track and analyze competitor visibility in AI.
  - **Features:**
    - _(To be implemented)_

- **`/personas` (Customer Personas)**
  - **Purpose:** Define and manage target customer personas.
  - **Features:**
    - _(To be implemented)_

#### 🔍 Monitoring Section

- **`/monitors` (Monitors List)**
  - **Purpose:** View and manage brand monitoring queries.
  - **Features:**
    - List of active monitors with status
    - Visibility scores and trends
    - Citation counts
    - Response frequency metrics
    - "New Monitor" button
    - Filter and sort options

- **`/monitors/{id}` (Monitor Details)**
  - **Purpose:** Detailed view of a specific monitor.
  - **Features:**
    - **Overview Tab:**
      - Visibility score chart
      - Top citing models
      - Recent responses
      - Key metrics
    - **Responses Tab:**
      - Full response history
      - Model breakdown
      - Response analysis
    - **Citations Tab:**
      - Citation tracking
      - Source analysis
      - Ranking information
    - **Heatmap Tab:**
      - Visual representation of visibility patterns
      - Time-based analysis
    - **Settings Tab:**
      - Monitor configuration
      - Alert settings
      - Export options

- **`/prompts` (Prompts Management)**
  - **Purpose:** Create and manage AI prompts for brand monitoring.
  - **Features:**
    - Prompts table with search and filters
    - Create new prompts
    - Edit existing prompts
    - Performance metrics per prompt

- **`/responses` (AI Responses)**
  - **Purpose:** View and analyze AI model responses.
  - **Features:**
    - Response history table
    - Filter by model, date, prompt
    - Response analysis
    - Export functionality

- **`/citations` (Citations Tracking)**
  - **Purpose:** Track where and how brand is cited in AI responses.
  - **Features:**
    - Citation list with sources
    - Citation frequency analysis
    - Ranking information
    - Trend visualization

#### 📈 Analytics Section

- **`/analytics` (Analytics Dashboard)**
  - **Purpose:** Comprehensive analytics and insights.
  - **Features:**
    - Time series visibility chart
    - Geographic distribution map
    - Top pages analysis
    - Device breakdown
    - Traffic sources
    - Conversion metrics
    - Domain filtering
    - Time period selection

- **`/crawlers` (Crawler Analytics)**
  - **Purpose:** Track web crawler activity and setup.
  - **Features:**
    - **Overview Tab:**
      - Crawler activity chart
      - Logs table with details
      - Time period filtering
    - **Settings Tab:**
      - Analytics script installation guide
      - Embed code generator
      - Configuration options

#### 🌐 Website Management

- **`/sitemap` (Sitemap)**
  - **Purpose:** Manage website structure for crawling.
  - **Features:**
    - _(To be implemented)_

### ⚙️ Settings Section
*User and system configuration pages.*

- **`/settings/profile` (Profile Settings)**
  - **Purpose:** Manage user profile information.
  - **Features:**
    - Name and email update
    - Profile information form
    - Account deletion option

- **`/settings/password` (Password Settings)**
  - **Purpose:** Update account password.
  - **Features:**
    - Current password verification
    - New password fields
    - Password requirements display

- **`/settings/appearance` (Appearance Settings)**
  - **Purpose:** Customize UI appearance.
  - **Features:**
    - Theme selection (light/dark/system)
    - _(Additional customization to be implemented)_

- **`/settings/crawler-analytics` (Crawler Settings)**
  - **Purpose:** Configure crawler and analytics settings.
  - **Features:**
    - _(To be implemented)_

- **`/settings/billing` (Billing Overview)**
  - **Purpose:** Manage subscription and billing.
  - **Features:**
    - Current plan details
    - Payment method
    - Billing history
    - Upgrade options

- **`/settings/billing/usage` (Usage & Limits)**
  - **Purpose:** Monitor resource usage against plan limits.
  - **Features:**
    - **Overview Tab:**
      - Usage cards with progress bars
      - Current vs. maximum values
      - Color-coded indicators (red/yellow/blue)
    - **Detailed Breakdown Tab:**
      - Resource allocation details
      - Usage percentages
    - **Usage History Tab:**
      - Daily usage tracking
      - Historical trends
      - Export functionality