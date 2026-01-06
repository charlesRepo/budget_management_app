# Deployment Guide - Budget Management App

This guide walks through deploying the Budget Management App to Render.

## Prerequisites

1. **GitHub Account**: Push your code to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Neon Database**: Your PostgreSQL database should be set up on Neon
4. **Google OAuth Credentials**: For production authentication

## Step 1: Prepare Your Database (Neon)

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a production database or use your existing one
3. Copy the connection string (it should look like):
   ```
   postgresql://user:password@host.neon.tech/database?sslmode=require
   ```
4. Run migrations on your production database:
   ```bash
   # Set DATABASE_URL temporarily
   export DATABASE_URL="your-neon-connection-string"
   cd backend
   npx prisma migrate deploy
   ```

## Step 2: Configure Google OAuth for Production

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `https://your-app-name.onrender.com/api/auth/google/callback`
   - Replace `your-app-name` with your actual Render service name
5. Save changes
6. Copy your **Client ID** and **Client Secret**

## Step 3: Push to GitHub

1. Commit all changes:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   ```

2. Push to GitHub:
   ```bash
   git push origin development  # or main
   ```

## Step 4: Deploy to Render

### Option A: Blueprint Deployment (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** > **Blueprint**
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Fill in the environment variables:

   | Variable | Value | Notes |
   |----------|-------|-------|
   | `DATABASE_URL` | Your Neon connection string | From Step 1 |
   | `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | From Step 2 |
   | `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret | From Step 2 |
   | `GOOGLE_CALLBACK_URL` | `https://your-app-name.onrender.com/api/auth/google/callback` | Replace with actual URL |
   | `JWT_SECRET` | Auto-generated | Render will generate this |
   | `SESSION_SECRET` | Auto-generated | Render will generate this |

6. Click **Apply** to start deployment

### Option B: Manual Deployment

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** > **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: budget-management-app
   - **Region**: Oregon (US West)
   - **Branch**: development (or main)
   - **Runtime**: Node
   - **Build Command**: `npm run render:build`
   - **Start Command**: `npm run render:start`
   - **Plan**: Free

5. Add environment variables (same as Option A above)
6. Click **Create Web Service**

## Step 5: Verify Deployment

1. Wait for the deployment to complete (usually 5-10 minutes for first deploy)
2. Click on your service URL (e.g., `https://your-app-name.onrender.com`)
3. Test the authentication flow:
   - Click "Sign in with Google"
   - Authenticate with your Google account
   - Verify you can access the dashboard

## Step 6: Run Database Migrations (First Time Only)

If migrations haven't been run yet, access the Render Shell:

1. In Render Dashboard, go to your service
2. Click **Shell** in the left sidebar
3. Run:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

## Troubleshooting

### Issue: "Cannot connect to database"
- **Solution**: Verify your `DATABASE_URL` is correct and includes `?sslmode=require`

### Issue: "Google OAuth redirect mismatch"
- **Solution**: Ensure the callback URL in Google Console exactly matches your Render URL

### Issue: "Build fails"
- **Solution**: Check build logs in Render. Common issues:
  - Missing environment variables
  - TypeScript compilation errors
  - Dependency installation failures

### Issue: "App loads but shows blank page"
- **Solution**: Check if the frontend build completed successfully:
  - Look for `frontend/dist` directory in build logs
  - Verify `NODE_ENV=production` is set

### Issue: "Authentication works but app crashes"
- **Solution**: Check runtime logs in Render for errors. Common issues:
  - Database connection issues
  - Missing JWT_SECRET or SESSION_SECRET
  - CORS configuration (should be handled automatically in production)

## Post-Deployment Checklist

- [ ] App loads successfully at your Render URL
- [ ] Google OAuth login works
- [ ] Dashboard displays correctly
- [ ] Can create/edit expenses
- [ ] Can manage income
- [ ] Settings page works
- [ ] All 4 account types display correctly
- [ ] Calculations are accurate
- [ ] Savings goals display
- [ ] Account credits can be added

## Updating the App

After making changes:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin development
   ```

2. Render will automatically redeploy (if auto-deploy is enabled)

## Environment Variables Reference

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/google/callback

# Security (auto-generated by Render)
JWT_SECRET=auto_generated_secret
SESSION_SECRET=auto_generated_secret
```

### Optional Variables

```bash
# Port (automatically set by Render)
PORT=10000

# Node Environment (automatically set)
NODE_ENV=production
```

## Architecture

The app runs as a single web service on Render:
- Backend (Express API) runs on Node.js
- Frontend (React SPA) is built and served as static files by the backend
- Database runs on Neon (serverless PostgreSQL)

```
┌─────────────────────────────────────┐
│         Render Web Service          │
│  ┌───────────────────────────────┐  │
│  │   Express Backend (Node.js)   │  │
│  │   - Serves API endpoints      │  │
│  │   - Serves React build        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Neon Database  │
         │   (PostgreSQL)  │
         └─────────────────┘
```

## Support

If you encounter issues:
1. Check Render logs: Dashboard > Your Service > Logs
2. Check build logs: Dashboard > Your Service > Events
3. Verify all environment variables are set correctly
4. Ensure database migrations have been run

## Security Notes

- Never commit `.env` files to Git
- Use Render's environment variable management
- Keep Google OAuth credentials secure
- JWT and Session secrets should be strong random strings
- Database connection always uses SSL (`sslmode=require`)
