import ExamInvitation from "@/components/dashboard/exams/id/exam-invitation"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ParticipationStatus} from "@prisma/client"

async function getExamWithDetails(examId: string) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true,
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,  // Added id to properly check participant
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return exam
  } catch (error) {
    console.error("Error fetching exam:", error)
    return null
  }
}

export default async function ExamPage({ params }: { params: { id: string } }) {
  const header = await headers()
  const session = await auth.api.getSession({
    headers: header,
  })

  const locale = "fr"  // Changed from 'local' to 'locale' for consistency

  if (!session?.user) {
    redirect(`/${locale}/login`)
  }

  const exam = await getExamWithDetails(params.id)
  if (!exam) {
    redirect("/404")
  }

  // Check if user is already a participant
  const existingParticipant = exam.participants.find(
      (p) => p.userId === session.user.id
  )

  // If user is the creator, redirect to available exams
  if (exam.creatorId === session.user.id) {
    redirect(`/${locale}/available-exams/`)
  }

  // If user is already a participant with a status, redirect
  if (existingParticipant && [
    "ACCEPTED",
    "COMPLETED",
    "DECLINED"
  ].includes(existingParticipant.status as ParticipationStatus)) {
    redirect(`/${locale}/available-exams/`)
  }

  // Check if exam registration is still open
  const now = new Date()
  if (exam.endDate && new Date(exam.endDate) < now) {
    redirect(`/${locale}/available-exams/`)
  }

  return (
      <div className="min-h-screen bg-background">
        <ExamInvitation
            exam={exam}
            user={session.user as { id: string; name: string; email: string;}}
            teacher={{
              name: exam.creator.name || "Enseignant",
              email: exam.creator.email || "",
            }}
        />
      </div>
  )
}
