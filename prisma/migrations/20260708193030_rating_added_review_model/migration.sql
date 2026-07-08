/*
  Warnings:

  - Added the required column `rating` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "rating" INTEGER NOT NULL;
