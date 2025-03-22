"use client"

import {useState, useEffect} from "react"
import {useTranslations} from "next-intl"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Link} from '@/i18n/navigation'
import {Clock, CheckCircle, AlertCircle, Trophy, Calendar, FileText, Code} from "lucide-react"
import {Badge} from "@/components/ui/badge"
import {ExamType, ParticipationStatus} from "@prisma/client"
import {Skeleton} from "@/components/ui/skeleton"
import {cn} from "@/lib/utils";

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

interface AvailableExamsComponentProps {
    exams: ExamWithDetails[]
}

export default function AvailableExamsComponent({exams}: AvailableExamsComponentProps) {
    const t = useTranslations("exams-component")
    const [countdowns, setCountdowns] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    useEffect(() => {
        const updateCountdowns = () => {
            const newCountdowns: Record<string, string> = {}
            const now = new Date()

            exams.forEach((exam) => {
                if (exam.status === ParticipationStatus.ACCEPTED && exam.endDate && exam.endDate > now) {
                    const diff = exam.endDate.getTime() - now.getTime()
                    if (diff <= 0) {
                        newCountdowns[exam.id] = t("assignment.expired")
                    } else {
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                        newCountdowns[exam.id] = days > 0
                            ? `${days}j ${hours}h`
                            : hours > 0
                                ? `${hours}h ${minutes}mn`
                                : `${minutes}mn`
                    }
                }
            })

            setCountdowns(newCountdowns)
        }

        updateCountdowns()
        const interval = setInterval(updateCountdowns, 60000)
        return () => clearInterval(interval)
    }, [exams, t])

    const formatDate = (date: Date | null) => {
        if (!date) return t("date.undefined")
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date)
    }

    const isExamActive = (exam: ExamWithDetails) => {
        const now = new Date()
        return exam.startDate && exam.endDate &&
            exam.startDate <= now &&
            exam.endDate >= now
    }

    const getExamTypeIcon = (type: ExamType) => {
        const className = "h-4 w-4"
        switch (type) {
            case ExamType.QCM:
                return <FileText className={className}/>
            case ExamType.CODE:
                return <Code className={className}/>
            case ExamType.DOCUMENT:
                return <FileText className={className}/>
            default:
                return <FileText className={className}/>
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-6">
                <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array(6).fill(0).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-1/3 mb-2"/>
                                <Skeleton className="h-6 w-3/4 mb-1"/>
                                <Skeleton className="h-4 w-1/2"/>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-4"/>
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full"/>
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
                    {exams.map((exam) => {
                        const active = isExamActive(exam)
                        const completed = exam.status === ParticipationStatus.COMPLETED
                        const upcoming = exam.startDate && exam.startDate > new Date()
                        const expired = exam.endDate && exam.endDate < new Date()

                        return (
                            <Card key={exam.id}
                                  className={`transition-all hover:shadow-md ${completed || !active ? "opacity-80" : ""}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center gap-3">
                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                            {getExamTypeIcon(exam.type)}
                                            {t(`assignment.type.${exam.type}`)}
                                        </div>
                                        {completed ? (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="h-5 w-5"/>
                                                {exam.finalScore !== null && (
                                                    <span
                                                        className="font-medium">{exam.finalScore}/{exam.maxPoints || 20}</span>
                                                )}
                                            </div>
                                        ) : !active ? (
                                            <div className="flex items-center gap-1 text-amber-600">
                                                <Calendar className="h-5 w-5"/>
                                                <span
                                                    className="text-xs">{upcoming ? t("assignment.upcoming") : t("assignment.expired")}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-blue-600">
                                                <Clock className="h-5 w-5"/>
                                                <span
                                                    className="font-medium">{countdowns[exam.id] || t("assignment.loading")}</span>
                                            </div>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                                    <CardDescription>
                                        {completed ? t("assignment.status.completed")
                                            : active ? `${t("assignment.deadline")}: ${formatDate(exam.endDate)}`
                                                : upcoming ? `${t("assignment.starts")}: ${formatDate(exam.startDate)}`
                                                    : `${t("assignment.expired")}: ${formatDate(exam.endDate)}`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Badge variant="outline" className={cn(
                                            "rounded-full px-2 py-1 text-xs font-medium",
                                            "dark:bg-black bg-zinc-200 text-primary"
                                        )}>
                                            {t(`assignment.type.${exam.type}`)}
                                        </Badge>
                                        {completed && exam.finalScore !== null && (
                                            <Badge
                                                className="ml-auto dark:bg-black bg-zinc-200 text-green-600 rounded-full px-2 py-1 text-xs font-medium">
                                                <Trophy className="mr-1 h-3 w-3"/>
                                                {t("assignment.grade")}: {exam.finalScore}/{exam.maxPoints || 20}
                                            </Badge>
                                        )}

                                        {!active && expired && (
                                            <Badge
                                                className="ml-auto dark:bg-black bg-zinc-200 text-red-600 rounded-full px-2 py-1 text-xs font-medium">
                                                <AlertCircle className="mr-1 h-3 w-3"/>
                                                {t("assignment.expired")}
                                            </Badge>
                                        )}
                                        {!active && upcoming && (
                                            <Badge
                                                className="ml-auto dark:bg-black bg-zinc-200 text-amber-600 rounded-full px-2 py-1 text-xs font-medium">
                                                <Calendar className="mr-1 h-3 w-3"/>
                                                {t("assignment.upcoming")}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    {completed ? (
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/available-exams/${exam.id}/results`}>
                                                <CheckCircle className="mr-2 h-4 w-4"/>
                                                {t("assignment.viewResults")}
                                            </Link>
                                        </Button>
                                    ) : !active ? (
                                        <Button variant="outline" className="w-full" disabled>
                                            {upcoming ? (
                                                <>
                                                    <Calendar className="mr-2 h-4 w-4"/>
                                                    {t("assignment.notStarted")}
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="mr-2 h-4 w-4"/>
                                                    {t("assignment.expired")}
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button asChild className="w-full">
                                            <Link href={`/available-exams/${exam.id}`}>
                                                {exam.type === ExamType.QCM ? t("assignment.takeQuiz")
                                                    : exam.type === ExamType.DOCUMENT ? t("assignment.uploadFile")
                                                        : t("assignment.writeCode")}
                                            </Link>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
