# Budget Management App - Requirements Document

## Project Overview
A web-based budget management application for a household with two income earners to track and manage shared expenses across multiple accounts with customizable split ratios.

## 1. Authentication & Security

### 1.1 User Authentication
- Users must authenticate using Google OAuth 2.0
- Only authorized Google accounts (you and your partner) can access the application
- No public access or bot access allowed
- Session management with automatic logout after inactivity

### 1.2 Security Requirements
- All financial data must be encrypted at rest and in transit
- HTTPS-only connections
- Protected API endpoints requiring valid authentication tokens
- Rate limiting to prevent abuse

## 2. Technology Stack

### 2.1 Frontend
- React (latest stable version)
- Modern UI framework (e.g., Material-UI, Chakra UI, or Tailwind CSS)
- State management solution (e.g., Redux, Zustand, or Context API)
- Responsive design for desktop and mobile devices

### 2.2 Backend
- Node.js with Express or similar framework
- RESTful API or GraphQL
- Database: PostgreSQL (via Neon) with Prisma ORM for data persistence
- Authentication: Passport.js with Google OAuth strategy or similar

### 2.3 Deployment
- Application: Render (Single Web Service serving both API and frontend)
- Database: Neon (Serverless PostgreSQL)
- Architecture: Backend serves built React frontend (no separate frontend deployment needed)

## 3. Core Features

### 3.1 Expense Management

#### 3.1.1 Expense Entry
- Add new expenses manually with the following fields:
  - Expense name/description
  - Category (Essentials, Home, Software & Gaming, Entertainment, Leisure, etc.)
  - Amount (in dollars)
  - Account type (Checking or Credit Card)
  - Payment type (Automatic or Manual)
  - Payment frequency (Monthly, Quarterly, Yearly, or Custom)
  - Active months (shown only for Quarterly, Yearly, or Custom frequencies; Monthly automatically applies to all 12 months)
  - Notes/comments field

#### 3.1.2 Expense Editing
- Edit any expense field easily
- Update amounts when expenses change
- Soft delete with archive functionality (maintain history)

#### 3.1.3 Expense Categories
- Pre-defined categories dropdown:
  - Essentials
  - Home
  - Software & Gaming
  - Entertainment
  - Leisure
  - Transportation
  - Healthcare
  - Insurance
  - Utilities
  - Groceries
  - Dining Out
  - Shopping
  - Education
  - Other
- Category selection via dropdown (not manual entry)
- Color-coding for visual identification

### 3.2 Account Management

#### 3.2.1 Account Types
- Joint Checking Account
- Joint Credit Card Account
- Line of Credit (debt account)
- Student Line of Credit (debt account)
- Clear differentiation of expenses allocated to each account
- Track current balance for each account in Settings
- View balance after monthly expenses

#### 3.2.2 Account Summaries
- Total monthly expenses per account
- Running balance/budget for each account
- Visual indicators for over/under budget

### 3.3 Payment Tracking

#### 3.3.1 Payment Types
- **Automatic Payments**: Pre-authorized recurring bills
- **Manual Payments**: Expenses requiring manual action (groceries, gas, shopping)
- Visual differentiation between payment types

#### 3.3.2 Payment Frequency & Scheduling
- Monthly expenses (default)
- Quarterly expenses (specify which months: e.g., Feb, Apr, Jun, Aug)
- Yearly expenses (specify the month)
- Custom frequency (e.g., twice a year, three times a year)
- Ability to specify exact months when payments are due

### 3.4 Income & Contribution Calculation

#### 3.4.1 Income Tracking
- Enter both partners' salaries with payment period tracking (Part 1/Part 2)
  - Supports bi-weekly (2 paychecks per month) and semi-monthly (2 paychecks on fixed dates)
  - Each income entry specifies which payment period it belongs to (Part 1 or Part 2)
- Person names are selected from Settings configuration (not manually typed)
- Track income from current and previous months
- Historical income records by month and payment period

#### 3.4.2 Split Ratio Configuration
- Configurable split ratio (currently 60/40 based on salary difference)
- Ability to adjust ratio as needed
- Automatic calculation of each person's contribution

#### 3.4.3 Contribution Calculation
The app must calculate and display:
- Total monthly expenses for all accounts (Checking, Credit Card, Line of Credit, Student Line of Credit)
- Each person's contribution amount per account based on split ratio
- **Part 1/Part 2 breakdown:** Show how much each person needs to contribute from their Part 1 and Part 2 income
  - Part 1 and Part 2 contributions are proportional to their Part 1 and Part 2 income amounts
  - This helps determine exact transfer amounts after each paycheck
- **Remaining personal money:** Calculate and display how much money each person has left for personal expenses
  - Show remaining amount after Part 1 contribution
  - Show remaining amount after Part 2 contribution
  - Show total remaining amount for the month
- Handling of prorated yearly/quarterly expenses
- Current balance tracking and balance after expenses for each account

**Example Calculation:**
- Total Checking expenses: $8,096.94
- Person A (60%):
  - Part 1 contribution: $2,429.08
  - Part 2 contribution: $2,429.08
  - Total: $4,858.16
