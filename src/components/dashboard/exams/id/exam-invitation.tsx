"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Exam, Question } from "@prisma/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { joinExam } from "@/actions/join-exam.action"
import { useCustomToast } from "@/components/utilities/alert/alert"
import { useLocale } from "next-intl"
import { Calendar, Clock, FileText, User } from "lucide-react"

interface TeacherInfo {
    name: string
    email: string
}

interface ExamInvitationProps {
    exam: Exam & {
        questions: Question[]
    }
    user: {
        id: string
        name: string
        email: string
    }
    teacher: TeacherInfo
}

export default function ExamInvitation({ exam, user, teacher }: ExamInvitationProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { showToast } = useCustomToast()
    const locale = useLocale()

    const handleAccept = async () => {
        setIsLoading(true)
        try {
            const result = await joinExam(exam.id, user.id)
            if (result.success) {
                showToast("Succès", "Vous avez rejoint l'examen avec succès", "success")
                router.push(`/${locale}/exams/${exam.id}`)
            } else {
                showToast("Erreur", result.error || "Une erreur est survenue", "error")
            }
        } catch (error) {
            console.error("Error joining exam:", error)
            showToast("Erreur", "Une erreur est survenue lors de la tentative de rejoindre l'examen", "error")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDecline = () => {
        showToast("Information", "Vous avez refusé l'invitation à l'examen", "info")
        router.push(`/${locale}/available-exams`)
    }

    const formatDuration = () => {
        if (!exam.startDate || !exam.endDate) return "Non définie"
        const durationMs = new Date(exam.endDate).getTime() - new Date(exam.startDate).getTime()
        const minutes = Math.round(durationMs / (1000 * 60))
        return `${minutes} minutes`
    }

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleDateString(locale, {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }) : "Non définie"
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card className="shadow-lg border-none rounded-2xl overflow-hidden">
                <CardHeader className="p-6">
                    <CardTitle className="text-2xl font-bold">Invitation à l&apos;examen</CardTitle>
                    <CardDescription className="mt-1">
                        Invité par {teacher.name} ({teacher.email})
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        {/* Exam Title */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 " />
                                {exam.title}
                            </h3>
                            <p className="text-sm mt-1">
                                {exam.description || "Aucune description disponible"}
                            </p>
                        </div>

                        {/* Exam Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">Type</span>
                                </div>
                                <p className="text-sm ">{exam.type}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">Durée</span>
                                </div>
                                <p className="text-sm">{formatDuration()}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">Enseignant</span>
                                </div>
                                <p className="text-sm">{teacher.name}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">Début</span>
                                </div>
                                <p className="text-sm">{formatDate(exam.startDate)}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 ">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">Fin</span>
                                </div>
                                <p className="text-sm">{formatDate(exam.endDate)}</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={handleDecline}
                                className="rounded-full px-6 py-2 transition-all duration-200"
                            >
                                Refuser
                            </Button>
                            <Button
                                onClick={handleAccept}
                                disabled={isLoading}
                                className="rounded-full px-6 py-2 transition-all duration-200"
                            >
                                {isLoading ? "Chargement..." : "Accepter"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
