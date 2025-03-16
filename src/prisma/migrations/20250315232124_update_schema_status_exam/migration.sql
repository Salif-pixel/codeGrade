-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'CORRECTED', 'REVISED');

-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "status" "ExamStatus" NOT NULL DEFAULT 'PENDING';
