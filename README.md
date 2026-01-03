# Budget Management App

A private web application for managing household budget with multiple accounts and customizable expense allocation.

## Project Structure

```
budget-management-app/
├── frontend/          # React + TypeScript frontend
├── backend/           # Express + TypeScript backend
├── requirements.md    # Detailed requirements document
└── plan.md           # Development plan
```

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TanStack Query, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: PostgreSQL (Neon)
- **Auth**: Google OAuth 2.0
- **Deployment**: Render (single web service)

## Prerequisites

- Node.js 18+ and npm
- Neon account (for PostgreSQL database)
- Google Cloud Console project (for OAuth)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Neon Database

1. Go to [Neon](https://neon.tech/) and create a free account
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:pass@host/db`)
4. Keep this for the next step

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Copy Client ID and Client Secret

### 4. Configure Environment Variables

**Backend (`backend/.env`):**
```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` and fill in:
- `DATABASE_URL` - Your Neon connection string
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `JWT_SECRET` - Generate a random string (e.g., run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `SESSION_SECRET` - Generate another random string

**Frontend (`frontend/.env`):**
```bash
cp frontend/.env.example frontend/.env
```
(For development, this file can remain mostly empty as Vite proxy handles API calls)

### 5. Set Up Database Schema

Once you have your Neon connection string configured:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 6. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

## Development

### Frontend Structure

```
frontend/src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── services/       # API calls
├── hooks/          # Custom React hooks
├── context/        # Context providers
├── utils/          # Utility functions
└── types/          # TypeScript types
```

### Backend Structure

```
backend/src/
├── controllers/    # Request handlers
├── models/         # Database models (Prisma)
├── routes/         # API routes
├── middleware/     # Auth, validation, etc.
├── services/       # Business logic
└── config/         # Configuration
```

## Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (DB GUI)

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Deployment

See [plan.md](./plan.md) Phase 7.7 for detailed deployment instructions to Render.

## Project Status

Currently in Phase 1: Project Setup & Infrastructure

## License

MIT
