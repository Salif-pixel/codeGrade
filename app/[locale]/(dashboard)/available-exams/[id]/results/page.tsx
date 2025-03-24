import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ExamType, ParticipationStatus, Question, Exam } from "@prisma/client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

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
        autoScore: number
        manualScore: number | null
        comments: string | null
        evaluation: string | null
        aiFeedback: string | null
        improvement: string | null
        isRevised: boolean
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

const inferLanguage = (lang: 'javascript' | 'python' | 'java' | 'cpp') => {
    switch (lang) {
        case 'javascript':
            return 'js'
        case 'python':
            return 'py'
        case 'java':
            return 'java'
        case 'cpp':
            return 'cpp'
        default:
            return 'js'
    }
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
        where: { id: await parameters.id },
        include: {
            questions: true,
            participants: {
                where: { userId: session.user.id }
            },
            submissions: {
                where: { studentId: session.user.id },
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

            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg shadow p-6 mb-8">
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
                    <div className="bg-zinc-100 rounded-lg dark:bg-zinc-900 shadow p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                1
                            </span>
                            <div>
                                <h4 className="font-medium">Document soumis</h4>
                                <p className="text-sm text-muted-foreground">Points maximum: 20</p>
                            </div>
                        </div>

                        {/* Document soumis */}
                        <div className="mb-6">
                            <p className="text-sm text-muted-foreground mb-1">Document soumis :</p>
                            <div className="bg-muted p-4 rounded border lg:max-w-6xl lg:mx-auto">
                                <iframe
                                    src={latestSubmission?.documentPath ? (latestSubmission?.documentPath == "" ? undefined : latestSubmission?.documentPath) : undefined}
                                    className="w-full aspect-[1.4142/1] lg:aspect-[1.4142/1] h-auto rounded-lg border border-gray-200"
                                    title="PDF Viewer"
                                />
                            </div>
                        </div>

                        {/* Correction détaillée */}
                        {correction && (
                            <div className="space-y-6">
                                {/* Scores */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Score automatique</p>
                                        <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">{correction.autoScore}/20</p>
                                    </div>

                                    {correction.manualScore && (
                                        <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded border border-purple-200 dark:border-purple-800">
                                            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Score manuel</p>
                                            <p className="text-lg font-semibold text-purple-800 dark:text-purple-200">{correction.manualScore}/20</p>
                                        </div>
                                    )}

                                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded border border-green-200 dark:border-green-800">
                                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Score final</p>
                                        <p className="text-lg font-semibold text-green-800 dark:text-green-200">{correction.finalScore}/20</p>
                                    </div>
                                </div>

                                {/* Feedback IA */}
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border">
                                    <p className="text-sm font-medium mb-2">Feedback de l'IA :</p>
                                    <div className="prose dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {correction.aiFeedback}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                {/* Suggestions d'amélioration */}
                                {correction.improvement && (
                                    <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded border border-amber-200 dark:border-amber-800">
                                        <p className="text-sm font-medium mb-4">Suggestions d'amélioration :</p>
                                        <div className="space-y-4">
                                            {(() => {
                                                try {
                                                    const suggestions = JSON.parse(correction.improvement)
                                                    return suggestions.map((suggestion: any, index: number) => {
                                                        const severityColors = {
                                                            MAJOR: {
                                                                bg: 'bg-red-50 dark:bg-red-950/30',
                                                                border: 'border-red-200 dark:border-red-800',
                                                                text: 'text-red-700 dark:text-red-300'
                                                            },
                                                            MINOR: {
                                                                bg: 'bg-yellow-50 dark:bg-yellow-950/30',
                                                                border: 'border-yellow-200 dark:border-yellow-800',
                                                                text: 'text-yellow-700 dark:text-yellow-300'
                                                            },
                                                            CRITICAL: {
                                                                bg: 'bg-red-100 dark:bg-red-950/50',
                                                                border: 'border-red-300 dark:border-red-700',
                                                                text: 'text-red-800 dark:text-red-200'
                                                            }
                                                        }

                                                        const colors = severityColors[suggestion.severity as keyof typeof severityColors] || {
                                                            bg: 'bg-gray-50 dark:bg-gray-900',
                                                            border: 'border-gray-200 dark:border-gray-800',
                                                            text: 'text-gray-700 dark:text-gray-300'
                                                        }

                                                        return (
                                                            <div
                                                                key={index}
                                                                className={`${colors.bg} p-4 rounded border ${colors.border}`}
                                                            >
                                                                {suggestion.section && (
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className="font-medium">{suggestion.section}</h4>
                                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                                                                            {suggestion.severity}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <p className={`text-sm ${colors.text}`}>
                                                                    {suggestion.suggestion}
                                                                </p>
                                                            </div>
                                                        )
                                                    })
                                                } catch (e) {
                                                    console.error('Error parsing improvement suggestions:', e)
                                                    return (
                                                        <div className="prose dark:prose-invert max-w-none">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {correction.improvement}
                                                            </ReactMarkdown>
                                                        </div>
                                                    )
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Commentaires du correcteur */}
                                {correction.comments && (
                                    <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded border border-indigo-200 dark:border-indigo-800">
                                        <p className="text-sm font-medium mb-2">Commentaires du correcteur :</p>
                                        <div className="prose dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {correction.comments}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}

                                {/* Évaluation détaillée */}
                                {correction.evaluation && (
                                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded border border-emerald-200 dark:border-emerald-800">
                                        <p className="text-sm font-medium mb-2">Évaluation détaillée :</p>
                                        <div className="prose dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {correction.evaluation}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}

                                {/* Statut de révision */}
                                {correction.isRevised && (
                                    <div className="bg-teal-50 dark:bg-teal-950/30 p-4 rounded border border-teal-200 dark:border-teal-800">
                                        <p className="text-sm text-teal-700 dark:text-teal-300">
                                            ✓ Cette correction a été révisée
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Correction du professeur */}
                        {examWithDetails.teacherCorrectionPath && (
                            <div className="mt-6">
                                <p className="text-sm text-muted-foreground mb-1">Document de correction :</p>
                                <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-4 rounded border border-blue-200 dark:border-blue-800">
                                    <div className="prose dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {examWithDetails.teacherCorrectionPath}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    examWithDetails.questions.map((question, index) => {
                        const answer = latestSubmission?.answers.find(a => a.questionId === question.id)
                        let parsedAnswer = null
                        let parsedCorrectAnswer = null

                        // console.log("--------------", answer, "--------------", question, "--------------", latestSubmission, "--------------")

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
                                        {/* Code soumis */}
                                        <div className="mb-4">
                                            <p className="text-sm text-muted-foreground mb-1">Code soumis :</p>
                                            <div className="bg-muted rounded border overflow-hidden">
                                                <SyntaxHighlighter
                                                    language={inferLanguage(question.programmingLanguage as 'javascript' | 'python' | 'java' | 'cpp')}
                                                    style={oneDark}
                                                    customStyle={{
                                                        margin: 0,
                                                        borderRadius: 0,
                                                    }}
                                                >
                                                    {answer?.content || ''}
                                                </SyntaxHighlighter>
                                            </div>
                                        </div>

                                        {/* Cas de tests */}
                                        <div className="mb-4">
                                            <p className="text-sm text-muted-foreground mb-1">Cas de tests :</p>
                                            <div className="space-y-2">
                                                {question.testCases?.map((test, index) => {
                                                    const [input, expectedOutput] = test.split("=>")
                                                    return (
                                                        <div key={index} className="p-3 rounded border bg-muted">
                                                            <p className="text-sm font-medium">Test {index + 1}</p>
                                                            <p className="text-sm mt-1">Entrée : {input}</p>
                                                            <p className="text-sm">Sortie attendue : {expectedOutput}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
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

            {/* Bloc de correction globale pour les examens de type CODE */}
            {examWithDetails.type === ExamType.CODE && latestSubmission?.correction && (
                <div className="mt-8 bg-card dark:bg-zinc-900 rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Évaluation globale</h3>
                    <div className="space-y-4">
                        {/* Score global */}
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Score total : {latestSubmission.correction.finalScore}/{examWithDetails.questions.reduce((sum, q) => sum + q.maxPoints, 0)}
                            </p>
                        </div>

                        {/* Feedback IA */}
                        {latestSubmission.correction.aiFeedback && (
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border">
                                <p className="text-sm font-medium mb-2">Feedback global :</p>
                                <p className="text-sm text-muted-foreground">
                                    {latestSubmission.correction.aiFeedback}
                                </p>
                            </div>
                        )}

                        {/* Suggestions d'amélioration */}
                        {latestSubmission.correction.improvement && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded border border-amber-200 dark:border-amber-800">
                                <p className="text-sm font-medium mb-2">Suggestions d&#39;amélioration :</p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    {latestSubmission.correction.improvement}
                                </p>
                            </div>
                        )}

                        {/* Commentaires manuels */}
                        {latestSubmission.correction.comments && (
                            <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded border border-purple-200 dark:border-purple-800">
                                <p className="text-sm font-medium mb-2">Commentaires du correcteur :</p>
                                <p className="text-sm text-purple-700 dark:text-purple-300">
                                    {latestSubmission.correction.comments}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
