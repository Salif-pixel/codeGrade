"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {useLocale, useTranslations} from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { ExamType } from "@prisma/client"
import { Clock, Save, Send, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { submitExamAnswers } from "@/actions/examActions"
import { cn } from "@/lib/utils"
import QuizForm from "../dashboard/test/Qcm/qcm";
import PdfComponent from "../dashboard/test/Document/pdf-component"
import CodeComponent from "../dashboard/test/Code/code-component"


type Question = {
  id: string
  text: string
  maxPoints: number
  choices?: string[]
  programmingLanguage: "javascript" | "python" | "java" | "cpp" | "csharp"
  studentAnswer: string
}

type ExamData = {
  id: string
  title: string
  description: string
  type: ExamType
  format: string
  questions: Question[]
  timeRemaining: number | null
  maxAttempts: number
  currentAttempt: number
}

export default function TakeExamComponent({ exam, userId }: { exam: ExamData; userId: string }) {
  const t = useTranslations("exam-taking")
  const router = useRouter()
  const local = useLocale();
  // États pour les réponses et le statut
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [autoSaveMessage, setAutoSaveMessage] = useState("")
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }>({ show: false, title: "", description: "" })
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string[] }>({});
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("instructions")
  
  // Initialiser les réponses à partir des réponses existantes
  useEffect(() => {
    const initialAnswers: Record<string, string | string[]> = {}
    
    exam.questions.forEach(question => {
      if (question.studentAnswer) {
        if (question.choices && question.choices.length > 0) {
          // Pour les QCM, convertir en tableau
          initialAnswers[question.id] = question.studentAnswer.split(", ")
        } else {
          initialAnswers[question.id] = question.studentAnswer
        }
      } else {
        // Initialiser avec une valeur vide
        initialAnswers[question.id] = question.choices && question.choices.length > 0 ? [] : ""
      }
    })
    
    setAnswers(initialAnswers)
  }, [exam.questions])
  
  // Gérer le compte à rebours
  useEffect(() => {
    if (!exam.timeRemaining) return
    
    const updateTimeLeft = () => {
      const now = new Date().getTime()
      const distance = exam.timeRemaining ? exam.timeRemaining - (now - startTime): 0
      
      if (distance <= 0) {
        setTimeLeft("00:00:00")
        clearInterval(timer)
        handleSubmit({})
        
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
  
  // Auto-sauvegarde toutes les 2 minutes
  useEffect(() => {
    if (Object.keys(answers).length === 0) return
    
    const timer = setInterval(() => {
      handleSave(true)
    }, 2 * 60 * 1000)
    
    return () => clearInterval(timer)
  }, [answers])
  
  const handleAnswerChange = (questionId: string, selectedAnswers: string[]) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswers
    }));
  };
  
  const handleSave = async (isAutoSave = false) => {
    if (isAutoSave) {
      setAutoSaveMessage(t("autoSaving"))
    } else {
      setSaving(true)
    }
    
    try {
      const answersToSave = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        content: Array.isArray(value) ? value.join(', ') : value as string
      }))
      
      const result = await submitExamAnswers(exam.id, userId, answersToSave, false)
      
      if (result.success) {
        if (!isAutoSave) {
          setAlert({
            show: true,
            title: t("saveSuccess.title"),
            description: t("saveSuccess.description"),
            variant: "default"
          })
          
          // Masquer l'alerte après 3 secondes
          setTimeout(() => setAlert({ show: false, title: "", description: "" }), 3000)
        } else {
          setAutoSaveMessage(t("autoSaved"))
          setTimeout(() => setAutoSaveMessage(""), 3000)
        }
      } else {
        if (!isAutoSave) {
          setAlert({
            show: true,
            title: t("saveError.title"),
            description: t("saveError.description"),
            variant: "destructive"
          })
          
          // Masquer l'alerte après 3 secondes
          setTimeout(() => setAlert({ show: false, title: "", description: "" }), 3000)
        }
      }
    } catch (error) {
      console.error("Error saving exam:", error)
      if (!isAutoSave) {
        setAlert({
          show: true,
          title: t("saveError.title"),
          description: t("saveError.description"),
          variant: "destructive"
        })
        
        // Masquer l'alerte après 3 secondes
        setTimeout(() => setAlert({ show: false, title: "", description: "" }), 3000)
      }
    } finally {
      if (!isAutoSave) {
        setSaving(false)
      }
    }
  }
  
  const handleSubmit = async (formData: any) => {
    setSubmitting(true);
    
    try {
      let formattedAnswers;
      
      if (exam.type === ExamType.QCM) {
        formattedAnswers = Object.entries(formData).map(([questionId, answer]) => ({
          questionId,
          content: JSON.stringify({
            type: Array.isArray(answer) ? "multiple" : "single",
            correctAnswers: answer,
            explanation: "",
            feedback: { correct: "", incorrect: "" }
          })
        }));
      } else if (exam.type === ExamType.CODE) {
        // Parse le contenu si c'est une chaîne
        let codeData;
        if (Array.isArray(formData) && formData.length > 0) {
          try {
            codeData = JSON.parse(formData[0].content);
          } catch (error) {
            console.error("Error parsing code data:", error);
            codeData = formData[0].content;
          }
        } else {
          codeData = formData;
        }
        
        console.log("Code data before formatting:", codeData);
        
        formattedAnswers = [{
          questionId: exam.questions[0].id,
          content: JSON.stringify({
            type: "code",
            code: codeData.code,
            testResults: codeData.testResults,
            isCorrect: codeData.isCorrect,
            language: exam.questions[0].programmingLanguage,
            questionText: exam.questions[0].text
          })
        }];
        
        console.log("Formatted answers:", formattedAnswers);
      } else {
        // Pour PDF
        formattedAnswers = [{
          questionId: exam.questions[0].id,
          content: formData
        }];
      }

      const result = await submitExamAnswers(exam.id, userId, formattedAnswers, true);
      
      if (result.success) {
        router.push(`/${local}/available-exams/${exam.id}/results`);
      } else {
        setError("Erreur lors de la soumission de l'examen");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      setError("Erreur lors de la soumission de l'examen");
    } finally {
      setSubmitting(false);
    }
  };
  
  const isFormComplete = () => {
    return exam.questions.every(q => {
      const answer = answers[q.id]
      return answer && (typeof answer === "string" ? answer.trim() !== "" : answer.length > 0)
    })
  }

  // Préparer les données pour le composant QCM
  const formatQuestionsForQuizForm = () => {
    return exam.questions.map(q => ({
      id: q.id,
      text: q.text,
      options: (q.choices || []).map((choice, ) => ({
        id: choice,
        text: choice
      }))
    }))
  }

  const handleQuizSubmit = (quizAnswers: Record<string, string | string[]>) => {
    const formattedAnswers = Object.entries(quizAnswers).map(([questionId, answer]) => ({
      questionId,
      content: JSON.stringify({
        type: Array.isArray(answer) ? "multiple" : "single",
        correctAnswers: answer,
        explanation: "",
        feedback: {
          correct: "",
          incorrect: ""
        }
      })
    }));

    setSubmitting(true);
    console.log(formattedAnswers)
    // Envoyer directement le tableau formattedAnswers
    submitExamAnswers(exam.id, userId, formattedAnswers, true)
      .then(result => {
        if (result.success) {
          router.push(`/${local}/available-exams/${exam.id}/results`);
        } else {
          setError("Erreur lors de la soumission de l'examen");
        }
      })
      .catch(error => {
        console.error("Error submitting exam:", error);
        setError("Erreur lors de la soumission de l'examen");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {alert.show && (
        <Alert variant={alert.variant} className="mb-4">
          {alert.variant === "destructive" ? <XCircle /> : <CheckCircle />}
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
            )} />
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
          onSubmit={handleQuizSubmit} 
          isSubmitting={submitting} 
        />
      ) : exam.type === ExamType.DOCUMENT ? (
        <PdfComponent
          assignment={exam}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleSubmit={handleSubmit}
          isSubmitting={submitting}
        />
      ) : exam.type === ExamType.CODE ? (
        <CodeComponent
          assignment={exam}
          handleSubmit={handleSubmit}
          isSubmitting={submitting}
        />
      ) : (
        <>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>{t("instructions.title")}</CardTitle>
              <CardDescription>
                {exam.type === ExamType.CODE
                  ? t("instructions.Code")
                  : t("instructions.document")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {exam.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium">{question.text}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("maxPoints")}: {question.maxPoints}
                      </p>
                    </div>
                  </div>
                  
                  {question.programmingLanguage ? (
                    <Textarea
                      value={answers[question.id] as string || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value.split(', '))}
                      placeholder={t("codePlaceholder", { language: question.programmingLanguage })}
                      className="min-h-[200px] font-mono ml-9"
                    />
                  ) : (
                    <div className="space-y-2">
                      {question.choices?.map((choice, choiceIndex) => (
                        <label
                          key={choiceIndex}
                          className="flex items-center space-x-3 p-3 rounded border hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={(quizAnswers[question.id] || []).includes(choice)}
                            onChange={(e) => {
                              const currentAnswers = quizAnswers[question.id] || [];
                              let newAnswers;
                              
                              if (e.target.checked) {
                                newAnswers = [...currentAnswers, choice];
                              } else {
                                newAnswers = currentAnswers.filter(a => a !== choice);
                              }
                              
                              handleAnswerChange(question.id, newAnswers);
                            }}
                            className="h-4 w-4"
                          />
                          <span>{choice}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center">
            <div className="text-sm">
              {autoSaveMessage && (
                <span className="text-muted-foreground">{autoSaveMessage}</span>
              )}
              {!autoSaveMessage && (
                <span className={isFormComplete() ? "text-green-600" : "text-amber-600"}>
                  {isFormComplete() ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {t("allQuestionsAnswered")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {t("notAllQuestionsAnswered")}
                    </span>
                  )}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave()}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? t("saving") : t("save")}
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={submitting}
              >
                <Send className="mr-2 h-4 w-4" />
                {submitting ? t("submitting") : t("submit")}
              </Button>
            </div>
          </div>
        </>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
} 