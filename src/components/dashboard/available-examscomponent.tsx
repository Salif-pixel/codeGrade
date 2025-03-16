"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {Link } from '@/i18n/navigation'
import { Clock, CheckCircle, AlertCircle, Trophy, Calendar, FileText, Code, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ExamType, ParticipantStatus } from "@prisma/client"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"


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

interface AvailableExamsComponentProps {
  exams: ExamWithParticipation[]
}

export default function AvailableExamsComponent({ exams }: AvailableExamsComponentProps) {
  const t = useTranslations("exams-component")
  // État pour stocker les compteurs
  const [countdowns, setCountdowns] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simuler un chargement
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Fonction pour mettre à jour les compteurs
  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<string, string> = {}

      exams.forEach((exam) => {
        if (exam.status === ParticipantStatus.ACCEPTED && new Date(exam.endDate) > new Date()) {
          const dueDate = new Date(exam.endDate)
          const now = new Date()
          const diff = dueDate.getTime() - now.getTime()

          if (diff <= 0) {
            newCountdowns[exam.id] = t("assignment.expired")
          } else {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            if (days > 0) {
              newCountdowns[exam.id] = `${days}j ${hours}h`
            } else if (hours > 0) {
              newCountdowns[exam.id] = `${hours}h ${minutes}m`
            } else {
              newCountdowns[exam.id] = `${minutes}m`
            }
          }
        }
      })

      setCountdowns(newCountdowns)
    }

    // Mettre à jour immédiatement
    updateCountdowns()

    // Puis mettre à jour toutes les minutes
    const interval = setInterval(updateCountdowns, 60000)

    return () => clearInterval(interval)
  }, [exams, t])

  // Fonction pour formater la date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  // Fonction pour déterminer si un examen est actif
  const isExamActive = (exam: ExamWithParticipation) => {
    const now = new Date()
    return new Date(exam.startDate) <= now && new Date(exam.endDate) >= now
  }

  // Fonction pour obtenir l'icône du type d'examen
  const getExamTypeIcon = (type: ExamType) => {
    switch (type) {
      case ExamType.QCM:
        return <FileText className="h-4 w-4" />
      case ExamType.CODE:
        return <Code className="h-4 w-4" />
      case ExamType.DOCUMENT:
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="transition-all">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      {exams.length === 0 ? (
        <Card className="p-6 text-center">
          <CardTitle className="mb-2">{t("noExams.title")}</CardTitle>
          <CardDescription>{t("noExams.description")}</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card
              key={exam.id}
              className={`transition-all hover:shadow-md ${
                exam.status === ParticipantStatus.COMPLETED || !isExamActive(exam) ? "opacity-80" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    {getExamTypeIcon(exam.type)}
                    {t(`assignment.type.${exam.type}`)}
                  </div>
                  {exam.status === ParticipantStatus.COMPLETED ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      {exam.grade && (
                        <span className="font-medium">
                          {exam.grade.finalScore}/{exam.maxGrade}
                        </span>
                      )}
                    </div>
                  ) : !isExamActive(exam) ? (
                    <div className="flex items-center gap-1 text-amber-600">
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs">
                        {new Date(exam.startDate) > new Date() 
                          ? t("assignment.upcoming") 
                          : t("assignment.expired")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">{countdowns[exam.id]}</span>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg">{exam.title}</CardTitle>
                <CardDescription>
                  {exam.status === ParticipantStatus.COMPLETED
                    ? t("assignment.status.completed")
                    : isExamActive(exam)
                    ? `${t("assignment.deadline")}: ${formatDate(exam.endDate)}`
                    : new Date(exam.startDate) > new Date()
                    ? `${t("assignment.starts")}: ${formatDate(exam.startDate)}`
                    : `${t("assignment.expired")}: ${formatDate(exam.endDate)}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      exam.type === ExamType.QCM
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                        : exam.type === ExamType.DOCUMENT
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                        : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
                    }`}
                  >
                    {t(`assignment.type.${exam.type}`)}
                  </Badge>

                  {exam.status === ParticipantStatus.COMPLETED && exam.grade && (
                    <Badge className="ml-auto rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                      <Trophy className="mr-1 h-3 w-3" />
                      {t("assignment.grade")}: {exam.grade.finalScore}/{exam.maxGrade}
                    </Badge>
                  )}

                  {exam.status === ParticipantStatus.ACCEPTED && isExamActive(exam) && (
                    <Badge
                      className={`ml-auto rounded-full px-2 py-1 text-xs font-medium ${
                        !countdowns[exam.id]
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          : countdowns[exam.id]?.includes("h") && !countdowns[exam.id]?.includes("j")
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                      }`}
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      {countdowns[exam.id] || t("assignment.loading")}
                    </Badge>
                  )}

                  {!isExamActive(exam) && new Date(exam.endDate) < new Date() && (
                    <Badge className="ml-auto rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {t("assignment.expired")}
                    </Badge>
                  )}

                  {!isExamActive(exam) && new Date(exam.startDate) > new Date() && (
                    <Badge className="ml-auto rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                      <Calendar className="mr-1 h-3 w-3" />
                      {t("assignment.upcoming")}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {exam.status === ParticipantStatus.COMPLETED ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/available-exams/${exam.id}/results`}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t("assignment.viewResults")}
                    </Link>
                  </Button>
                ) : !isExamActive(exam) ? (
                  <Button variant="outline" className="w-full" disabled>
                    {new Date(exam.startDate) > new Date() ? (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        {t("assignment.notStarted")}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        {t("assignment.expired")}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={`/available-exams/${exam.id}`}>
                      {exam.type === ExamType.QCM
                        ? t("assignment.takeQuiz")
                        : exam.type === ExamType.DOCUMENT
                        ? t("assignment.uploadFile")
                        : t("assignment.writeCode")}
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

