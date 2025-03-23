"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Clock, CodeIcon } from "lucide-react"
import CodeEditor from "@/components/dashboard/available-exams/id/Code/code"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { ExamData } from "@/components/dashboard/exams/types"

interface CodeSub {
  code: string
  testResults: any[]
  isCorrect: boolean
}

interface CodeQuestion {
  id: string
  text: string
  maxPoints: number
  programmingLanguage: string
  initialCode?: string
  tests?: { input: string; expectedOutput: string }[]
}

interface CodeComponentProps {
  assignment: ExamData
  handleSubmit: () => Promise<void>
  isSubmitting: boolean
  answers: Record<string, CodeSub[]>
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, CodeSub[]>>>
}

export default function CodeComponent({ assignment, handleSubmit, isSubmitting, answers, setAnswers }: CodeComponentProps) {
  const t = useTranslations("exam-taking")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentCode, setCurrentCode] = useState<Record<string, string>>({})

  // Initialiser le code pour chaque question
  useState(() => {
    const initialCode: Record<string, string> = {}
    assignment.questions.forEach((question: CodeQuestion) => {
      initialCode[question.id] = question.initialCode || ""
    })
    setCurrentCode(initialCode)
  })

  const handleCodeSubmit = async (code: string, testResults: any[]) => {
    const currentQuestion = assignment.questions[currentQuestionIndex] as CodeQuestion
    const isCorrect = testResults.every(result => result.passed)

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: [...(prev[currentQuestion.id] || []), {
        code,
        testResults, 
        isCorrect
      }]
    }))

    // Mettre à jour le code actuel pour cette question
    setCurrentCode(prev => ({
      ...prev,
      [currentQuestion.id]: code
    }))
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < assignment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleFinalSubmit = async () => {
    await handleSubmit()
  }

  const currentQuestion = assignment.questions[currentQuestionIndex] as CodeQuestion
  const progressPercentage = (Object.keys(answers).length / assignment.questions.length) * 100

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            {t("progress", {
              answered: Object.keys(answers).length,
              total: assignment.questions.length
            })}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {t("questionNumber", {
              current: currentQuestionIndex + 1,
              total: assignment.questions.length
            })}
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <Card className="mb-6 p-4">
        <h2 className="mb-2 text-lg font-semibold">
          {t("questionTitle", {
            number: currentQuestionIndex + 1,
            text: currentQuestion.text
          })}
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <CodeIcon className="h-4 w-4 text-indigo-500" />
          <span>{t("language", { language: currentQuestion.programmingLanguage?.toUpperCase() })}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-orange-500" />
          <span>{t("points", { points: currentQuestion.maxPoints })}</span>
        </div>
      </Card>

      <CodeEditor
        key={currentQuestion.id} // Ajouter une clé unique pour chaque question
        initialCode={currentCode[currentQuestion.id] || currentQuestion.initialCode || ""}
        language={currentQuestion.programmingLanguage}
        tests={currentQuestion.tests || []}
        onSubmit={handleCodeSubmit}
        isSubmitting={isSubmitting}
      />

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          {t("previousQuestion")}
        </Button>

        {currentQuestionIndex < assignment.questions.length - 1 ? (
          <Button onClick={goToNextQuestion}>
            {t("nextQuestion")}
          </Button>
        ) : (
          <Button
            onClick={handleFinalSubmit}
            disabled={isSubmitting || Object.keys(answers).length !== assignment.questions.length}
            className="bg-green-600 hover:bg-green-700"
          >
            {t("finishExam")}
          </Button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {assignment.questions.map((question, index) => {
          const hasAnswer = answers[question.id]?.length > 0

          return (
            <button
              key={question.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium
                ${currentQuestionIndex === index
                  ? "bg-primary text-primary-foreground"
                  : hasAnswer
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : "bg-muted text-muted-foreground"
                }`}
            >
              {index + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
