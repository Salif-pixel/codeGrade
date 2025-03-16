-- CreateTable
CREATE TABLE "QuestionAnswer" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "answerId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "QuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionAnswer_answerId_questionId_key" ON "QuestionAnswer"("answerId", "questionId");

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
