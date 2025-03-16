/*
  Warnings:

  - You are about to drop the column `correctionAi` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "filePath" DROP NOT NULL,
ALTER COLUMN "format" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "correctionAi",
ADD COLUMN     "choices" TEXT[],
ADD COLUMN     "programmingLanguage" TEXT;
