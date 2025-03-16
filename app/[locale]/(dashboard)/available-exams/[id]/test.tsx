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

interface Question {
    id: string
    text: string
    options: { id: string; text: string }[]
    multipleAnswers?: boolean
}

interface QuizFormProps {
    questions: Question[]
    onSubmit: (answers: Record<string, string | string[]>) => void
    isSubmitting: boolean
}

export default function QuizForm({ questions, onSubmit, isSubmitting }: QuizFormProps) {
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

        // Supprimer l'erreur si elle existe
        if (errors.includes(questionId)) {
            setErrors(errors.filter((id) => id !== questionId))
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Vérifier que toutes les questions ont une réponse
        const unansweredQuestions = questions.filter((q) => {
            const answer = answers[q.id]
            return !answer || answer.length === 0
        }).map((q) => q.id)

        if (unansweredQuestions.length > 0) {
            setErrors(unansweredQuestions)

            // Trouver l'index de la première question sans réponse
            const firstUnansweredIndex = questions.findIndex((q) => unansweredQuestions.includes(q.id))
            if (firstUnansweredIndex !== -1) {
                setCurrentQuestionIndex(firstUnansweredIndex)
            }

            return
        }

        // Convertir les réponses à choix unique (un seul élément dans le tableau) en chaîne simple
        const formattedAnswers: Record<string, string | string[]> = {}
        
        Object.entries(answers).forEach(([questionId, answerArray]) => {
            // Si la question n'est pas à choix multiples et qu'il n'y a qu'une seule réponse,
            // on peut la convertir en chaîne simple
            const question = questions.find(q => q.id === questionId)
            if (!question?.multipleAnswers && answerArray.length === 1) {
                formattedAnswers[questionId] = answerArray[0]
            } else {
                formattedAnswers[questionId] = answerArray
            }
        })
        
        onSubmit(formattedAnswers)
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
    
    // Obtenir les réponses actuelles pour la question courante
    const currentAnswers = answers[currentQuestion?.id] || []

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                        Progression: {Object.keys(answers).filter(id => answers[id].length > 0).length}/{questions.length} questions répondues
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                        Question {currentQuestionIndex + 1} sur {questions.length}
                    </div>
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="mb-6 border shadow-md">
                    <CardHeader className="bg-muted/50 pb-3">
                        <CardTitle className="text-lg font-medium">
                            Question {currentQuestionIndex + 1}: {currentQuestion?.text}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {currentQuestion?.multipleAnswers 
                                ? "Vous pouvez sélectionner plusieurs réponses" 
                                : "Sélectionnez une ou plusieurs réponses"}
                        </p>
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
                                <span>Veuillez sélectionner au moins une réponse pour cette question</span>
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
                            Question précédente
                        </Button>

                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button type="button" onClick={goToNextQuestion}>
                                Question suivante
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Soumission en cours...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Terminer le QCM
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

                <div className="flex justify-end">
                    <Button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Soumission en cours...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Terminer le QCM
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

