import express, { Request, Response } from 'express';
import helmet from 'helmet';
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import path from 'path';
import passport from './config/passport';
import prisma from './config/prisma';
import authRoutes from './routes/auth';
import expenseRoutes from './routes/expenses';
import incomeRoutes from './routes/income';
import settingsRoutes from './routes/settings';
import calculationRoutes from './routes/calculations';
import accountCreditRoutes from './routes/accountCredits';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration (needed for passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // Clean up expired sessions every 2 minutes
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Expense routes
app.use('/api/expenses', expenseRoutes);

// Income routes
app.use('/api/income', incomeRoutes);

// Settings routes
app.use('/api/settings', settingsRoutes);

// Calculation routes
app.use('/api/calculations', calculationRoutes);

// Account credit routes
app.use('/api/account-credits', accountCreditRoutes);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendBuildPath));

  // Catch-all route to serve index.html for client-side routing
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
