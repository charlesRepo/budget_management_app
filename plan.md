# Budget Management App - Development Plan

## Project Structure Overview

```
budget-management-app/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API calls
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # Context providers (auth, app state)
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript types/interfaces
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── services/        # Business logic
│   │   ├── config/          # Configuration files
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                   # Shared types and utilities
│   └── types/
│
└── README.md
```

## Technology Stack Details

### Frontend
- **React** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **TanStack Query (React Query)** for server state management
- **Zustand** or **Context API** for client state
- **Tailwind CSS** + **shadcn/ui** for styling and components
- **React Hook Form** + **Zod** for form validation
- **Axios** for API calls
- **date-fns** for date manipulation

### Backend
- **Node.js** with **TypeScript**
- **Express.js** for API server
- **Passport.js** with **Google OAuth 2.0** strategy
- **PostgreSQL** as primary database
- **Prisma** as ORM for type-safe database access
- **Express-validator** for input validation
- **jsonwebtoken** for JWT token management
- **bcrypt** for any password hashing needs
- **cors** for cross-origin requests
- **helmet** for security headers
- **dotenv** for environment variables

### Development Tools
- **ESLint** + **Prettier** for code formatting
- **Jest** + **React Testing Library** for testing
- **Supertest** for API testing
- **Docker** for local database (optional)

### Deployment
- **Database**: Neon (Serverless Postgres)
- **Application**: Render (Single Web Service - serves both API and frontend)
- **Environment Variables**: Managed through Render dashboard

#### Why Neon + Render?

**Neon Benefits:**
- Serverless Postgres with automatic scaling
- Generous free tier (0.5 GB storage, 3 GB data transfer)
- Instant database branching for testing
- Point-in-time recovery (automated backups)
- Connection pooling built-in
- Sub-second cold starts
- Easy Prisma integration
- No maintenance overhead

**Render Benefits:**
- Simple deployment from Git
- Automatic HTTPS/SSL certificates
- Free tier available for hobby projects (750 hours/month)
- Auto-deploy on git push
- Built-in monitoring and logs
- DDoS protection included
- Easy environment variable management
- Single Web Service can serve both API and frontend (simpler architecture)
- No CORS configuration needed with single deployment
- Excellent documentation

**Combined Advantages:**
- Both services have free tiers suitable for personal projects
- Seamless integration between Neon and Render
- Minimal configuration needed
- You already have experience with both platforms
- Production-ready with minimal DevOps overhead

## Development Phases

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Initialize Project Structure
- Create monorepo structure or separate repositories
- Initialize frontend with Vite + React + TypeScript
- Initialize backend with Express + TypeScript
- Set up shared types package
- Configure ESLint, Prettier, and git hooks (husky)
- Create .gitignore files
- Initialize Git repository

### 1.2 Database Setup
- Create Neon project and database (free tier includes 0.5 GB storage)
- Set up local PostgreSQL for development (optional, can use Neon for both)
- Install and configure Prisma with Neon connection string
- Design database schema:
  - Users table (id, email, name, googleId, createdAt)
  - Expenses table (id, userId, name, category, amount, accountType, paymentType, frequency, activeMonths, notes, isArchived, createdAt, updatedAt)
  - Income table (id, userId, personName, amount, month, createdAt)
  - Settings table (id, userId, splitRatioPerson1, splitRatioPerson2, person1Name, person2Name, authorizedEmails)
- Create initial Prisma migration
- Seed database with sample data
- Configure connection pooling for Neon (Prisma supports this natively)

### 1.3 Authentication Setup
- Install and configure Passport.js with Google OAuth
- Set up Google Cloud Console project
- Configure OAuth 2.0 credentials
- Create environment variables for OAuth secrets
- Implement authentication middleware
- Create JWT token generation and validation
- Set up session management
- Create protected route middleware

### 1.4 Basic Backend Structure
- Create Express server with TypeScript
- Set up middleware (helmet, express.json, error handling)
- Configure to serve static files from frontend build (for production)
- Create basic health check endpoint at `/api/health`
- Set up environment configuration
- Create logging utility
- Set up error handling middleware
- Note: No CORS needed since frontend will be served from same origin

### 1.5 Basic Frontend Structure
- Set up React Router with basic routes
- Create auth context/provider
- Create API service layer with Axios (base URL: `/api` - same origin)
- Set up TanStack Query
- Create basic layout components (Header, Sidebar, Layout)
- Set up Tailwind CSS and shadcn/ui
- Create protected route component
- Configure Vite proxy for development (proxy `/api` to backend)

