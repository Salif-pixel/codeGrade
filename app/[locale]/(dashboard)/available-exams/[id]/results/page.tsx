import {redirect} from "next/navigation"
import {headers} from "next/headers"
import {auth} from "@/lib/auth"
import {prisma} from "@/lib/prisma"
import {ExamType, ParticipationStatus, Question, Exam} from "@prisma/client"
import {cn} from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type QuestionAnswer = {
    id: string
    content: string
    questionId: string
    submissionId: string
    createdAt: Date
    updatedAt: Date
}

type ExamSubmission = {
    id: string
    createdAt: Date
    documentPath: string | null
    answers: QuestionAnswer[]
    correction: {
        id: string
        finalScore: number
        comments: string | null
        evaluation: string | null
    } | null
}

type ExamWithDetails = Exam & {
    questions: (Question & {
        correctAnswer: string[] | null
        maxPoints: number
    })[]
    participants: {
        id: string
        status: ParticipationStatus
        userId: string
    }[]
    submissions: ExamSubmission[]
}

export default async function ExamResultsPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params
    const header = await headers()
    const session = await auth.api.getSession({
        headers: header,
    })

    const parameters = await params

    if (!session?.user) {
        redirect(`/auth/login?callbackUrl=/available-exams/${await parameters.id}/results`)
    }

    const exam = await prisma.exam.findUnique({
        where: {id: await parameters.id},
        include: {
            questions: true,
            participants: {
                where: {userId: session.user.id}
            },
            submissions: {
                where: {studentId: session.user.id},
                include: {
                    answers: true,
                    correction: true
                }
            }
        }
    })

    if (!exam) {
        redirect("/404")
    }

    const examWithDetails = exam as unknown as ExamWithDetails

    // Vérifier si l'utilisateur a bien complété cet examen
    if (examWithDetails.participants.length === 0 || examWithDetails.participants[0].status !== ParticipationStatus.COMPLETED) {
        redirect(`/fr/available-exams/${await parameters.id}`)
    }

    const latestSubmission = examWithDetails.submissions[0]
    const correction = latestSubmission?.correction

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-6">Résultats de l&apos;examen</h1>

            <div className="bg-card dark:bg-zinc-900 rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-2">{examWithDetails.title}</h2>
                <p className="text-muted-foreground mb-4">{examWithDetails.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Date de soumission</p>
                        <p className="font-medium">
                            {latestSubmission
                                ? new Date(latestSubmission.createdAt).toLocaleString()
                                : "Non soumis"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Note</p>
                        <p className="font-medium">
                            {correction
                                ? `${correction.finalScore}/${examWithDetails.type === ExamType.DOCUMENT ? 20 : examWithDetails.questions.reduce((sum, q) => sum + q.maxPoints, 0)}`
                                : "En attente de notation"}
                        </p>
                    </div>
                </div>

                {correction?.comments && examWithDetails.type !== ExamType.DOCUMENT && (
                    <div className="mb-6">
                        <p className="text-sm text-muted-foreground mb-1">Feedback</p>
                        <div className="bg-muted p-4 rounded border">
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {correction.comments}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <h3 className="text-xl font-semibold mb-4">Questions et réponses</h3>

            <div className="space-y-6">
                {examWithDetails.type === ExamType.DOCUMENT ? (
                    <div className="bg-card rounded-lg dark:bg-zinc-900 shadow p-6">
                        <div className="flex items-start gap-3 mb-4">
              <span
                  className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                1
              </span>
                            <div>
                                <h4 className="font-medium">Document soumis</h4>
                                <p className="text-sm text-muted-foreground">Points maximum: 20</p>
                            </div>
                        </div>

                        {/* Contenu soumis */}
                        <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-1">Votre réponse :</p>
                            <div className="bg-muted p-4 rounded border">
                                <div className="prose dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {latestSubmission?.documentPath || "Aucune réponse fournie"}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>

                        {/* Correction du document */}
                        {examWithDetails.teacherCorrectionPath && (
                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-1">Correction :</p>
                                <div
                                    className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-4 rounded border border-blue-200 dark:border-blue-800">
                                    <div className="prose dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {examWithDetails.teacherCorrectionPath}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Évaluation IA */}
                        {correction?.evaluation && (
                            <div className="space-y-4">
                                {(() => {
                                    try {
                                        const evaluation = JSON.parse(correction.evaluation)
                                        return (
                                            <>
                                                {/* Score */}
                                                <div
                                                    className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded border border-blue-200 dark:border-blue-800">
                                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Score
                                                        : {evaluation.score}/20</p>
                                                </div>

                                                {/* Feedback général */}
                                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border">
                                                    <p className="text-sm font-medium mb-2">Feedback général :</p>
                                                    <div className="prose dark:prose-invert max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {evaluation.feedback}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>

                                                {/* Points forts */}
                                                <div
                                                    className="bg-green-50 dark:bg-green-950/30 p-4 rounded border border-green-200 dark:border-green-800">
                                                    <p className="text-sm font-medium mb-2">Points forts :</p>
                                                    <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300">
                                                        {evaluation.pointsForts?.map((point: string, index: number) => (
                                                            <li key={index}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Points faibles */}
                                                <div
                                                    className="bg-red-50 dark:bg-red-950/30 p-4 rounded border border-red-200 dark:border-red-800">
                                                    <p className="text-sm font-medium mb-2">Points à améliorer :</p>
                                                    <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                                                        {evaluation.pointsFaibles?.map((point: string, index: number) => (
                                                            <li key={index}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Justification de la note */}
                                                <div
                                                    className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded border border-purple-200 dark:border-purple-800">
                                                    <p className="text-sm font-medium mb-2">Justification de la note
                                                        :</p>
                                                    <div className="prose dark:prose-invert max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {evaluation.justificationNote}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    } catch (e) {
                                        console.error('Error parsing evaluation:', e)
                                        return null
                                    }
                                })()}
                            </div>
                        )}
                    </div>
                ) : (
                    examWithDetails.questions.map((question, index) => {
                        const answer = latestSubmission?.answers.find(a => a.questionId === question.id)
                        let parsedAnswer = null
                        let parsedCorrectAnswer = null

                        console.log("--------------",answer,"--------------",question,"--------------")

                        const answerArray = answer?.content.split(',') ?? []
                        const isCorrect = question.correctAnswer?.every(correctAnswer => answerArray.includes(correctAnswer)) && question.correctAnswer?.length === answerArray.length

                        try {
                            if (answer?.content) {
                                parsedAnswer = examWithDetails.type == ExamType.CODE ? JSON.parse(answer.content) : answer.content
                            }
                            if (question.correctAnswer) {
                                parsedCorrectAnswer = question.correctAnswer
                            }
                        } catch (e) {
                            console.error('Error parsing answers:', e)
                        }

                        return (
                            <div key={question.id} className="bg-card rounded-lg dark:bg-zinc-900 shadow p-6">
                                <div className="flex items-start gap-3 mb-4">
                  <span
                      className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                                    <div>
                                        <h4 className="font-medium">{question.text}</h4>
                                        <p className="text-sm text-muted-foreground">Points
                                            maximum: {question.maxPoints}</p>
                                    </div>
                                </div>

                                {examWithDetails.type === ExamType.CODE ? (
                                    <div>
                                        {/* Résultats des tests */}
                                        <div className="mb-4">
                                            <p className="text-sm text-muted-foreground mb-1">Résultats des tests :</p>
                                            <div className="space-y-2">
                                                {parsedAnswer?.testResults?.map((test: {
                                                    passed: boolean,
                                                    expected: string,
                                                    output: string
                                                }, index: number) => (
                                                    <div key={index} className={cn(
                                                        "p-3 rounded border",
                                                        test.passed
                                                            ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                                                            : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                                                    )}>
                                                        <p className="text-sm font-medium">Test {index + 1}</p>
                                                        <p className="text-sm mt-1">Attendu : {test.expected}</p>
                                                        <p className="text-sm">Obtenu
                                                            : {test.output || "Pas de sortie"}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Évaluation IA */}
                                        {parsedAnswer?.evaluation && (
                                            <div className="space-y-4">
                                                {/* Score */}
                                                <div
                                                    className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded border border-blue-200 dark:border-blue-800">
                                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                        Score : {parsedAnswer?.evaluation.score}/{question.maxPoints}
                                                    </p>
                                                </div>

                                                {/* Explication */}
                                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border">
                                                    <p className="text-sm font-medium mb-2">Explication détaillée :</p>
                                                    <p className="text-sm text-muted-foreground">{parsedAnswer?.evaluation.explanation}</p>
                                                </div>

                                                {/* Feedback */}
                                                <div
                                                    className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded border border-amber-200 dark:border-amber-800">
                                                    <p className="text-sm font-medium mb-2">Suggestions
                                                        d&#39;amélioration :</p>
                                                    <p className="text-sm text-amber-700 dark:text-amber-300">{parsedAnswer?.evaluation.feedback}</p>
                                                </div>

                                                {/* Qualité du code */}
                                                <div
                                                    className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded border border-purple-200 dark:border-purple-800">
                                                    <p className="text-sm font-medium mb-2">Analyse de la qualité du
                                                        code :</p>
                                                    <p className="text-sm text-purple-700 dark:text-purple-300">{parsedAnswer?.evaluation.codeQuality}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {/* Réponse de l'étudiant */}
                                        <div className="mb-4">
                                            <p className="text-sm text-muted-foreground mb-1">Votre réponse:</p>
                                            <div className="bg-muted p-4 rounded border">
                                                {parsedAnswer ? (
                                                    parsedAnswer
                                                ) : "Aucune réponse fournie"}
                                            </div>
                                        </div>

                                        {/* Réponse correcte */}
                                        {parsedCorrectAnswer && (
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Réponse correcte:</p>
                                                <div
                                                    className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 p-4 rounded border border-emerald-200 dark:border-emerald-800">
                                                    {Array.isArray(parsedCorrectAnswer) ?
                                                        parsedCorrectAnswer.join(', ')
                                                        : parsedCorrectAnswer}
                                                </div>
                                            </div>
                                        )}

                                        {/* Feedback */}
                                        {isCorrect ? (
                                            <div
                                                className="mt-4 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 p-4 rounded border border-green-200 dark:border-green-800">
                                                <p>{question?.feedbackCorrect}</p>
                                            </div>
                                        ) : (
                                            <div
                                                className="mt-4 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 p-4 rounded border border-red-200 dark:border-red-800">
                                                <p>{question?.feedbackIncorrect}</p>
                                            </div>
                                        )}

                                        {
                                            question?.explanation && (
                                                <div
                                                    className="mt-4 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-4 rounded border border-blue-200 dark:border-blue-800">
                                                    <p>{question?.explanation}</p>
                                                </div>
                                            )
                                        }

                                    </>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
