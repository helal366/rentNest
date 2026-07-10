-- DropIndex
DROP INDEX "payments_rentalRequestId_key";

-- CreateIndex
CREATE INDEX "payments_landlordId_idx" ON "payments"("landlordId");

-- CreateIndex
CREATE INDEX "payments_rentalRequestId_idx" ON "payments"("rentalRequestId");
