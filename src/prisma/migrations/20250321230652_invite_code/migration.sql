/*
  Warnings:

  - You are about to drop the column `inviteCode` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `inviteExpiry` on the `Exam` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Exam_inviteCode_key";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "inviteCode",
DROP COLUMN "inviteExpiry";
