-- AlterTable: Add paymentPeriod column with default value
ALTER TABLE "Income" ADD COLUMN "paymentPeriod" TEXT NOT NULL DEFAULT 'part1';

-- Update the existing records to ensure they have the default value (if any exist)
UPDATE "Income" SET "paymentPeriod" = 'part1' WHERE "paymentPeriod" IS NULL;

-- Drop the old unique constraint
DROP INDEX "Income_userId_personName_month_key";

-- Create new unique constraint including paymentPeriod
CREATE UNIQUE INDEX "Income_userId_personName_month_paymentPeriod_key" ON "Income"("userId", "personName", "month", "paymentPeriod");

-- Remove the default constraint since paymentPeriod should be explicitly provided
ALTER TABLE "Income" ALTER COLUMN "paymentPeriod" DROP DEFAULT;
