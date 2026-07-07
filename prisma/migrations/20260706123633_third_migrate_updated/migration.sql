/*
  Warnings:

  - You are about to drop the column `propertyCategory` on the `properties` table. All the data in the column will be lost.
  - Added the required column `propertyCategoryId` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyAmenity" ADD VALUE 'SWIMMING_POOL';
ALTER TYPE "PropertyAmenity" ADD VALUE 'GYM';
ALTER TYPE "PropertyAmenity" ADD VALUE 'ELEVATOR';

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_approvedTenantId_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_landlordId_fkey";

-- DropIndex
DROP INDEX "properties_approvedTenantId_key";

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "propertyCategory",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "propertyCategoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "PropertyCategory";

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "properties_propertyCategoryId_idx" ON "properties"("propertyCategoryId");

-- CreateIndex
CREATE INDEX "properties_landlordId_idx" ON "properties"("landlordId");

-- CreateIndex
CREATE INDEX "properties_approvedTenantId_idx" ON "properties"("approvedTenantId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_propertyCategoryId_fkey" FOREIGN KEY ("propertyCategoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_approvedTenantId_fkey" FOREIGN KEY ("approvedTenantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
