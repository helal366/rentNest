-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "provider" SET DEFAULT 'STRIPE',
ALTER COLUMN "method" SET DEFAULT 'CARD';

-- AlterTable
ALTER TABLE "rentalRequests" ALTER COLUMN "requestStatus" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "userStatus" SET DEFAULT 'UNBAN';
