-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "generalSavingsAssignedTo" TEXT NOT NULL DEFAULT 'shared',
ADD COLUMN     "homeSavingsAssignedTo" TEXT NOT NULL DEFAULT 'shared',
ADD COLUMN     "travelSavingsAssignedTo" TEXT NOT NULL DEFAULT 'shared';