- Person B (40%):
  - Part 1 contribution: $1,619.39
  - Part 2 contribution: $1,619.39
  - Total: $3,238.78

**Personal Money Example:**
- Person A Income: Part 1 ($3,000), Part 2 ($3,000), Total ($6,000)
- Person A Contributions: Part 1 ($2,429), Part 2 ($2,429), Total ($4,858)
- Person A Remaining: Part 1 ($571), Part 2 ($571), Total ($1,142)

### 3.5 Savings Goals

#### 3.5.1 Savings Categories
- Travel savings
- Home savings
- Long-term savings
- Custom savings goals

#### 3.5.2 Savings Tracking
- Set monthly savings targets
- Track savings allocation with split ratio
- Progress tracking toward goals

### 3.6 Dashboard & Reporting

#### 3.6.1 Main Dashboard
Display:
- Current month overview
- Total income vs. total expenses
- Remaining balance (surplus/deficit)
- Contribution breakdown per person per account
- Upcoming expenses (for current month)
- Alerts for yearly/quarterly expenses due in current month

#### 3.6.2 Monthly View
- Month selector/calendar view
- Expenses active for selected month
- Prorated calculations for non-monthly expenses
- Historical data view

#### 3.6.3 Reports & Analytics
- Monthly expense breakdown by category
- Trends over time
- Checking vs. Credit Card spending patterns
- Export functionality (CSV, PDF)

## 4. Data Model

### 4.1 Expense Object
```
{
  id: string
  name: string
  category: string // Selected from predefined list
  amount: number
  accountType: 'checking' | 'credit_card' | 'line_of_credit' | 'student_line_of_credit'
  paymentType: 'automatic' | 'manual'
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  activeMonths: number[] // [1-12], automatically all 12 for monthly
  notes: string
  createdAt: timestamp
  updatedAt: timestamp
  isArchived: boolean
}
```

### 4.2 Income Object
```
{
  id: string
  personName: string // Selected from Settings (person1Name or person2Name)
  amount: number
  month: string // YYYY-MM
  paymentPeriod: 'part1' | 'part2' // For tracking bi-weekly/semi-monthly payments
  createdAt: timestamp
}
```

### 4.3 Settings Object
```
{
  splitRatio: { person1: number, person2: number } // e.g., { person1: 60, person2: 40 }
  userEmails: string[] // Authorized Google emails
  person1Name: string
  person2Name: string
  checkingBalance: number // Current balance in checking account
  creditCardBalance: number // Current balance (negative if owe money)
  lineOfCreditBalance: number // Current balance (negative for debt)
  studentLineOfCreditBalance: number // Current balance (negative for debt)
}
```

## 5. User Interface Requirements

### 5.1 Layout
- Clean, modern, intuitive interface
- Responsive design (mobile and desktop)
- Quick access to add/edit expenses
- Persistent navigation

### 5.2 Key Views
1. **Dashboard**: Comprehensive overview with:
   - Summary cards (Total Income, Total Expenses, Balance)
   - 4 account cards (Checking, Credit Card, Line of Credit, Student Line of Credit) showing:
     - Current balance
     - Monthly expenses
     - Part 1 and Part 2 contributions per person
     - Balance after expenses
   - Personal summary cards for each person showing:
     - Income breakdown (Part 1, Part 2, Total)
     - Contribution breakdown (Part 1, Part 2, Total)
     - Remaining personal money (After Part 1, After Part 2, Total)
2. **Expenses List**: Searchable, filterable list of all expenses
3. **Add/Edit Expense**: Form with predefined category dropdown and 4 account types
4. **Income Management**: Track income by person, payment period (Part 1/Part 2), and month
5. **Settings**: Manage split ratios, partner names, and account balances
6. **Reports**: Analytics and historical data

### 5.3 Interactivity
- Real-time calculation updates
- Inline editing where appropriate
- Confirmation dialogs for destructive actions
- Loading states and error handling

## 6. Non-Functional Requirements

### 6.1 Performance
- Page load time < 2 seconds
- Real-time calculations without noticeable lag
- Efficient database queries

### 6.2 Usability
- Intuitive UI requiring minimal learning curve
- Mobile-friendly touch targets
- Clear error messages and validation

### 6.3 Reliability
- 99% uptime target
- Automatic backups of financial data
- Error logging and monitoring

### 6.4 Maintainability
- Clean, documented code
- Modular architecture
- Automated testing (unit, integration)

## 7. Future Enhancements (Out of Scope for MVP)
- Bank account integration/automatic transaction import
- Multi-currency support
- Budget forecasting and recommendations
- Mobile native apps (iOS/Android)
- Expense receipt uploads
- Notification system for upcoming bills
- Multiple household support
- Advanced reporting and data visualization

## 8. Success Criteria
- Both users can successfully authenticate via Google
- All expenses from CSV can be migrated and managed
- Accurate calculation of monthly contributions per person per account
- Easy editing and updating of expense amounts
- Clear visualization of budget status (surplus/deficit)
- Handles yearly and quarterly expenses correctly
- Mobile-responsive interface
- Data persists reliably across sessions
