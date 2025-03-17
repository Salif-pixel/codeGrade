import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Clock, CodeIcon } from "lucide-react"
import CodeEditor from "@/components/dashboard/test/Code/code"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import executeCode  from "./code"

interface Question {
  id: string
  text: string
  maxPoints: number
  programmingLanguage: "javascript" | "python" | "sql"
  initialCode?: string
  answer?: string
}

interface Answer {
  code: string
  testResults: any[]
  isCorrect: boolean
}

interface CodeComponentProps {
  assignment: {
    questions: Question[]
    description?: string
  }
  handleSubmit: (answers: Record<string, any>) => void
  isSubmitting: boolean
}

export default function CodeComponent({ assignment, handleSubmit, isSubmitting }: CodeComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  console.log(assignment.questions)
  const handleCodeSubmit = async (questionId: string, data: { code: string; testResults: any[]; isCorrect: boolean }) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        code: data.code,
        testResults: data.testResults,
        isCorrect: data.isCorrect
      }
    }));
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
    // Vérifier tous les tests une dernière fois
    const formattedAnswers = await Promise.all(
      Object.entries(answers).map(async ([questionId, answer]) => ({
        questionId,
        content: JSON.stringify({
          code: answer.code,
          testResults: answer.testResults,
          type: "code",
          correctAnswers: answer.code,
          isCorrect: answer.isCorrect
        })
      }))
    );

    handleSubmit(formattedAnswers);
  }

  const currentQuestion = assignment.questions[currentQuestionIndex]
  const progressPercentage = (Object.keys(answers).length / assignment.questions.length) * 100
  let currentTests = [];
  
  try {
    // Extraire les tests de la réponse correcte
    if (currentQuestion.answer) {
      const answerData = JSON.parse(currentQuestion.answer);
      currentTests = answerData.tests || [];
    }
  } catch (error) {
    console.error("Erreur lors de l'analyse des tests:", error);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            Progression: {Object.keys(answers).length}/{assignment.questions.length} questions répondues
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Question {currentQuestionIndex + 1} sur {assignment.questions.length}
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <Card className="mb-6 p-4">
        <h2 className="mb-2 text-lg font-semibold">Question {currentQuestionIndex + 1}</h2>
        <p className="mb-4">{currentQuestion.text}</p>
        <div className="flex items-center gap-2 text-sm">
          <CodeIcon className="h-4 w-4 text-indigo-500"/>
          <span>Langage: {currentQuestion.programmingLanguage?.toUpperCase()}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-orange-500"/>
          <span>Points: {currentQuestion.maxPoints}</span>
        </div>
      </Card>

      <CodeEditor
        initialCode={currentQuestion.initialCode || ""}
        language={currentQuestion.programmingLanguage}
        tests={currentTests}
        onSubmit={(data) => handleCodeSubmit(currentQuestion.id, data)}
        isSubmitting={isSubmitting}
      />

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Question précédente
        </Button>

        {currentQuestionIndex < assignment.questions.length - 1 ? (
          <Button onClick={goToNextQuestion}>
            Question suivante
          </Button>
        ) : (
          <Button 
            onClick={handleFinalSubmit}
            disabled={isSubmitting || Object.keys(answers).length !== assignment.questions.length}
            className="bg-green-600 hover:bg-green-700"
          >
            Terminer l'examen
          </Button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {assignment.questions.map((question, index) => {
          const hasAnswer = answers[question.id]
          
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