**Deliverables:**
- Fully initialized project with proper structure
- Database schema and migrations
- Working authentication flow (Google OAuth)
- Basic frontend and backend scaffolding

---

## Phase 2: Authentication & Authorization

### 2.1 Google OAuth Implementation
- Create login page with "Sign in with Google" button
- Implement OAuth callback handler on backend
- Generate and return JWT tokens
- Store user session in frontend
- Create logout functionality
- Handle OAuth errors and edge cases

### 2.2 Authorization & Access Control
- Implement email whitelist checking
- Create middleware to verify authorized users
- Add authorization checks to all protected routes
- Handle unauthorized access attempts
- Create 401/403 error pages

### 2.3 User Session Management
- Implement token refresh mechanism
- Add automatic logout on token expiration
- Create persistent login (remember me)
- Handle concurrent sessions
- Add session timeout warning

**Deliverables:**
- Fully functional authentication system
- Only authorized users can access the app
- Secure session management
- Proper error handling for auth failures

---

## Phase 3: Expense Management - Core CRUD

### 3.1 Backend API - Expenses
Create RESTful API endpoints:
- `GET /api/expenses` - Get all expenses (with filters)
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Soft delete (archive) expense
- Add validation for all endpoints
- Implement error handling
- Add pagination for expense list

### 3.2 Expense Model & Validation
- Create Expense TypeScript interfaces
- Implement Zod schemas for validation
- Create expense service layer for business logic
- Implement data transformation utilities
- Add category validation
- Validate amount format and ranges
- Validate activeMonths array

### 3.3 Frontend - Expense List View
- Create Expenses page component
- Fetch and display expenses using React Query
- Create ExpenseCard or ExpenseRow component
- Implement search functionality
- Add category filter dropdown
- Add account type filter (Checking/Credit Card)
- Add payment type filter (Automatic/Manual)
- Implement sorting (by name, amount, category)
- Add loading and error states
- Create empty state for no expenses

### 3.4 Frontend - Add/Edit Expense Form
- Create ExpenseForm component
- Implement form with React Hook Form + Zod
- Add all required fields:
  - Name input
  - Category dropdown
  - Amount input (formatted as currency)
  - Account type radio/select
  - Payment type radio/select
  - Frequency dropdown
  - Month selector for non-monthly expenses
  - Notes textarea
- Add form validation with error messages
- Implement submit handler
- Show success/error notifications
- Create reusable modal or side panel for form

### 3.5 Frontend - Delete/Archive Functionality
- Add delete button to expense items
- Implement confirmation dialog
- Call delete API endpoint
- Update UI optimistically with React Query
- Show success notification
- Handle errors gracefully

**Deliverables:**
- Full CRUD functionality for expenses
- User can add, view, edit, and delete expenses
- Proper validation and error handling
- Clean, intuitive UI for expense management

---

## Phase 4: Income Management & Settings

### 4.1 Backend API - Income
Create income management endpoints:
- `GET /api/income` - Get income records
- `POST /api/income` - Add income record
- `PUT /api/income/:id` - Update income record
- `DELETE /api/income/:id` - Delete income record
- Add validation for income amounts and dates

### 4.2 Backend API - Settings
Create settings management endpoints:
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings (split ratio, names)
- Validate split ratio percentages (must sum to 100)
- Store authorized email list

### 4.3 Frontend - Income Management
- Create Income page/section
- Form to add monthly income for both partners
- Display current and previous month income
- Edit existing income records
- Show total household income
- Validation for income values

### 4.4 Frontend - Settings Page
- Create Settings page
- Form to set/update split ratio
- Input fields for partner names (Person 1/Person 2)
- Manage authorized email addresses
- Save settings functionality
- Display current settings
- Validation for split ratio (must sum to 100)

**Deliverables:**
- Income tracking functionality
- Configurable settings (split ratio, names)
- Settings persisted in database
- Clean UI for income and settings management

---

## Phase 5: Calculation Engine & Dashboard

### 5.1 Backend - Calculation Service
Create service for financial calculations:
- Calculate total monthly expenses per account
- Prorate yearly/quarterly expenses to monthly amount
- Calculate each person's contribution based on split ratio
- Calculate surplus/deficit
- Handle different payment frequencies:
  - Monthly: full amount
  - Quarterly: amount divided by 3, only in active months
  - Yearly: amount divided by 12, only in active month
  - Custom: based on number of active months
