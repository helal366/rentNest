/*
  Warnings:

  - You are about to drop the column `approvedTenantId` on the `rentalRequests` table. All the data in the column will be lost.
  - You are about to drop the column `useStatus` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[approvedTenantId]` on the table `properties` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,propertyId]` on the table `rentalRequests` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `method` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `rentPrice` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userStatus` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'WALLET', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PropertyAmenity" AS ENUM ('WIFI', 'PARKING', 'AIR_CONDITIONING', 'HEATING', 'KITCHEN', 'WASHER', 'DRYER');

-- DropForeignKey
ALTER TABLE "rentalRequests" DROP CONSTRAINT "rentalRequests_approvedTenantId_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "method",
ADD COLUMN     "method" "PaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "amenities" "PropertyAmenity"[],
ADD COLUMN     "approvedTenantId" TEXT,
ADD COLUMN     "rentPrice" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "rentalRequests" DROP COLUMN "approvedTenantId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "useStatus",
ADD COLUMN     "userStatus" "UserStatus" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "properties_approvedTenantId_key" ON "properties"("approvedTenantId");

-- CreateIndex
CREATE UNIQUE INDEX "rentalRequests_tenantId_propertyId_key" ON "rentalRequests"("tenantId", "propertyId");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_approvedTenantId_fkey" FOREIGN KEY ("approvedTenantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
