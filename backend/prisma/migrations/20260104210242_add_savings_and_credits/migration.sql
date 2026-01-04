-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "autoCalculateSplitRatio" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "generalSavings" DOUBLE PRECISION NOT NULL DEFAULT 1000,
ADD COLUMN     "homeSavings" DOUBLE PRECISION NOT NULL DEFAULT 500,
ADD COLUMN     "travelSavings" DOUBLE PRECISION NOT NULL DEFAULT 1000;

-- CreateTable
CREATE TABLE "AccountCredit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "accountType" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountCredit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountCredit_userId_idx" ON "AccountCredit"("userId");

-- CreateIndex
CREATE INDEX "AccountCredit_month_idx" ON "AccountCredit"("month");

-- CreateIndex
CREATE INDEX "AccountCredit_accountType_idx" ON "AccountCredit"("accountType");

-- AddForeignKey
ALTER TABLE "AccountCredit" ADD CONSTRAINT "AccountCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
