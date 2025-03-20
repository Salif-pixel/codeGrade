import TakeExamComponent from "@/components/exams/take-exam-component";
import { ParticipantStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {useLocale} from "next-intl";

type Params = { id: string };

// Fonction generateMetadata
export async function generateMetadata({ params }: { params: Params }) {
  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    select: { title: true, description: true },
  });


  if (!exam) {
    return {
      title: "Examen non trouvé",
      description: "L'examen demandé n'existe pas.",
    };
  }

  return {
    title: `${exam.title} | CodeGrade`,
    description: exam.description || "Passez votre examen sur CodeGrade",
  };
}

// Fonction de page
export default async function TakeExamPage({ params }: { params: Params }) {
  const header = await headers();
  const session = await auth.api.getSession({
    headers: header,
  });
  const local = 'fr'

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/available-exams/${params.id}`);
  }

  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    include: {
      questions: true,
      participants: {
        where: { userId: session.user.id },
      },
    },
  });

  if (!exam) {
    redirect("/404");
  }

  if (exam.participants.length === 0 || exam.participants[0].status !== ParticipantStatus.ACCEPTED) {
    redirect(`/${local}/available-exams`);
  }

  const now = new Date();
  if (exam.startDate && new Date(exam.startDate) > now) {
    redirect(`/${local}/available-exams?error=not_started`);
  }

  if (exam.endDate && new Date(exam.endDate) < now) {
    redirect(`/${local}/available-exams?error=expired`);
  }

  const examData = {
    id: exam.id,
    filePath: exam.filePath,
    title: exam.title,
    description: exam.description || "",
    type: exam.type,
    format: exam.filePath?.split(".").pop() || "",
    questions: exam.questions.map((q) => ({
      id: q.id,
      text: q.text,
      maxPoints: q.maxPoints,
      choices: (q.choices as string[]) || [],
      programmingLanguage: (q.programmingLanguage as "python" | "javascript" | "sql") || undefined,
      answer: q.answer || "",
      studentAnswer: "",
    })),
    timeRemaining: exam.endDate ? Math.max(0, new Date(exam.endDate).getTime() - now.getTime()) : null,
    maxAttempts: exam.maxAttempts || 1,
    currentAttempt: 1,
    fileCorrection: exam.fileCorrection || "",
  };

  return <TakeExamComponent exam={examData as never} userId={session.user.id} />;
}