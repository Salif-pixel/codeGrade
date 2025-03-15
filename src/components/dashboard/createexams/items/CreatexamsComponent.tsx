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
  correctionAi: string
  maxPoints: number
}

interface ExamCreatorProps {
  userId: string
}

const ExamCreator = ({ userId }: ExamCreatorProps) => {

  const [isPending, startTransition] = useTransition();
  const t = useTranslations()
  const router = useRouter()
  const { showToast } = useCustomToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const local = useLocale()

  // Step control
  const [currentStep, setCurrentStep] = useState<number>(1)
  const totalSteps = 4

  // Form state
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [type, setType] = useState<ExamType>(ExamType.QCM)
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
  const [questions, setQuestions] = useState<Question[]>([{ id: "1", text: "", correctionAi: "", maxPoints: 10 }])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setFilePath(selectedFile.name) // In production, you would upload and get a path
    }
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: "",
        correctionAi: "",
        maxPoints: 10,
      },
    ])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    } else {
      showToast(t("exams.warning"), t("exams.needOneQuestion"), "warning")
    }
  }

  const updateQuestion = (id: string, field: keyof Question, value: string | number) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: field === "maxPoints" ? Number(value) : value } : q)),
    )
  }

  const nextStep = () => {
    if (currentStep === 1 && !title) {
      showToast(t("exams.error"), t("exams.titleRequired"), "error")
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

    try {
      // Validations
      if (!title) {
        showToast(t("exams.error"), t("exams.titleRequired"), "error")
        setCurrentStep(1)
        return
      }

      if (!filePath) {
        showToast(t("exams.error"), t("exams.fileRequired"), "error")
        setCurrentStep(2)
        return
      }

      const questionsMissing = questions.some((q) => !q.text)
      if (questionsMissing) {
        showToast(t("exams.error"), t("exams.questionsIncomplete"), "error")
        setCurrentStep(3)
        return
      }

      // Prepare data
      const examData = {
        title,
        description,
        type,
        format,
        filePath,
        maxAttempts: Number(maxAttempts),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        questions: questions.map(({ id, ...rest }) => rest),
      }

      startTransition(async () => {
        const result = await createExam(examData as never, userId)

        if (result.success) {
          showToast(t("exams.success"), t("exams.examCreated"), "success")

          router.push(`/${local}/my-exams`)
        } else {
          showToast(t("exams.error"), result.error || t("exams.createFailed"), "error")
        }
      })

    } catch (error) {
      console.error("Error submitting exam:", error)
      showToast(t("exams.error"), t("exams.unknownError"), "error")
    }
  }

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t("exams.basicInfo")}</h2>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      {t("exams.title")}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {t("exams.required")}
                      </Badge>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t("exams.titlePlaceholder")}
                      className="transition-all focus-visible:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      {t("exams.description")}
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("exams.descriptionPlaceholder")}
                      rows={3}
                      className="resize-none transition-all focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {t("exams.startDate")}
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
                      {t("exams.endDate")}
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
                    <p className="text-sm text-muted-foreground">{t("exams.endDateHelp")}</p>
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
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t("exams.formatSettings")}</h2>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("exams.selectFormat")}</CardTitle>
                <CardDescription>{t("exams.formatDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card
                    className={cn(
                      "cursor-pointer border-2 transition-all hover:shadow-md",
                      format === "QCM" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                    )}
                    onClick={() => setFormat("QCM")}
                  >
                    <CardContent className="flex flex-col items-center p-4 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CheckSquare className="h-6 w-6" />
                      </div>
                      <h3 className="font-medium">{t("exams.qcm")}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{t("exams.qcmDescription")}</p>
                      {format === "QCM" && <Badge className="mt-3 bg-primary">{t("exams.selected")}</Badge>}
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      "cursor-pointer border-2 transition-all hover:shadow-md",
                      format === "PDF" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                    )}
                    onClick={() => setFormat("PDF")}
                  >
                    <CardContent className="flex flex-col items-center p-4 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <FileText className="h-6 w-6" />
                      </div>
                      <h3 className="font-medium">{t("exams.pdf")}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{t("exams.pdfDescription")}</p>
                      {format === "PDF" && <Badge className="mt-3 bg-primary">{t("exams.selected")}</Badge>}
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      "cursor-pointer border-2 transition-all hover:shadow-md",
                      format === "CODE" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                    )}
                    onClick={() => setFormat("CODE")}
                  >
                    <CardContent className="flex flex-col items-center p-4 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Code className="h-6 w-6" />
                      </div>
                      <h3 className="font-medium">{t("exams.code")}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{t("exams.codeDescription")}</p>
                      {format === "CODE" && <Badge className="mt-3 bg-primary">{t("exams.selected")}</Badge>}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-primary" />
                    {t("exams.maxAttempts")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="1"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    className="transition-all focus-visible:ring-primary"
                  />
                  <p className="text-sm text-muted-foreground mt-2">{t("exams.maxAttemptsDescription")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" />
                    {t("exams.uploadFile")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <input type="file" id="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="transition-all hover:border-primary hover:text-primary"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {t("exams.chooseFile")}
                    </Button>
                    {file && <span className="text-sm text-muted-foreground truncate max-w-[200px]">{file.name}</span>}
                  </div>
                  {filePath && (
                    <div className="mt-3 flex items-center rounded-md bg-primary/10 p-2 text-sm text-primary">
                      <FileText className="mr-2 h-4 w-4" />
                      {t("exams.fileAdded")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">{t("exams.questions")}</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                size="sm"
                className="transition-all hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("exams.addQuestion")}
              </Button>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <Card key={question.id} className="border-border shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="h-6 w-6 rounded-full p-0 flex items-center justify-center font-normal"
                      >
                        {index + 1}
                      </Badge>
                      {t("exams.question")} #{index + 1}
                    </CardTitle>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        {t("exams.remove")}
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${index}`} className="text-sm flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        {t("exams.questionText")}
                      </Label>
                      <Textarea
                        id={`question-${index}`}
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                        rows={2}
                        className="resize-none transition-all focus-visible:ring-primary"
                        placeholder={t("exams.questionTextPlaceholder")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`correction-${index}`} className="text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        {t("exams.correctionAi")}
                      </Label>
                      <Textarea
                        id={`correction-${index}`}
                        value={question.correctionAi}
                        onChange={(e) => updateQuestion(question.id, "correctionAi", e.target.value)}
                        rows={2}
                        className="resize-none transition-all focus-visible:ring-primary"
                        placeholder={t("exams.correctionAiPlaceholder")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`points-${index}`} className="text-sm flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        {t("exams.maxPoints")}
                      </Label>
                      <Input
                        id={`points-${index}`}
                        type="number"
                        min="1"
                        value={question.maxPoints}
                        onChange={(e) => updateQuestion(question.id, "maxPoints", e.target.value)}
                        className="transition-all focus-visible:ring-primary"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t("exams.review")}</h2>
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
                        {t("exams.type")}
                      </p>
                      <p className="font-medium">{type}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Code className="h-4 w-4 text-primary" />
                        {t("exams.format")}
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
                        {t("exams.maxAttempts")}
                      </p>
                      <p className="font-medium">{maxAttempts}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {t("exams.deadline")}
                      </p>
                      <p className="font-medium">{new Date(deadline).toLocaleString()}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Upload className="h-4 w-4 text-primary" />
                      {t("exams.attachedFile")}
                    </p>
                    <div className="flex items-center gap-2 mt-1 p-2 bg-primary/5 rounded-md">
                      <FileText className="h-4 w-4 text-primary" />
                      <p className="font-medium">{filePath}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileQuestion className="h-4 w-4 text-primary" />
                      {t("exams.questionCount")}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-medium">
                        {questions.length}
                      </Badge>
                      <p>{t("exams.questions").toLowerCase()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-primary/5 border-t">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm">{t("exams.finalConfirmation")}</p>
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
      <SimpleHeaderTitle title={"exams.createNew"} Icon={<Notebook className="w-5 h-5 text-primary" />} />
      <div className="container  py-10">
        <Card className="mb-8 px-12 border-zinc-50 bg-white shadow-sm dark:border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex flex-col items-center ${currentStep >= step ? "text-primary" : "text-muted-foreground"
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
                      {step === 1 && t("exams.step1")}
                      {step === 2 && t("exams.step2")}
                      {step === 3 && t("exams.step3")}
                      {step === 4 && t("exams.step4")}
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

        <Card className="border-zinc-50 bg-white shadow-sm dark:border-primary/20">
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
                {t("exams.back")}
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90">
                  {t("exams.next")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={isPending} className={cn("bg-primary hover:bg-primary/90",isPending ? "" : "cursor-pointer")}>
                  {isPending ? <Loader2 className={'animate-spin w-4 h-4'} /> : <Save className="mr-2 h-4 w-4" />}
                  {t("exams.saveExam")}
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

