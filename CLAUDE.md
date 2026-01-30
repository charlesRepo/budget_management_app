# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A private household budget management web application that tracks expenses, income, and account balances across multiple accounts (checking, credit card, line of credit, student line of credit). Supports two-person household budgeting with customizable split ratios and bi-weekly income tracking.

## Tech Stack

- **Frontend**: React 19 + TypeScript, Vite, React Router, Axios
- **Backend**: Node.js + Express + TypeScript, Prisma ORM
- **Database**: PostgreSQL (hosted on Neon)
- **Auth**: Google OAuth 2.0 with JWT tokens and express-session
- **Deployment**: Render (single web service serving both frontend and backend)

## Development Commands

### Backend (from `backend/` directory)

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run prisma:generate    # Generate Prisma client after schema changes
npm run prisma:migrate     # Create and run migrations (development)
npm run prisma:studio      # Open Prisma Studio GUI
npm run prisma:seed        # Run seed script

# TypeScript compilation
npx tsc                    # Type-check without building
```

### Frontend (from `frontend/` directory)

```bash
# Development server (Vite dev server on port 5173)
npm run dev

# Build for production
npm run build              # Runs tsc -b && vite build

# Lint
npm run lint

# Preview production build locally
npm run preview
```

### Root (from project root)

```bash
# Render deployment commands
npm run render:build       # Full build process for deployment
npm run render:start       # Start production server
```

## Architecture

### Authentication & Authorization

- **OAuth Flow**: Google OAuth 2.0 → JWT token stored in localStorage
- **Email Authorization**: Server-side check against `Settings.authorizedEmails` array in `backend/src/middleware/auth.ts`
- **Session Management**: Express session for OAuth, JWT for API requests
- **Frontend**: `AuthContext` manages auth state, `ProtectedRoute` wrapper for authenticated routes

### Database Schema (Prisma)

Core models:
- `User`: Authenticated users (Google OAuth)
- `Expense`: Budget expenses with account type, payment type, frequency, and active months
- `Income`: Bi-weekly income tracking per person (part1/part2)
- `Settings`: User preferences, split ratios, account balances, savings goals, authorized emails
- `AccountCredit`: Credits added to accounts (government payments, refunds, etc.)

Key relationships:
- All models cascade delete with User
- Expenses support monthly/quarterly/yearly/custom frequencies with active month arrays
- Income tracked by `[userId, personName, month, paymentPeriod]` unique constraint

### Calculation Engine

**Location**: `backend/src/services/calculation.service.ts`

The calculation service is the core business logic that:
1. Calculates prorated expense amounts based on frequency and active months
2. Splits expenses between two people according to split ratios
3. Divides contributions into Part 1 and Part 2 based on income proportions
4. Tracks account balances and projections
5. Calculates savings goals and remaining income

**Key method**: `getMonthCalculations(userId, monthStr)` returns comprehensive monthly breakdown including:
- Per-account expenses and contributions (checking, credit card, both lines of credit)
- Per-person income, contributions, and remaining amounts (split by Part 1/Part 2)
- Savings calculations (travel, home, general)
- Account balance projections including credits

### Request Flow

1. Frontend service (`src/services/*.ts`) makes API call via axios
2. Vite dev proxy forwards `/api/*` to backend (dev) or Express serves frontend (prod)
3. Backend route (`src/routes/*.ts`) receives request
4. Auth middleware validates JWT and authorized email
5. Controller (`src/controllers/*.ts`) handles request
6. Service (`src/services/*.ts`) implements business logic
7. Prisma client interacts with PostgreSQL
8. Response flows back through the stack

### Frontend Structure

- **Pages**: Route-level components (Dashboard, Expenses, Income, Settings, etc.)
- **Components**: Reusable UI components (Layout, ProtectedRoute)
- **Services**: API client functions organized by domain
- **Context**: AuthContext for global auth state
- **Types**: Shared TypeScript interfaces matching backend models

### Backend Structure

- **Routes**: Express routers for each domain (auth, expenses, income, settings, calculations, accountCredits)
- **Controllers**: Request handlers that validate input and call services
- **Services**: Business logic layer (calculation engine, data transformations)
- **Middleware**: Authentication (`auth.ts`) and error handling
- **Config**: Prisma, Passport, JWT configuration

## Environment Setup

### Backend `.env` (required variables)

```bash
DATABASE_URL=          # Neon PostgreSQL connection string
GOOGLE_CLIENT_ID=      # Google Cloud Console OAuth client ID
GOOGLE_CLIENT_SECRET=  # Google Cloud Console OAuth client secret
JWT_SECRET=            # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=        # Generate another random string
FRONTEND_URL=          # http://localhost:5173 (dev) or production URL
AUTHORIZED_EMAILS=     # Comma-separated list (managed via Settings model, not actively used)
```

See `backend/.env.example` for complete template.

### Frontend `.env`

Frontend environment variables are typically empty in development due to Vite proxy configuration. Production uses environment variables set in Render.

## Database Workflow

1. Modify `backend/prisma/schema.prisma`
2. Generate Prisma client: `npm run prisma:generate`
3. Create migration: `npm run prisma:migrate` (creates migration file and applies it)
4. Prisma client types are automatically updated

## Key Concepts

### Expense Frequency & Active Months

Expenses have a `frequency` field (monthly, quarterly, yearly, custom) and `activeMonths` array (1-12). The calculation service returns the FULL expense amount for each active month (no proration across months). This allows flexible scheduling:
- Monthly: All 12 months active
- Yearly: One month active (e.g., [12] for December)
- Quarterly: Three months active (e.g., [3,6,9,12])
- Custom: Any combination of months

### Split Ratios

Settings contain `splitRatioPerson1` and `splitRatioPerson2` percentages that determine how expenses are divided between partners. Can be set manually or auto-calculated from income proportions when `autoCalculateSplitRatio` is enabled.

### Income Parts (Part 1/Part 2)

Bi-weekly income tracking: each person can enter income for "Part 1" (first half of month) and "Part 2" (second half). Expense contributions are split proportionally across Part 1 and Part 2 based on income distribution.

### Account Credits

Track money added TO accounts (not expenses). Examples: government payments, tax refunds, bonuses. These are factored into balance calculations via `accountCreditService.getTotalCreditsByAccount()`.

## Deployment Notes

- Single web service on Render serves both frontend (static files) and backend API
- Production build: `npm run render:build` installs and builds both backend and frontend
- Backend serves frontend static files from `dist/` when `NODE_ENV=production`
- All API routes prefixed with `/api/`, frontend uses client-side routing
- Environment variables managed in Render dashboard

## Common Tasks

**Add a new API endpoint**:
1. Define route in `backend/src/routes/*.ts`
2. Create controller in `backend/src/controllers/*.controller.ts`
3. Add service logic in `backend/src/services/*.service.ts` if needed
4. Create frontend service function in `frontend/src/services/*.ts`
5. Use in React component via API call

**Add a database field**:
1. Update `backend/prisma/schema.prisma`
2. Run `npm run prisma:generate`
3. Run `npm run prisma:migrate` (creates and applies migration)
4. Update TypeScript types in `frontend/src/types/index.ts`
5. Update relevant controllers/services

**Debug authentication issues**:
- Check JWT token in localStorage: `localStorage.getItem('authToken')`
- Verify email is in Settings.authorizedEmails array (database or Prisma Studio)
- Check `backend/src/middleware/auth.ts` for authorization logic
- Review OAuth callback flow in `backend/src/routes/auth.ts` and `frontend/src/pages/AuthCallback.tsx`
