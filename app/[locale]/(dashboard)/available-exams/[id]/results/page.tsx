import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ExamType, ParticipantStatus } from "@prisma/client"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default async function ExamResultsPage({ params }: { params: { id: Promise<string> } }) {
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
      grades:true,
      participants: {
        where: { userId: session.user.id }
      },
      answers: {
        where: { studentId: session.user.id },
        include: {
          questionAnswers: {
            include: {
              question: true,
              answer: true
            }
          },
          grade: true,
        }
      }
    }
  })

  console.log(exam)

  if (!exam) {
    redirect("/404")
  }

  // Vérifier si l'utilisateur a bien complété cet examen
  if (exam.participants.length === 0 || exam.participants[0].status !== ParticipantStatus.COMPLETED) {
    redirect(`/fr/available-exams/${await parameters.id}`)
  }

  console.log(exam)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Résultats de l&apos;examen</h1>

      <div className="bg-card dark:bg-zinc-900 rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-2">{exam.title}</h2>
        <p className="text-muted-foreground mb-4">{exam.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Date de soumission</p>
            <p className="font-medium">
              {exam.answers.length > 0
                ? new Date(exam.answers[0].createdAt).toLocaleString()
                : "Non soumis"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Note</p>
            <p className="font-medium">
              {exam.grades.length > 0
                ? `${exam.grades.find((grade) => grade.studentId === session.user.id)?.finalScore}/${exam.type == ExamType.DOCUMENT ? 20 : (exam.questions.reduce((sum, q) => sum + q.maxPoints, 0))}`
                : "En attente de notation"}
            </p>
          </div>
        </div>

        {exam.grades.length > 0 && exam.grades[0].comments && exam.type !== ExamType.DOCUMENT && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-1">Feedback</p>
            <div className="bg-muted p-4 rounded border">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {exam.grades[0].comments}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold mb-4">Questions et réponses</h3>

      <div className="space-y-6">
        {exam.type === ExamType.DOCUMENT ? (
          <div className="bg-card rounded-lg dark:bg-zinc-900 shadow p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
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
                    {exam.answers[0]?.content ? JSON.parse(exam.answers[0].content).submittedContent : "Aucune réponse fournie"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Correction du document */}
            {exam.fileCorrection && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Correction :</p>
                <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-4 rounded border border-blue-200 dark:border-blue-800">
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {exam.fileCorrection}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Évaluation IA */}
            {exam.answers[0]?.content && (
              <div className="space-y-4">
                {(() => {
                  try {
                    const evaluation = JSON.parse(exam.answers[0].content).evaluation;
                    return (
                      <>
                        {/* Score */}
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Score : {evaluation.score}/20</p>
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
                        <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded border border-green-200 dark:border-green-800">
                          <p className="text-sm font-medium mb-2">Points forts :</p>
                          <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300">
                            {evaluation.pointsForts?.map((point: string, index: number) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Points faibles */}
                        <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded border border-red-200 dark:border-red-800">
                          <p className="text-sm font-medium mb-2">Points à améliorer :</p>
                          <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                            {evaluation.pointsFaibles?.map((point: string, index: number) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Justification de la note */}
                        <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded border border-purple-200 dark:border-purple-800">
                          <p className="text-sm font-medium mb-2">Justification de la note :</p>
                          <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {evaluation.justificationNote}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </>
                    );
                  } catch (e) {
                    console.error('Error parsing evaluation:', e);
                    return null;
                  }
                })()}
              </div>
            )}
          </div>
        ) : (
          exam.questions.map((question, index) => {
            const studentAnswer = exam.answers[0]?.questionAnswers.find(
              qa => qa.questionId === question.id
            );

            let parsedStudentAnswer;
            let parsedCorrectAnswer;

            try {
              parsedStudentAnswer = studentAnswer ? JSON.parse(studentAnswer.content) : null;
              parsedCorrectAnswer = question.answer ? JSON.parse(question.answer) : null;
            } catch (e) {
              console.error('Error parsing answers:', e);
              parsedStudentAnswer = null;
              parsedCorrectAnswer = null;
            }

            return (
              <div key={question.id} className="bg-card rounded-lg dark:bg-zinc-900 shadow p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-medium">{question.text}</h4>
                    <p className="text-sm text-muted-foreground">Points maximum: {question.maxPoints}</p>
                  </div>
                </div>

                {/* Explication de la réponse */}
                {parsedCorrectAnswer?.explanation && (
                  <div className="mb-4 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-4 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium mb-1">Explication :</p>
                    <p>{parsedCorrectAnswer.explanation}</p>
                  </div>
                )}

                {exam.type == ExamType.CODE ? (
                  <div>
                    {/* Affichage du code soumis */}
                    
                    {/* Résultats des tests */}
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Résultats des tests :</p>
                      <div className="space-y-2">
                        {parsedStudentAnswer?.testResults?.map((test: any, index: number) => (
                          <div key={index} className={cn(
                            "p-3 rounded border",
                            test.passed 
                              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" 
                              : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                          )}>
                            <p className="text-sm font-medium">Test {index + 1}</p>
                            <p className="text-sm mt-1">Attendu : {test.expected}</p>
                            <p className="text-sm">Obtenu : {test.output || "Pas de sortie"}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Évaluation IA */}
                    <div className="space-y-4">
                      {/* Score */}
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Score : {parsedStudentAnswer?.evaluation?.score}/{question.maxPoints}</p>
                      </div>

                      {/* Explication */}
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border">
                        <p className="text-sm font-medium mb-2">Explication détaillée :</p>
                        <p className="text-sm text-muted-foreground">{parsedStudentAnswer?.evaluation?.explanation}</p>
                      </div>

                      {/* Feedback */}
                      <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded border border-amber-200 dark:border-amber-800">
                        <p className="text-sm font-medium mb-2">Suggestions d'amélioration :</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">{parsedStudentAnswer?.evaluation?.feedback}</p>
                      </div>

                      {/* Qualité du code */}
                      <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded border border-purple-200 dark:border-purple-800">
                        <p className="text-sm font-medium mb-2">Analyse de la qualité du code :</p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{parsedStudentAnswer?.evaluation?.codeQuality}</p>
                      </div>
                    </div>
                  </div>
                ) : exam.type == ExamType.DOCUMENT ? (
                  <div className="space-y-4">
                    {/* Contenu soumis */}
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Votre réponse :</p>
                      <div className="bg-muted p-4 rounded border whitespace-pre-wrap">
                        {parsedStudentAnswer?.submittedContent || "Aucune réponse fournie"}
                      </div>
                    </div>

                    {/* Évaluation IA */}
                    <div className="space-y-4">
                      {/* Score */}
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Score : {parsedStudentAnswer?.evaluation?.score}/{question.maxPoints}</p>
                      </div>

                      {/* Feedback général */}
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border">
                        <p className="text-sm font-medium mb-2">Feedback général :</p>
                        <p className="text-sm text-muted-foreground">{parsedStudentAnswer?.evaluation?.feedback}</p>
                      </div>

                      {/* Points forts */}
                      <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium mb-2">Points forts :</p>
                        <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300">
                          {parsedStudentAnswer?.evaluation?.pointsForts?.map((point: string, index: number) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Points faibles */}
                      <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded border border-red-200 dark:border-red-800">
                        <p className="text-sm font-medium mb-2">Points à améliorer :</p>
                        <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                          {parsedStudentAnswer?.evaluation?.pointsFaibles?.map((point: string, index: number) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Justification de la note */}
                      <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded border border-purple-200 dark:border-purple-800">
                        <p className="text-sm font-medium mb-2">Justification de la note :</p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{parsedStudentAnswer?.evaluation?.justificationNote}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Votre réponse:</p>
                    <div className="bg-muted p-4 rounded border">
                      {parsedStudentAnswer?.correctAnswers ? (
                        Array.isArray(parsedStudentAnswer.correctAnswers) ? 
                          parsedStudentAnswer.correctAnswers.map((answer: string, index: number) => (
                            <span key={index}>
                              {answer}
                              {index < parsedStudentAnswer.correctAnswers.length - 1 ? ', ' : ''}
                            </span>
                          ))
                        : parsedStudentAnswer.correctAnswers
                      ) : "Aucune réponse fournie"}
                    </div>
                  </div>
                )}

                {exam.type !== ExamType.CODE && parsedCorrectAnswer && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Réponse correcte:</p>
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 p-4 rounded border border-emerald-200 dark:border-emerald-800">
                      {Array.isArray(parsedCorrectAnswer.correctAnswers) ? 
                        parsedCorrectAnswer.correctAnswers.map((answer: string, index: number) => (
                          <span key={index}>
                            {answer}
                            {index < parsedCorrectAnswer.correctAnswers.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      : parsedCorrectAnswer.correctAnswers}
                    </div>    
                  </div>
                )}

                {/* Feedback selon la réponse */}
                {exam.type !== ExamType.CODE && parsedStudentAnswer?.isCorrect ? (
                  <div className="mt-4 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 p-4 rounded border border-green-200 dark:border-green-800">
                    <p>{parsedCorrectAnswer?.feedback?.correct}</p>
                  </div>
                ) : exam.type !== ExamType.CODE && (
                  <div className="mt-4 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 p-4 rounded border border-red-200 dark:border-red-800">
                    <p>{parsedCorrectAnswer?.feedback?.incorrect}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  )
} 