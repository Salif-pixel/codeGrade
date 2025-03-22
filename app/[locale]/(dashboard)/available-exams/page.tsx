import { redirect } from "next/navigation"
import AvailableExamsComponent from "@/components/dashboard/available-exams/available-examscomponent"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ExamType, ParticipationStatus } from "@prisma/client"

interface ExamWithDetails {
  id: string
  title: string
  description: string | null
  startDate: Date | null
  endDate: Date | null
  type: ExamType
  status: ParticipationStatus
  finalScore: number | null
  maxPoints: number
  submissionCreatedAt: Date | null
}

async function getUserExams(userId: string): Promise<ExamWithDetails[]> {
  const participations = await prisma.examParticipation.findMany({
    where: {
      userId,
    },
    include: {
      exam: {
        include: {
          questions: {
            select: {
              maxPoints: true,
            },
          },
          submissions: {
            where: {
              studentId: userId,
            },
            select: {
              createdAt: true,
              correction: {
                select: {
                  finalScore: true,
                },
              },
            },
            take: 1, // Get latest submission
          },
        },
      },
    },
  })

  return participations.map((participation) => ({
    id: participation.exam.id,
    title: participation.exam.title,
    description: participation.exam.description,
    startDate: participation.exam.startDate,
    endDate: participation.exam.endDate,
    type: participation.exam.type,
    status: participation.status,
    finalScore: participation.exam.submissions[0]?.correction?.finalScore ?? null,
    maxPoints: participation.exam.questions.reduce((sum, q) => sum + q.maxPoints, 0),
    submissionCreatedAt: participation.exam.submissions[0]?.createdAt ?? null,
  }))
}

export default async function AvailableExamsPage() {
  const header = await headers()
  const session = await auth.api.getSession({
    headers: header,
  })

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/available-exams/`)
  }

  const exams = await getUserExams(session.user.id)

  return <AvailableExamsComponent exams={exams} />
}
