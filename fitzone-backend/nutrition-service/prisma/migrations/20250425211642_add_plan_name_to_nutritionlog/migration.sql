/*
  Warnings:

  - Added the required column `planName` to the `NutritionLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NutritionLog" ADD COLUMN     "planName" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "NutritionLog_userId_planName_idx" ON "NutritionLog"("userId", "planName");
