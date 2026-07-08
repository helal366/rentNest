/*
  Warnings:

  - The values [BAN] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('BANNED', 'UNBAN');
ALTER TABLE "public"."users" ALTER COLUMN "userStatus" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "userStatus" TYPE "UserStatus_new" USING ("userStatus"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "userStatus" SET DEFAULT 'UNBAN';
COMMIT;
