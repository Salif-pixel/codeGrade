/*
  Warnings:

  - The values [PENDING,ACTIVE,COMPLETED] on the enum `ExamStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `attemptNumber` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `examId` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `answerId` on the `Correction` table. All the data in the column will be lost.
  - You are about to drop the column `correctedById` on the `Correction` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `fileCorrection` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `format` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `maxAttempts` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `answer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `ExamParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[submissionId]` on the table `Correction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[inviteCode]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `questionId` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submissionId` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Made the column `content` on table `Answer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `examId` to the `Correction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalScore` to the `Correction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submissionId` to the `Correction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Correction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED');

-- AlterEnum
BEGIN;
CREATE TYPE "ExamStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
ALTER TABLE "Exam" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Exam" ALTER COLUMN "status" TYPE "ExamStatus_new" USING ("status"::text::"ExamStatus_new");
ALTER TYPE "ExamStatus" RENAME TO "ExamStatus_old";
ALTER TYPE "ExamStatus_new" RENAME TO "ExamStatus";
DROP TYPE "ExamStatus_old";
ALTER TABLE "Exam" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_examId_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Correction" DROP CONSTRAINT "Correction_answerId_fkey";

-- DropForeignKey
ALTER TABLE "Correction" DROP CONSTRAINT "Correction_correctedById_fkey";

-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ExamParticipant" DROP CONSTRAINT "ExamParticipant_examId_fkey";

-- DropForeignKey
ALTER TABLE "ExamParticipant" DROP CONSTRAINT "ExamParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_answerId_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_correctionId_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_examId_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_examId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionAnswer" DROP CONSTRAINT "QuestionAnswer_answerId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionAnswer" DROP CONSTRAINT "QuestionAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";

-- DropIndex
DROP INDEX "Answer_studentId_examId_attemptNumber_key";

-- DropIndex
DROP INDEX "Question_examId_idx";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "attemptNumber",
DROP COLUMN "createdAt",
DROP COLUMN "examId",
DROP COLUMN "filePath",
DROP COLUMN "status",
DROP COLUMN "studentId",
DROP COLUMN "updatedAt",
ADD COLUMN     "questionId" TEXT NOT NULL,
ADD COLUMN     "submissionId" TEXT NOT NULL,
ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "content" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Correction" DROP COLUMN "answerId",
DROP COLUMN "correctedById",
ADD COLUMN     "comments" TEXT,
ADD COLUMN     "evaluation" TEXT,
ADD COLUMN     "examId" TEXT NOT NULL,
ADD COLUMN     "finalScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "isRevised" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "submissionId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "createdById",
DROP COLUMN "fileCorrection",
DROP COLUMN "filePath",
DROP COLUMN "format",
DROP COLUMN "maxAttempts",
ADD COLUMN     "aiCorrection" TEXT,
ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "examDocumentPath" TEXT,
ADD COLUMN     "inviteCode" TEXT,
ADD COLUMN     "inviteExpiry" TIMESTAMP(3),
ADD COLUMN     "teacherCorrectionPath" TEXT,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "answer",
ADD COLUMN     "correctAnswer" TEXT,
ADD COLUMN     "testCases" TEXT[];

-- DropTable
DROP TABLE "ExamParticipant";

-- DropTable
DROP TABLE "Grade";

-- DropTable
DROP TABLE "QuestionAnswer";

-- DropTable
DROP TABLE "account";

-- DropTable
DROP TABLE "session";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "verification";

-- DropEnum
DROP TYPE "ParticipantStatus";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamParticipation" (
    "id" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'PENDING',
    "joinedAt" TIMESTAMP(3),
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ExamParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentPath" TEXT,
    "studentId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ExamParticipation_examId_userId_key" ON "ExamParticipation"("examId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_studentId_examId_attemptNumber_key" ON "Submission"("studentId", "examId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Correction_submissionId_key" ON "Correction"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_inviteCode_key" ON "Exam"("inviteCode");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamParticipation" ADD CONSTRAINT "ExamParticipation_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamParticipation" ADD CONSTRAINT "ExamParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Correction" ADD CONSTRAINT "Correction_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Correction" ADD CONSTRAINT "Correction_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
