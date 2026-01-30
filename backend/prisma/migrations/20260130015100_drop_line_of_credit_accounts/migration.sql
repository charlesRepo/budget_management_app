/*
  Warnings:

  - You are about to drop the column `lineOfCreditBalance` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `studentLineOfCreditBalance` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "lineOfCreditBalance",
DROP COLUMN "studentLineOfCreditBalance";
