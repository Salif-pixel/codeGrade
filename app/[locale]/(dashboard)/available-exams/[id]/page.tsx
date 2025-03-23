import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ParticipationStatus } from "@prisma/client"
import TakeExamComponent from "@/components/dashboard/available-exams/id/take-exam-component"
import {ExamData} from "@/components/dashboard/exams/types";

async function getExamData(examId: string, userId: string) : Promise<ExamData | null> {
  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
      status: "PUBLISHED"
    },
    include: {
      questions: true,
      participants: {
        where: { userId },
      },
      submissions: {
        where: { studentId: userId },
        orderBy: { attemptNumber: "desc" },
        take: 1,
        include: {
          answers: true,
        },
      },
    },
  })

  if (!exam || exam.participants.length === 0 || exam.participants[0].status !== ParticipationStatus.ACCEPTED) {
    return null
  }

  const now = new Date()
  if (exam.startDate && exam.startDate > now) return null
  if (exam.endDate && exam.endDate < now) return null

  const latestSubmission = exam.submissions[0]
  const currentAttempt = (latestSubmission?.attemptNumber || 0) + 1

  return {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    type: exam.type,
    status: exam.status,
    examDocumentPath: exam.examDocumentPath,
    teacherCorrectionPath: exam.teacherCorrectionPath,
    questions: exam.questions.map((q) => ({
      id: q.id,
      text: q.text,
      maxPoints: q.maxPoints,
      choices: q.choices,
      programmingLanguage: (q.programmingLanguage ?? "javascript") as "javascript" | "python" | "java" | "cpp" | "csharp",
    })),
    timeRemaining: exam.endDate ? Math.max(0, exam.endDate.getTime() - now.getTime()) : null,
    currentAttempt,
  }
}

export default async function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const header = await headers()
  const session = await auth.api.getSession({ headers: header })
  const { id } = await params

  const locale = "fr"

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/available-exams/${id}`)
  }

  const examData : ExamData = await getExamData(id, session.user.id) as ExamData

  if (!examData) {
    const now = new Date()
    const exam = await prisma.exam.findUnique({ where: { id } })
    if (exam?.startDate && exam.startDate > now) {
      redirect(`/${locale}/available-exams?error=not_started`)
    }
    if (exam?.endDate && exam.endDate < now) {
      redirect(`/${locale}/available-exams?error=expired`)
    }
    redirect(`/${locale}/available-exams`)
  }

  return <TakeExamComponent exam={examData} userId={session.user.id} />
}