- Create endpoint: `GET /api/calculations/:month` - Get calculations for specific month

### 5.2 Frontend - Calculation Display
- Create calculation utility functions (mirror backend logic)
- Create components to display:
  - Total expenses by account
  - Individual contributions by account
  - Total required per person
  - Surplus/deficit indicator
- Add visual indicators (green for surplus, red for deficit)
- Show breakdown of calculation
- Make calculations update in real-time as expenses change

### 5.3 Frontend - Dashboard Page
Create comprehensive dashboard with:
- **Summary Cards:**
  - Total monthly income
  - Total monthly expenses
  - Remaining balance (surplus/deficit)
  - Checking account total
  - Credit card account total

- **Contribution Breakdown:**
  - Person 1's contribution to Checking
  - Person 1's contribution to Credit Card
  - Person 2's contribution to Checking
  - Person 2's contribution to Credit Card
  - Total per person

- **Quick Stats:**
  - Number of automatic payments
  - Number of manual expenses
  - Savings total
  - Percentage of income used

- **Upcoming Expenses Alert:**
  - Show yearly/quarterly expenses due this month
  - Highlight if any non-monthly expenses are active

- **Month Selector:**
  - Date picker to view different months
  - Show historical data
  - Future month projections

### 5.4 Frontend - Visual Enhancements
- Add charts using recharts or Chart.js:
  - Pie chart for expense categories
  - Bar chart for Checking vs Credit Card
  - Line chart for income vs expenses over time
- Add progress bars for budget usage
- Color-coded category tags
- Icons for different expense types

**Deliverables:**
- Accurate calculation engine
- Comprehensive dashboard showing all key metrics
- Real-time updates when data changes
- Visual representations of financial data
- Month-by-month view capability

---

## Phase 6: Advanced Features & Refinements

### 6.1 Savings Goals
- Add savings goals CRUD operations (backend)
- Create UI for managing savings goals
- Include savings in contribution calculations
- Show progress toward savings goals
- Visual progress indicators

### 6.2 Month-Specific Calculations
- Implement month selector/calendar
- Calculate expenses active for selected month
- Handle prorated amounts correctly
- Show which yearly/quarterly expenses apply
- Historical view of past months
- Projection for future months

### 6.3 Data Import
- Create CSV import functionality
- Parse and validate CSV data
- Map CSV columns to expense fields
- Bulk import expenses
- Show import preview and confirmation
- Handle import errors gracefully

### 6.4 Export Functionality
- Implement CSV export of expenses
- Export current month snapshot
- Export date range
- Include calculated fields in export
- PDF export option for reports

### 6.5 Search & Filtering Enhancements
- Advanced search with multiple criteria
- Filter by date range
- Filter by amount range
- Combine multiple filters
- Save filter presets
- Quick filters for common views

**Deliverables:**
- Savings goal tracking
- Accurate month-specific calculations
- Data import/export capabilities
- Advanced search and filtering

---

## Phase 7: Polish, Testing & Deployment

### 7.1 Responsive Design
- Test on mobile devices (iOS and Android)
- Optimize layouts for tablet view
- Ensure touch-friendly interactions
- Test on different screen sizes
- Optimize performance for mobile networks

### 7.2 Error Handling & Validation
- Comprehensive frontend validation
- User-friendly error messages
- Network error handling
- Offline state handling
- Form validation feedback
- Loading states for all async operations

### 7.3 Testing
- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write component tests for React components
- Test authentication flow end-to-end
- Test calculation accuracy with various scenarios
- Test edge cases (empty states, large numbers, etc.)
- Browser compatibility testing

### 7.4 Performance Optimization
- Implement code splitting
- Optimize bundle size
- Add caching strategies
- Optimize database queries
- Add indexes to database
- Implement pagination for large datasets
- Lazy load components
- Optimize images and assets

### 7.5 Security Hardening
- Security audit of authentication
- Input sanitization
- SQL injection prevention (Prisma handles this)
- XSS prevention
- CSRF protection
- Rate limiting on API endpoints
- Secure HTTP headers (helmet)
- Environment variable security

### 7.6 Documentation
- README with setup instructions
- API documentation
- Component documentation
- Deployment guide
- User guide/help section in app
- Inline code comments where needed

### 7.7 Deployment

**Neon Database Setup:**
- Create production Neon project (if not already created)
- Run Prisma migrations on production database
- Set up automatic backups (Neon provides point-in-time recovery)
- Configure connection pooling
- Copy database connection string for Render

