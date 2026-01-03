-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "googleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "accountType" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "activeMonths" INTEGER[],
    "notes" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Income" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "month" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "splitRatioPerson1" INTEGER NOT NULL DEFAULT 50,
    "splitRatioPerson2" INTEGER NOT NULL DEFAULT 50,
    "person1Name" TEXT NOT NULL DEFAULT 'Person 1',
    "person2Name" TEXT NOT NULL DEFAULT 'Person 2',
    "authorizedEmails" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "Expense_userId_idx" ON "Expense"("userId");

-- CreateIndex
CREATE INDEX "Expense_accountType_idx" ON "Expense"("accountType");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Income_userId_idx" ON "Income"("userId");

-- CreateIndex
CREATE INDEX "Income_month_idx" ON "Income"("month");

-- CreateIndex
CREATE UNIQUE INDEX "Income_userId_personName_month_key" ON "Income"("userId", "personName", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
