"use client"

import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import {useLocale, useTranslations} from "next-intl"
import {Alert, AlertTitle, AlertDescription} from "@/components/ui/alert"
import {ExamType} from "@prisma/client"
import {Clock, CheckCircle, XCircle} from "lucide-react"
import {extractContentFromDocument} from "@/actions/utils.action"
import {cn} from "@/lib/utils"
import QuizForm from "@/components/dashboard/available-exams/id/Qcm/qcm"
import PdfComponent from "@/components/dashboard/available-exams/id/Document/pdf-component"
import CodeComponent from "@/components/dashboard/available-exams/id/Code/code-component"
import {ExamData} from "@/components/dashboard/exams/types"
import {handleQcmSubmission, handleCodeSubmission, handleDocumentSubmission} from "@/actions/take-exam.action"

interface CodeSubmission {
    questionId: string;
    code: string;
    programmingLanguage: string;
}

interface CodeSub {
    code: string
    testResults: any[]
    isCorrect: boolean
  }

export default function TakeExamComponent({exam, userId}: { exam: ExamData; userId: string }) {
    const t = useTranslations("exam-taking")
    const router = useRouter()
    const local = useLocale()

    const [answers, setAnswers] = useState<Record<string, string[]>>({})
    const [codeAnswers, setCodeAnswers] = useState<Record<string, CodeSub[]>>({})
    const [submitting, setSubmitting] = useState(false)
    const [timeLeft, setTimeLeft] = useState<string | null>(null)
    const [alert, setAlert] = useState<{
        show: boolean
        title: string
        description: string
        variant?: "default" | "destructive"
    }>({show: false, title: "", description: ""})
    const [error,] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("instructions")

    // Initialiser les réponses à partir des réponses existantes
    useEffect(() => {
        const initialAnswers: Record<string, string[]> = {}

        exam.questions.forEach(question => {
            if (question.studentAnswer) {
                initialAnswers[question.id] = question.studentAnswer
            } else {
                initialAnswers[question.id] = []
            }
        })

        setAnswers(initialAnswers)
    }, [exam.questions])

    // Gérer le compte à rebours
    useEffect(() => {
        if (!exam.timeRemaining) return

        const updateTimeLeft = () => {
            const now = new Date().getTime()
            const distance = exam.timeRemaining ? exam.timeRemaining - (now - startTime) : 0

            if (distance <= 0) {
                setTimeLeft("00:00:00")
                clearInterval(timer)
                handleSubmit()

                setAlert({
                    show: true,
                    title: t("timeUp.title"),
                    description: t("timeUp.description"),
                    variant: "destructive"
                })
            } else {
                const hours = Math.floor(distance / (1000 * 60 * 60))
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((distance % (1000 * 60)) / 1000)

                setTimeLeft(
                    `${hours.toString().padStart(2, "0")}:${minutes
                        .toString()
                        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                )

                // Avertissement 5 minutes avant la fin
                if (distance <= 5 * 60 * 1000 && distance > 4.9 * 60 * 1000) {
                    setAlert({
                        show: true,
                        title: t("timeWarning.title"),
                        description: t("timeWarning.description"),
                        variant: "destructive"
                    })
                }
            }
        }

        const startTime = new Date().getTime()
        updateTimeLeft()
        const timer = setInterval(updateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [exam.timeRemaining, t])

    const handleSubmit = async () => {
        setSubmitting(true)

        try {
            let result;

            if (exam.type === ExamType.QCM) {
                const qcmSubmissions = Object.entries(answers).map(([questionId, answers]) => ({
                    questionId,
                    answers
                }))
                result = await handleQcmSubmission(exam.id, userId, qcmSubmissions)
            } else if (exam.type === ExamType.CODE) {
                const codeSubmissions = Object.entries(codeAnswers).map(([questionId, submissions]) => {
                    const latestSubmission = submissions[submissions.length - 1]
                    return {
                        questionId,
                        code: latestSubmission?.code || "",
                        programmingLanguage: exam.questions.find(q => q.id === questionId)?.programmingLanguage || "javascript"
                    }
                }) as CodeSubmission[]
                
                console.log(codeSubmissions)
                result = await handleCodeSubmission(exam.id, userId, codeSubmissions)
            } else if (exam.type === ExamType.DOCUMENT) {
                const documentSubmission = {
                    documentPath: answers[exam.questions[0].id]?.[0] || "",
                    examText: await extractContentFromDocument(
                        new File([answers[exam.questions[0].id]?.[0] || ""], "submission.txt", {type: "text/plain"}),
                        "txt"
                    )
                }
                result = await handleDocumentSubmission(exam.id, userId, documentSubmission)
            }

            if (result?.success) {
                setAlert({
                    show: true,
                    title: t("submitSuccess.title"),
                    description: t("submitSuccess.description"),
                    variant: "default"
                })

                router.push(`/${local}/available-exams/${exam.id}/results`)
            } else {
                throw new Error(result?.error?.toString() || "Erreur lors de la soumission")
            }
        } catch (error) {
            console.error("Error submitting exam:", error)
            setAlert({
                show: true,
                title: t("submitError.title"),
                description: t("submitError.description"),
                variant: "destructive"
            })
        } finally {
            setSubmitting(false)
        }
    }
// Préparer les données pour le composant QCM
    const formatQuestionsForQuizForm = () => {
        return exam.questions.map(q => ({
            id: q.id,
            text: q.text,
            options: (q.choices || []).map((choice) => ({
                id: choice,
                text: choice
            }))
        }))
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {alert.show && (
                <Alert variant={alert.variant} className="mb-4">
                    {alert.variant === "destructive" ? <XCircle/> : <CheckCircle/>}
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>{alert.description}</AlertDescription>
                </Alert>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{exam.title}</h1>
                    <p className="text-muted-foreground">{exam.description}</p>
                </div>

                {timeLeft && (
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <Clock className={cn(
                            "h-5 w-5",
                            timeLeft.startsWith("00:0") ? "text-red-500 animate-pulse" : "text-primary"
                        )}/>
                        <span className={cn(
                            timeLeft.startsWith("00:0") ? "text-red-500" : ""
                        )}>
              {timeLeft}
            </span>
                    </div>
                )}
            </div>

            {exam.type === ExamType.QCM ? (
                <QuizForm
                    questions={formatQuestionsForQuizForm()}
                    answers={answers}
                    setAnswers={setAnswers}
                    onSubmit={handleSubmit}
                    isSubmitting={submitting}
                />
            ) : exam.type === ExamType.DOCUMENT ? (
                <PdfComponent
                    assignment={exam as never}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    handleSubmit={handleSubmit}
                    isSubmitting={submitting}
                />
            ) : exam.type === ExamType.CODE ? (
                <CodeComponent
                    assignment={exam as never}
                    answers={codeAnswers}
                    setAnswers={setCodeAnswers}
                    handleSubmit={handleSubmit}
                    isSubmitting={submitting}
                />
            ) : null}

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    )
}
