/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sslSessionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sslValidationId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `landlordId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sslSessionId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "payments_stripeCustomerId_key";

-- DropIndex
DROP INDEX "payments_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "landlordId" TEXT NOT NULL,
ADD COLUMN     "sslCardType" TEXT,
ADD COLUMN     "sslRiskTitle" TEXT,
ADD COLUMN     "sslSessionId" TEXT NOT NULL,
ADD COLUMN     "sslValidationId" TEXT,
ALTER COLUMN "provider" SET DEFAULT 'SSLCOMMERZ';

-- CreateIndex
CREATE UNIQUE INDEX "payments_sslSessionId_key" ON "payments"("sslSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_sslValidationId_key" ON "payments"("sslValidationId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
