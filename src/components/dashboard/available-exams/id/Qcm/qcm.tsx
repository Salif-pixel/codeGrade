"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface Question {
    id: string
    text: string
    options: { id: string; text: string }[]
}

interface QuizFormProps {
    questions: Question[]
    onSubmit: () => Promise<void>
    isSubmitting: boolean
}

export default function QuizForm({ questions, onSubmit, isSubmitting }: QuizFormProps) {
    const t = useTranslations("exam-taking")
    const [answers, setAnswers] = useState<Record<string, string[]>>({})
    const [errors, setErrors] = useState<string[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

    const handleAnswerChange = (questionId: string, optionId: string, checked: boolean) => {
        setAnswers((prev) => {
            const currentAnswers = prev[questionId] || []
            
            if (checked) {
                return {
                    ...prev,
                    [questionId]: [...currentAnswers, optionId]
                }
            } else {
                return {
                    ...prev,
                    [questionId]: currentAnswers.filter(id => id !== optionId)
                }
            }
        })

        if (errors.includes(questionId)) {
            setErrors(errors.filter((id) => id !== questionId))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const unansweredQuestions = questions.filter((q) => {
            const answer = answers[q.id]
            return !answer || answer.length === 0
        }).map((q) => q.id)

        if (unansweredQuestions.length > 0) {
            setErrors(unansweredQuestions)
            const firstUnansweredIndex = questions.findIndex((q) => unansweredQuestions.includes(q.id))
            if (firstUnansweredIndex !== -1) {
                setCurrentQuestionIndex(firstUnansweredIndex)
            }
            return
        }

        await onSubmit()
    }

    const goToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    const currentQuestion = questions[currentQuestionIndex]
    const progressPercentage = (Object.keys(answers).filter(id => answers[id].length > 0).length / questions.length) * 100
    const currentAnswers = answers[currentQuestion?.id] || []

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                        {t("progress", {
                            answered: Object.keys(answers).filter(id => answers[id].length > 0).length,
                            total: questions.length
                        })}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                        {t("questionNumber", {
                            current: currentQuestionIndex + 1,
                            total: questions.length
                        })}
                    </div>
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="mb-6 border shadow-md">
                    <CardHeader className="bg-muted/50 pb-3">
                        <CardTitle className="text-lg font-medium">
                            {t("questionTitle", {
                                number: currentQuestionIndex + 1,
                                text: currentQuestion?.text
                            })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            {currentQuestion?.options.map((option) => {
                                const isChecked = currentAnswers.includes(option.id)
                                
                                return (
                                    <div
                                        key={option.id}
                                        className={cn(
                                            "flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                                            isChecked 
                                                ? "border-primary bg-primary/10" 
                                                : "border-border"
                                        )}
                                    >
                                        <Checkbox 
                                            id={`${currentQuestion.id}-${option.id}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => 
                                                handleAnswerChange(
                                                    currentQuestion.id, 
                                                    option.id, 
                                                    checked as boolean
                                                )
                                            }
                                            className="h-5 w-5"
                                        />
                                        <Label 
                                            htmlFor={`${currentQuestion.id}-${option.id}`} 
                                            className="flex-grow cursor-pointer text-base"
                                        >
                                            {option.text}
                                        </Label>
                                    </div>
                                )
                            })}
                        </div>

                        {errors.includes(currentQuestion?.id) && (
                            <div className="mt-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                <AlertCircle className="h-5 w-5" />
                                <span>{t("selectAnswer")}</span>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between border-t bg-muted/50 p-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={goToPreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                        >
                            {t("previousQuestion")}
                        </Button>

                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button type="button" onClick={goToNextQuestion}>
                                {t("nextQuestion")}
                            </Button>
                        ) : (
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t("submitting")}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {t("finishQuiz")}
                                    </>
                                )}
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                <div className="mb-6 flex flex-wrap gap-2">
                    {questions.map((question, index) => {
                        const hasAnswer = answers[question.id]?.length > 0
                        
                        return (
                            <button
                                key={question.id}
                                type="button"
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium",
                                    currentQuestionIndex === index
                                        ? "bg-primary text-primary-foreground"
                                        : hasAnswer
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                            : "bg-muted text-muted-foreground"
                                )}
                                onClick={() => setCurrentQuestionIndex(index)}
                            >
                                {index + 1}
                            </button>
                        )
                    })}
                </div>
            </form>
        </div>
    )
}