**Prepare Backend to Serve Frontend:**
- Install `express.static` middleware (already included in Express)
- Add middleware to serve built frontend files:
  ```typescript
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  // API routes
  app.use('/api', apiRoutes);

  // Catch-all route to serve index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
  ```

**Render Single Web Service Deployment:**
- Create new Web Service on Render
- Connect GitHub repository (or deploy from local)
- Set build command:
  ```bash
  cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build
  ```
- Set start command: `cd backend && npm run start`
- Configure environment variables in Render dashboard:
  - `DATABASE_URL` (from Neon)
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `JWT_SECRET`
  - `NODE_ENV=production`
  - `PORT=10000` (Render default)
- Enable auto-deploy on git push
- Set up health check endpoint: `/api/health`

**Benefits of Single Deployment:**
- No CORS configuration needed (same origin)
- Simpler environment variable management
- Single URL for entire application
- Easier cookie/session management for auth
- One service to monitor and maintain
- Cost-effective (single free-tier service)

**Additional Configuration:**
- Set up custom domain (optional)
- SSL certificates (Render provides automatic HTTPS)
- Set up Render monitoring and logging
- Configure health check monitoring
- Test production deployment thoroughly
- Set up CI/CD with GitHub Actions (optional)

**Deliverables:**
- Fully tested application
- Optimized performance
- Comprehensive documentation
- Production-ready deployment
- Secure and reliable application

---

## Phase 8: Launch & Post-Launch

### 8.1 User Acceptance Testing
- Both partners test the application
- Migrate existing data from CSV
- Verify calculations match expectations
- Test real-world usage scenarios
- Gather feedback

### 8.2 Iteration Based on Feedback
- Fix any bugs discovered
- Adjust UI/UX based on user feedback
- Optimize workflows
- Add small quality-of-life improvements

### 8.3 Monitoring & Maintenance
- Set up error monitoring (Sentry or similar)
- Monitor application performance
- Monitor database performance
- Set up automated backups
- Regular security updates
- Monitor for uptime

### 8.4 Future Enhancements Backlog
Prioritized list for future development:
1. Mobile app (React Native)
2. Bank account integration
3. Automatic transaction import
4. Receipt uploads
5. Email notifications for bills
6. Budget recommendations using AI
7. Multi-year historical analysis
8. Custom reporting
9. Budget forecasting
10. Bill payment reminders

**Deliverables:**
- Live, production-ready application
- Both users actively using the app
- Monitoring and maintenance plan
- Roadmap for future enhancements

---

## Timeline Estimates by Phase

**Phase 1: Project Setup** - Foundation for everything
**Phase 2: Authentication** - Security first
**Phase 3: Expense Management** - Core functionality
**Phase 4: Income & Settings** - Supporting features
**Phase 5: Dashboard & Calculations** - Key value proposition
**Phase 6: Advanced Features** - Nice-to-haves
**Phase 7: Polish & Deployment** - Production ready
**Phase 8: Launch** - Go live and iterate

---

## Risk Mitigation

### Technical Risks
- **OAuth Configuration Issues**: Test early, have fallback authentication
- **Calculation Accuracy**: Write comprehensive tests, verify with real data
- **Database Performance**: Index properly, implement pagination early
- **Security Vulnerabilities**: Follow best practices, use security linters

### User Adoption Risks
- **Complex UI**: Keep it simple, gather feedback early
- **Learning Curve**: Add tooltips, help text, and user guide
- **Data Migration**: Provide clear import process and validation

### Deployment Risks
- **Downtime**: Use reliable hosting, set up monitoring
- **Data Loss**: Implement regular backups from day one
- **Cost Overrun**: Start with free tiers, monitor usage

---

## Success Metrics

1. Both users can log in successfully
2. All expenses from CSV are migrated and managed
3. Calculations match manual spreadsheet calculations
4. App is faster and easier to use than Google Sheets
5. No data loss or security incidents
6. Mobile-friendly and responsive
7. Page load times under 2 seconds
8. 99%+ uptime
9. Users prefer app over spreadsheet within first month
10. App saves time compared to manual spreadsheet updates

---

## Next Steps

1. Review and approve requirements and plan
2. Set up development environment
3. Create Google Cloud Console project for OAuth
4. Initialize project structure (Phase 1)
5. Start with Phase 1, Step 1.1: Initialize Project Structure
