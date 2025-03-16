"use client"

import React, { useState, useRef, type ChangeEvent, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  FileText,
  Code,
  CheckSquare,
  Plus,
  Trash,
  CheckCircle2,
  Calendar,
  ClipboardList,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Award,
  Clock,
  Repeat,
  Notebook,
  FileQuestion,
  Info,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createExam } from "@/actions/examActions"
import { useCustomToast } from "@/components/alert/alert"
import { ExamType } from "@prisma/client"
import { SimpleHeaderTitle } from "@/components/dashboard/header/header-title"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ExamFormat = "QCM" | "PDF" | "CODE"

interface Question {
  id: string
  text: string
  maxPoints: number
  choices: string[] // Pour les QCM : tableau des choix possibles
  programmingLanguage?: string // Pour les questions de code : langage à utiliser
}

interface ExamCreatorProps {
  userId: string
}

const ExamCreator = ({ userId }: ExamCreatorProps) => {
  const t = useTranslations('exams')
  const router = useRouter()
  const { showToast } = useCustomToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const local = useLocale()
  const [isPending, startTransition] = useTransition()

  // Step control
  const [currentStep, setCurrentStep] = useState<number>(1)
  const totalSteps = 4

  // Form state
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [type, ] = useState<ExamType>(ExamType.QCM)
  const [format, setFormat] = useState<ExamFormat>("QCM")
  const [filePath, setFilePath] = useState<string>("")
  const [maxAttempts, setMaxAttempts] = useState<number>(1)
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 16),
  )
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  )
  const [deadline, setDeadline] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  )
  const [file, setFile] = useState<File | null>(null)
  const [questions, setQuestions] = useState<Question[]>([{ 
    id: "1", 
    text: "", 
    maxPoints: 10,
    choices: format === "QCM" ? [""] : [],
    programmingLanguage: format === "CODE" ? "python" : undefined
  }])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setFilePath(selectedFile.name) // In production, you would upload and get a path
    }
  }

  const canEditExam = () => {
    return !startDate || new Date(startDate) > new Date();
  }

  const handleChoiceChange = (questionId: string, choiceIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.choices) {
        const newChoices = [...q.choices];
        newChoices[choiceIndex] = value;
        return { ...q, choices: newChoices };
      }
      return q;
    }));
  }

  const addChoice = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.choices) {
        return { ...q, choices: [...q.choices, ""] };
      }
      return q;
    }));
  }

  const removeChoice = (questionId: string, choiceIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.choices && q.choices.length > 1) {
        const newChoices = q.choices.filter((_, index) => index !== choiceIndex);
        return { ...q, choices: newChoices };
      }
      return q;
    }));
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: "",
        maxPoints: 10,
        choices: format === "QCM" ? [""] : [],
        programmingLanguage: format === "CODE" ? "python" : undefined
      },
    ])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    } else {
      showToast(t("warning"), t("needOneQuestion"), "warning")
    }
  }

  const updateQuestion = (id: string, field: keyof Question, value: string | number) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: field === "maxPoints" ? Number(value) : value } : q)),
    )
  }

  const nextStep = () => {
    if (currentStep === 1 && !title) {
      showToast(t("error"), t("titleRequired"), "error")
      return
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        // Validations
        if (!title) {
          showToast(t("error"), t("titleRequired"), "error")
          setCurrentStep(1)
          return
        }

        if (format === "PDF" && !filePath) {
          showToast(t("error"), t("fileRequired"), "error")
          setCurrentStep(2)
          return
        }

        if (format !== "PDF") {
          const questionsMissing = questions.some((q) => !q.text)
          if (questionsMissing) {
            showToast(t("error"), t("questionsIncomplete"), "error")
            setCurrentStep(3)
            return
          }
        }

        // Prepare data
        const examData = {
          title,
          description,
          type: format === "PDF" ? ExamType.DOCUMENT : format === "QCM" ? ExamType.QCM : ExamType.CODE,
          format,
          filePath: format === "PDF" ? filePath : "",
          maxAttempts: Number(maxAttempts),
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          questions: format !== "PDF" ? questions.map(({ id, ...rest }) => rest) : undefined
        }

        const result = await createExam(examData, userId)

        if (result.success) {
          showToast(t("success"), t("examCreated"), "success")
          router.push(`/${local}/exams`)
        } else {
          showToast(t("error"), result.error || t("createFailed"), "error")
        }
      } catch (error) {
        console.error("Error submitting exam:", error)
        showToast(t("error"), t("unknownError"), "error")
      }
    })
  }

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t("basicInfo")}</h2>
            </div>

            <Card className="dark:bg-zinc-900 border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      {t("title")}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {t("required")}
                      </Badge>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t("titlePlaceholder")}
                      className="transition-all focus-visible:ring-primary dark:bg-zinc-800"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format" className="flex items-center gap-2">
                      <FileQuestion className="h-4 w-4 text-primary" />
                      {t("format")}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {t("required")}
                      </Badge>
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        type="button"
                        variant={format === "QCM" ? "default" : "outline"}
                        className={cn(
                          "flex items-center gap-2 w-full",
                          format === "QCM" && "border-primary"
                        )}
                        onClick={() => setFormat("QCM")}
                      >
                        <CheckSquare className="h-4 w-4" />
                        QCM
                      </Button>
                      <Button
                        type="button"
                        variant={format === "CODE" ? "default" : "outline"}
                        className={cn(
                          "flex items-center gap-2 w-full",
                          format === "CODE" && "border-primary"
                        )}
                        onClick={() => setFormat("CODE")}
                      >
                        <Code className="h-4 w-4" />
                        Code
                      </Button>
                      <Button
                        type="button"
                        variant={format === "PDF" ? "default" : "outline"}
                        className={cn(
                          "flex items-center gap-2 w-full",
                          format === "PDF" && "border-primary"
                        )}
                        onClick={() => setFormat("PDF")}
                      >
                        <FileText className="h-4 w-4" />
                        Document
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      {t("description")}
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("descriptionPlaceholder")}
                      rows={3}
                      className="resize-none transition-all focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {t("startDate")}
                    </Label>
                    <div className="relative">
                      <Input
                        type="datetime-local"
                        id="startDate"
                        className="w-full pl-10 transition-all focus-visible:ring-primary"
                        value={startDate}
                        onChange={(e) => {
                          const newStartDate = e.target.value;
                          setStartDate(newStartDate);
                          if (new Date(newStartDate) > new Date(endDate)) {
                            setEndDate(newStartDate);
                          }
                        }}
                      />
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {t("endDate")}
                    </Label>
                    <div className="relative">
                      <Input
                        type="datetime-local"
                        id="endDate"
                        className="w-full pl-10 transition-all focus-visible:ring-primary"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t("endDateHelp")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t("uploadFile")}</h2>
            </div>

            <Card className="dark:bg-zinc-900 border-primary/20">
              <CardContent className="pt-6">
                {format === "PDF" ? (
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {t("uploadDocument")}
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="dark:bg-zinc-800"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">
                      {t("documentUploadNotAllowed")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t("questions")}</h2>
            </div>

            {format !== "PDF" && (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <Card key={question.id} className="dark:bg-zinc-900 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">
                        {t("question")} {index + 1}
                      </CardTitle>
                      {questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(question.id)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`question-${question.id}`}>
                          {t("questionText")}
                        </Label>
                        <Textarea
                          id={`question-${question.id}`}
                          value={question.text}
                          onChange={(e) =>
                            updateQuestion(question.id, "text", e.target.value)
                          }
                          className="resize-none dark:bg-zinc-800"
                          rows={3}
                        />
                      </div>

                      {format === "CODE" && (
                        <div className="space-y-2">
                          <Label htmlFor={`language-${question.id}`}>
                            {t("programmingLanguage")}
                          </Label>
                          <select
                            id={`language-${question.id}`}
                            value={question.programmingLanguage}
                            onChange={(e) =>
                              updateQuestion(question.id, "programmingLanguage", e.target.value)
                            }
                            className="w-full p-2 rounded-md border dark:bg-zinc-800"
                          >
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                          </select>
                        </div>
                      )}

                      {format === "QCM" && question.choices && (
                        <div className="space-y-4">
                          <Label>{t(`choices.QCM`)}</Label>
                          {question.choices.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex items-center gap-2">
                              <Input
                                value={choice}
                                onChange={(e) =>
                                  handleChoiceChange(
                                    question.id,
                                    choiceIndex,
                                    e.target.value
                                  )
                                }
                                className="dark:bg-zinc-800"
                                placeholder={`${t("choice")} ${choiceIndex + 1}`}
                              />
                              {question.choices!.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeChoice(question.id, choiceIndex)
                                  }
                                  className="h-8 w-8 text-destructive"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addChoice(question.id)}
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {t("addChoice")}
                          </Button>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor={`points-${question.id}`}>
                          {t("maxPoints")}
                        </Label>
                        <Input
                          id={`points-${question.id}`}
                          type="number"
                          min="0"
                          value={question.maxPoints}
                          onChange={(e) =>
                            updateQuestion(
                              question.id,
                              "maxPoints",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-32 dark:bg-zinc-800"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestion}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addQuestion")}
                </Button>
              </div>
            )}

            {format === "PDF" && (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  {t("questionsNotRequiredForPDF")}
                </p>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t("review")}</h2>
            </div>

            <Card className="border-primary/20 shadow-md">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {t("type")}
                      </p>
                      <p className="font-medium">{type}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Code className="h-4 w-4 text-primary" />
                        {t("format")}
                      </p>
                      <p className="font-medium flex items-center gap-2">
                        {format === "QCM" && <CheckSquare className="h-4 w-4 text-primary" />}
                        {format === "PDF" && <FileText className="h-4 w-4 text-primary" />}
                        {format === "CODE" && <Code className="h-4 w-4 text-primary" />}
                        {format}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Repeat className="h-4 w-4 text-primary" />
                        {t("maxAttempts")}
                      </p>
                      <p className="font-medium">{maxAttempts}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {t("deadline")}
                      </p>
                      <p className="font-medium">{new Date(deadline).toLocaleString()}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Upload className="h-4 w-4 text-primary" />
                      {t("attachedFile")}
                    </p>
                    <div className="flex items-center gap-2 mt-1 p-2 bg-primary/5 rounded-md">
                      <FileText className="h-4 w-4 text-primary" />
                      <p className="font-medium">{filePath}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileQuestion className="h-4 w-4 text-primary" />
                      {t("questionCount")}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-medium">
                        {questions.length}
                      </Badge>
                      <p>{t("questions").toLowerCase()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-primary/5 border-t">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm">{t("finalConfirmation")}</p>
                </div>
              </CardFooter>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <SimpleHeaderTitle 
        title={'exams.createNew'} 
        Icon={<Notebook className="h-5 w-5"/>} 
      />
      <div className="container py-10">
        <Card className="mb-8 shadow-md border-zinc-200 dark:border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex flex-col items-center ${
                      currentStep >= step ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => step < currentStep && setCurrentStep(step)}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-medium mb-2 cursor-pointer transition-all",
                        currentStep > step
                          ? "bg-primary text-primary-foreground shadow-md"
                          : currentStep === step
                            ? "border-2 border-primary text-primary shadow-sm"
                            : "border-2 border-muted text-muted-foreground",
                      )}
                    >
                      {currentStep > step ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <>
                          {step === 1 && <BookOpen className="h-5 w-5" />}
                          {step === 2 && <FileText className="h-5 w-5" />}
                          {step === 3 && <FileQuestion className="h-5 w-5" />}
                          {step === 4 && <CheckCircle2 className="h-5 w-5" />}
                        </>
                      )}
                    </div>
                    <span className="text-xs font-medium">
                      {step === 1 && t('step1')}
                      {step === 2 && t('step2')}
                      {step === 3 && t('step3')}
                      {step === 4 && t('step4')}
                    </span>
                  </div>

                  {step < 4 && (
                    <div className={cn("w-24 h-0.5 mt-6", currentStep > step ? "bg-primary" : "bg-muted")} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-zinc-200 dark:border-primary/20">
          <CardContent className="p-6">
            {getStepContent()}

            <Separator className="my-6" />

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="transition-all hover:border-primary hover:text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('back')}
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90">
                  {t('next')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {t('saveExam')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default ExamCreator

