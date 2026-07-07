/*
  Warnings:

  - The values [KAMRAPUR] on the enum `PropertyLocation` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PropertyLocation_new" AS ENUM ('JATRABARI', 'JURAINE', 'MOTIJHEEL', 'TIKATULI', 'DOYAGANJ', 'GULISTAN', 'MUGDA', 'MANDA', 'KAMLAPUR', 'FAKIRAPUL', 'GOLAPBAG', 'GOPIBAGBASABO', 'KHILGAON', 'RAMPURA', 'BANASRI', 'HATIRJHEEL', 'DHANMONDI', 'JIGATOLA', 'FARMGATE');
ALTER TABLE "public"."properties" ALTER COLUMN "location" DROP DEFAULT;
ALTER TABLE "properties" ALTER COLUMN "location" TYPE "PropertyLocation_new" USING ("location"::text::"PropertyLocation_new");
ALTER TYPE "PropertyLocation" RENAME TO "PropertyLocation_old";
ALTER TYPE "PropertyLocation_new" RENAME TO "PropertyLocation";
DROP TYPE "public"."PropertyLocation_old";
ALTER TABLE "properties" ALTER COLUMN "location" SET DEFAULT 'JATRABARI';
COMMIT;
