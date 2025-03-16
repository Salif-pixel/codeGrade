import { redirect } from "next/navigation"
import AvailableExamsComponent from "@/components/dashboard/available-examscomponent"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ExamType, ParticipantStatus } from "@prisma/client"

// Définir le type des examens attendu par le composant
interface ExamWithParticipation {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  type: ExamType
  format: string
  status: ParticipantStatus
  grade?: {
    finalScore: number
  }
  maxGrade: number
  submissionDate?: {
    createdAt: Date
  }
}

export default async function AvailableExamsPage() {
  const header = await headers()
  const session = await auth.api.getSession({
    headers: header,
  })

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/exams/`)
  }

  // Récupérer les examens auxquels l'étudiant participe
  const examParticipations = await prisma.examParticipant.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      exam: {
        include: {
          questions: true,
          grades: {
            where: {
              studentId: session.user.id
            }
          },
          answers: {
            where: {
              studentId: session.user.id
            }
          }
        }
      }
    },
  })

  // Formater les données pour le composant
  const exams: ExamWithParticipation[] = examParticipations.map(participation => ({
    id: participation.exam.id,
    title: participation.exam.title,
    description: participation.exam.description || "",
    startDate: participation.exam.startDate || new Date(),
    endDate: participation.exam.endDate || new Date(),
    type: participation.exam.type,
    format: participation.exam.format || "",
    status: participation.status,
    grade: participation.exam.grades[0],
    maxGrade: participation.exam.questions.reduce((acc, question) => acc + Number(question.maxPoints), 0),
    submissionDate: participation.exam.answers[0]
  }))

  return <AvailableExamsComponent exams={exams} />
}