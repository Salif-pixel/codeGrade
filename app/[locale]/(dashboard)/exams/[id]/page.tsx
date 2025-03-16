

import ExamInvitation from "@/components/exams/exam-invitation"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {ParticipantStatus} from "@prisma/client";

async function getExamWithDetails(examId: string) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
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
  const local = "fr"


  const exam = await getExamWithDetails(params.id)
  if (!exam) {
    redirect("/404")
  }

  // Vérifier si l'utilisateur est déjà participant
  const existingParticipant = exam.participants.find(
    (p) => p.userId === session?.user.id
  )

  // Si l'utilisateur est le créateur de l'examen, rediriger vers le dashboard
  if (exam.createdById === session?.user.id) {
    redirect(`/${local}/my-exams/`)
  }

  // Si l'utilisateur est déjà participant et a accepté, rediriger vers l'examen
  if (existingParticipant?.status === ParticipantStatus.ACCEPTED) {
    redirect(`/${local}/my-exams/`)
  }

  // Vérifier si l'examen est encore ouvert aux inscriptions
  const now = new Date()
  if (exam.endDate && new Date(exam.endDate) < now) {
    redirect("/exams/expired")
  }

  return (
    <div className="min-h-screen bg-background">
      <ExamInvitation 
        exam={exam} 
        user={session?.user as never }
        teacher={{
          name: exam.createdBy.name || "Enseignant",
          email: exam.createdBy.email,
        }}
      />
    </div>
  )
}