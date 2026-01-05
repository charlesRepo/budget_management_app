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
- Personal Line of Credit (debt account)
- Student Line of Credit (debt account)
- Clear differentiation of expenses allocated to each account
- Track current balance for each account in Settings
- View balance after monthly expenses
- Track monthly credits (money added TO accounts) such as government payments, tax refunds, bonuses

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
- **Monthly expenses**: Full amount charged every month (all 12 months active)
- **Quarterly expenses**: Full amount charged in each selected quarter month (no proration)
- **Yearly expenses**: Full amount charged once per year in selected month(s) (no proration)
- **Custom frequency**: Full amount charged in each selected month (no proration)
- Ability to specify exact months when payments are due
- Active month tags displayed on expense cards for non-monthly frequencies

### 3.4 Income & Contribution Calculation

#### 3.4.1 Income Tracking
- Enter both partners' salaries with payment period tracking (Part 1/Part 2)
  - Supports bi-weekly (2 paychecks per month) and semi-monthly (2 paychecks on fixed dates)
  - Each income entry specifies which payment period it belongs to (Part 1 or Part 2)
- Person names are selected from Settings configuration (not manually typed)
- Track income from current and previous months
- Historical income records by month and payment period

#### 3.4.2 Split Ratio Configuration
- **Manual mode**: Configurable split ratio (e.g., 60/40) set in Settings
- **Automatic mode**: Split ratio automatically calculated based on monthly income proportions
  - Formula: `person1Ratio = (person1Income / totalIncome) × 100`
  - Updates dynamically each month based on actual income
- Toggle between manual and automatic modes in Settings
- Automatic calculation of each person's contribution based on selected mode

#### 3.4.3 Contribution Calculation
The app must calculate and display:
- Total monthly expenses for all accounts (Checking, Credit Card, Personal Line of Credit, Student Line of Credit)
- **Monthly savings goals** included as contributions (Travel, Home, General savings)
- Each person's contribution amount per account based on split ratio
- **Part 1/Part 2 breakdown:** Show how much each person needs to contribute from their Part 1 and Part 2 income
  - Part 1 and Part 2 contributions are proportional to their Part 1 and Part 2 income amounts
  - This helps determine exact transfer amounts after each paycheck
  - Savings contributions also split by Part 1/Part 2
- **Remaining personal money:** Calculate and display how much money each person has left for personal expenses
  - Show remaining amount after Part 1 contribution (including savings)
  - Show remaining amount after Part 2 contribution (including savings)
  - Show total remaining amount for the month
- Full amount charged in active months (no proration for yearly/quarterly expenses)
- Current balance tracking and balance after expenses for each account
- Monthly credits applied to account balances (increases balance/reduces debt)

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
- **Travel Savings**: Monthly goal configurable in Settings (default: $1,000)
- **Home Savings**: Monthly goal configurable in Settings (default: $500)
- **General Savings**: Monthly goal configurable in Settings (default: $1,000)

#### 3.5.2 Savings Tracking
- Set monthly savings targets in Settings for each category
- Savings treated as monthly contributions (included in total expenses)
- Each person's savings contribution split by:
  - Split ratio (e.g., 60/40)
  - Part 1/Part 2 income proportions
- Savings reduce remaining personal money
- Dashboard displays savings breakdown by category and person
- Shows Part 1 and Part 2 contributions for each savings category

### 3.6 Dashboard & Reporting

#### 3.6.1 Main Dashboard
Display:
- Current month overview with month selector
- Summary cards: Total Income, Total Expenses, Balance (surplus/deficit)
- **4 Account Cards** (Checking, Credit Card, Personal Line of Credit, Student Line of Credit):
  - Current balance
  - Monthly expenses breakdown (Automatic vs Manual)
  - Monthly credits (if any) - displayed in green highlight
  - Part 1/Part 2 contributions per person
  - Balance after expenses
- **Savings Card** (shows if any savings goals set):
  - Travel, Home, General savings goals
  - Each person's contribution breakdown (Part 1, Part 2, Total)
- **Personal Summary Cards** for each person:
  - Income breakdown (Part 1, Part 2, Total)
  - Contribution breakdown (Part 1, Part 2, Total) including savings
  - Remaining personal money (After Part 1, After Part 2, Total)

#### 3.6.2 Monthly View
- Month selector/calendar view
- Expenses active for selected month (full amount charged, no proration)
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
  splitRatioPerson1: number // e.g., 60
  splitRatioPerson2: number // e.g., 40
  autoCalculateSplitRatio: boolean // true = calculate from income, false = use manual ratio
  userEmails: string[] // Authorized Google emails
  person1Name: string
  person2Name: string
  checkingBalance: number // Current balance in checking account
  creditCardBalance: number // Current balance (negative if owe money)
  lineOfCreditBalance: number // Personal Line of Credit balance (negative for debt)
  studentLineOfCreditBalance: number // Current balance (negative for debt)
  travelSavings: number // Monthly travel savings goal (default: 1000)
  homeSavings: number // Monthly home savings goal (default: 500)
  generalSavings: number // Monthly general savings goal (default: 1000)
}
```

### 4.4 Account Credit Object
```
{
  id: string
  userId: string
  description: string // e.g., "GST Credit", "Tax Refund"
  amount: number
  accountType: 'checking' | 'credit_card' | 'line_of_credit' | 'student_line_of_credit'
  month: string // YYYY-MM
  createdAt: timestamp
  updatedAt: timestamp
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
   - 4 account cards (Checking, Credit Card, Personal Line of Credit, Student Line of Credit) showing:
     - Current balance
     - Monthly expenses breakdown
     - Monthly credits (if any)
     - Part 1 and Part 2 contributions per person
     - Balance after expenses
   - Savings card (if goals set) showing breakdown for Travel, Home, General savings
   - Personal summary cards for each person showing:
     - Income breakdown (Part 1, Part 2, Total)
     - Contribution breakdown (Part 1, Part 2, Total) including savings
     - Remaining personal money (After Part 1, After Part 2, Total)
2. **Expenses List**: Searchable, filterable list of all expenses with:
   - Active month tags displayed for non-monthly expenses
   - Filters by account type, payment type
3. **Add/Edit Expense**: Form with:
   - Predefined category dropdown and 4 account types
   - Frequency selector with help text explaining calculation
   - Active months selector (for non-monthly frequencies)
4. **Income Management**:
   - Track income by person, payment period (Part 1/Part 2), and month
   - Inherited income from previous month with apply functionality
   - **Account Credits section**: Add/edit/delete credits by account and month
5. **Settings**: Manage:
   - Split ratios (manual or automatic mode)
   - Partner names
   - Account balances (4 accounts)
   - Monthly savings goals (Travel, Home, General)
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
- Accurate calculation of monthly contributions per person per account including savings
- Easy editing and updating of expense amounts
- Clear visualization of budget status (surplus/deficit)
- Handles yearly and quarterly expenses correctly (full amount in active months, no proration)
- Mobile-responsive interface
- Data persists reliably across sessions
- Savings goals tracked and contributions calculated with Part 1/Part 2 breakdown
- Account credits properly tracked and applied to account balances
- Auto split ratio calculation works based on monthly income
- Active month tags displayed for non-monthly expenses
