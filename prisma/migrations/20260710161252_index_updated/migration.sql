-- DropIndex
DROP INDEX "properties_propertyCategoryId_idx";

-- DropIndex
DROP INDEX "users_role_idx";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "address" DROP DEFAULT,
ALTER COLUMN "contactNo" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "categories_id_idx" ON "categories"("id");

-- CreateIndex
CREATE INDEX "properties_id_idx" ON "properties"("id");

-- CreateIndex
CREATE INDEX "rentalRequests_id_idx" ON "rentalRequests"("id");

-- CreateIndex
CREATE INDEX "rentalRequests_tenantId_idx" ON "rentalRequests"("tenantId");

-- CreateIndex
CREATE INDEX "rentalRequests_landlordId_idx" ON "rentalRequests"("landlordId");

-- CreateIndex
CREATE INDEX "reviews_id_idx" ON "reviews"("id");

-- CreateIndex
CREATE INDEX "reviews_tenantId_idx" ON "reviews"("tenantId");

-- CreateIndex
CREATE INDEX "reviews_propertyId_idx" ON "reviews"("propertyId");

-- CreateIndex
CREATE INDEX "users_id_idx" ON "users"("id");
