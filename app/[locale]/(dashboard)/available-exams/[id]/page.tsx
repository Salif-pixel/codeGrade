import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {  ParticipantStatus } from "@prisma/client"
import TakeExamComponent from "@/components/exams/take-exam-component"

export default async function TakeExamPage({ params }: { params: { id: Promise<string> } }) {
  const header = await headers()
  const session = await auth.api.getSession({
    headers: header,
  })
  
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/available-exams/${await params.id}`)
  }
  
  // Récupérer l'examen avec ses questions
  const exam = await prisma.exam.findUnique({
    where: { id: await params.id },
    include: {
      questions: true,
      participants: {
        where: { userId: session.user.id }
      },
    }
  })
  
  if (!exam) {
    redirect("/404")
  }
  
  // Vérifier si l'utilisateur est autorisé à passer cet examen
  if (exam.participants.length === 0 || exam.participants[0].status !== ParticipantStatus.ACCEPTED) {
    redirect("/available-exams")
  }
  
  // Vérifier si l'examen est actif
  const now = new Date()
  if (exam.startDate && new Date(exam.startDate) > now) {
    redirect("/available-exams?error=not_started")
  }
  
  if (exam.endDate && new Date(exam.endDate) < now) {
    redirect("/available-exams?error=expired")
  }
  

  
  // Préparer les données pour le composant
  const examData = {
    id: exam.id,
    title: exam.title,
    description: exam.description || "",
    type: exam.type,
    format: exam.format || "",
    questions: exam.questions.map(q => ({
      id: q.id,
      text: q.text,
      maxPoints: q.maxPoints,
      choices: q.choices as string[] || [],
      programmingLanguage: q.programmingLanguage as "python" | "javascript" | "sql" || undefined,
      answer: q.answer || "",
      studentAnswer: ""
    })),
    timeRemaining: exam.endDate ? Math.max(0, new Date(exam.endDate).getTime() - now.getTime()) : null,
    maxAttempts: exam.maxAttempts || 1,
    currentAttempt: 1,
  }
  
  return <TakeExamComponent exam={examData}  userId={session.user.id} /> 
}

