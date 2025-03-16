/*
  Warnings:

  - You are about to alter the column `answer` on the `Question` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(5000)`.
  - You are about to alter the column `content` on the `QuestionAnswer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(5000)`.

*/
-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "answer" SET DATA TYPE VARCHAR(5000);

-- AlterTable
ALTER TABLE "QuestionAnswer" ALTER COLUMN "content" SET DATA TYPE VARCHAR(5000);
