"use client"

import React, { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import {
  ArrowLeft, ArrowRight, Upload, FileText, Code, CheckSquare, Plus, Trash,
  CheckCircle2, Calendar, ClipboardList, BookOpen, HelpCircle, AlertCircle,
  Clock, Repeat, Notebook, FileQuestion, Info, Loader2, Bot,
  X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createExam, extractContentFromDocument, generateAnswers, generateDocumentAnswer, updateDocumentExamAnswer, updateExamAnswers } from "@/actions/examActions"
import { useCustomToast } from "@/components/utilities/alert/alert"
import { ExamType } from "@prisma/client"
import { SimpleHeaderTitle } from "@/components/dashboard/header/header-title"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useEdgeStore } from "@/lib/edgestore"

// Types & Interfaces
type ExamFormat = "QCM" | "PDF" | "CODE"

interface Question {
  id: string
  text: string
  maxPoints: number
  choices: string[]
  programmingLanguage?: string
  answer?: string
  isEditingAnswer?: boolean
  examId?: string
}

interface ExamCreatorProps {
  userId: string
}

// Main Component
const ExamCreator = ({ userId }: ExamCreatorProps) => {
  // Hooks
  const { edgestore } = useEdgeStore();
  const t = useTranslations('exams')
  const router = useRouter()
  const { showToast } = useCustomToast()
  const local = useLocale()
  const [, startTransition] = useTransition()

  // Step State
  const totalSteps = 4
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Form State
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [type] = useState<ExamType>(ExamType.QCM)
  const [format, setFormat] = useState<ExamFormat>("QCM")
  const [maxAttempts] = useState<number>(1)
// Date State
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  )
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  )
  const [deadline] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  )

  // Questions State
  const [questions, setQuestions] = useState<Question[]>([{
    id: "1",
    text: "",
    maxPoints: 10,
    choices: [""],
    programmingLanguage: undefined,
    answer: ""
  }])
  const [extractedText, setExtractedText] = useState<string>("")

  // UI State
  const [showAnswers, setShowAnswers] = useState(false)
  const [isGeneratingAnswers, setIsGeneratingAnswers] = useState(false)
  const [selectedModel] = useState("deepseek/deepseek-chat:free")
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [examCreated, setExamCreated] = useState(false)
  const [, setCreatedExamId] = useState<string | null>(null)

  // File Handlers
  const [file, setFile] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [, setUploadProgress] = useState(0);
  const [, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [, setUploadError] = useState<string | null>(null);
  const [, setUploadResult] = useState<string | null>(null);

  async function uploadFile(file: File) {
    if (!file) return null;

    try {
      setUploadState("uploading");
      setUploadError(null);
      setUploadProgress(0);

      const res = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          setUploadProgress(progress);
        },
      });

      setUploadProgress(100);
      setUploadState("success");
      setUploadResult(res.url);
      return res.url;

    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      setUploadState("error");
      setUploadError(error instanceof Error ? error.message : "Une erreur est survenue");
      setUploadProgress(0);
      setUploadResult(null);
      return null;
    }
  }

  // Question Handlers
  const handleChoiceChange = (questionId: string, choiceIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.choices) {
        const newChoices = [...q.choices]
        newChoices[choiceIndex] = value
        return { ...q, choices: newChoices }
      }
      return q
    }))
  }

  const addChoice = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.choices) {
        return { ...q, choices: [...q.choices, ""] }
      }
      return q
    }))
  }

  const removeChoice = (questionId: string, choiceIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.choices && q.choices.length > 1) {
        const newChoices = q.choices.filter((_, index) => index !== choiceIndex)
        return { ...q, choices: newChoices }
      }
      return q
    }))
  }

  const addQuestion = () => {
    if (format === "CODE" && questions.length >= 1) {
      showToast(t("error"), t("codeLimit"), "error")
      return
    }

    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: "",
        maxPoints: 10,
        choices: format === "QCM" ? [""] : [],
        programmingLanguage: format === "CODE" ? "python" : undefined
      }
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
      questions.map((q) => (
        q.id === id ? { ...q, [field]: field === "maxPoints" ? Number(value) : value } : q
      ))
    )
  }

  // Navigation Handlers
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

  // Form Submission & Answer Generation
  const handleSubmit = async () => {
    setIsGeneratingAnswers(true)
    startTransition(async () => {
      try {
        if (examCreated) {
          showToast(t("error"), t("examAlreadyCreated"), "error")
          return
        }

        // Validations
        if (!title) {
          showToast(t("error"), t("titleRequired"), "error")
          setCurrentStep(1)
          return
        }

        if (format === "PDF" && !file) {
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

        let res : string | null = null;
        if(format == "PDF"){
          res = await uploadFile(file!)
          if(res){
            setUploadResult(res)
          }
        }

        // Create exam data
        const examData = {
          title,
          description,
          type: format === "PDF" ? ExamType.DOCUMENT : format === "QCM" ? ExamType.QCM : ExamType.CODE,
          format,
          filePath: format === "PDF" ? res ?? "sample.pdf" : "",
          maxAttempts: Number(maxAttempts),
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          questions: format !== "PDF" ? questions.map(({ id, isEditingAnswer, answer, ...rest }) => rest) : undefined
        }

        const result = await createExam(examData, userId)

        if (result.success && result.data) {
          setExamCreated(true)
          setCreatedExamId(result.data.id)
          showToast(t("success"), t("examCreated"), "success")

          if (format !== "PDF") {
            const answersResult = await generateAnswers(questions, selectedModel)

            if (answersResult.success && answersResult.questions) {
              setShowAnswers(true)
              const questionsWithAnswers = await Promise.all(
                answersResult.questions.map(async (q, index) => ({
                  ...q,
                  id: result.data!.questions[index].id,
                  examId: result.data!.id,
                  answer: await q.answer,
                  isEditingAnswer: false
                }))
              )
              setQuestions(questionsWithAnswers)
            }
          }else{
            const text = await extractContentFromDocument(file!, file!.name.split('.').pop()! as "pdf" | "md" | "latex" | "txt");
            console.log(text);
            setExtractedText(text);
            const answersResult = await generateDocumentAnswer(text, selectedModel)
            console.log(answersResult);
            if(answersResult.success){
              setShowAnswers(true);
              setQuestions([{
                id: "1",
                text: t("documentAnswer"),
                maxPoints: 20,
                choices: [],
                answer: answersResult.evaluation,
                examId: result.data!.id
              }]);
            }else{
              showToast(t("error"), t("aiGeneration.error"), "error")
            }
          }
        } else {
          showToast(t("error"), result.error || t("createFailed"), "error")
        }
      } catch (error) {
        console.error("Error submitting exam:", error)
        showToast(t("error"), t("unknownError"), "error")
      } finally {
        setIsGeneratingAnswers(false)
      }
    })
  }

  const updateAnswer = (questionId: string, newAnswer: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, answer: newAnswer } : q
    ))
  }

  const handleRedirect = async () => {
    try {
      let result;
      if (format === "PDF") {
        console.log(questions);
        result = await updateDocumentExamAnswer(questions[0].examId!, questions[0].answer!)
      } else {
        result = await updateExamAnswers(questions[0].examId!, questions)
      }

      if (result.success) {
        showToast(t("success"), t("answersUpdated"), "success")
        router.push(`/${local}/exams`)
      } else {
        showToast(t("error"), t("updateAnswersError"), "error")
      }
    } catch (error) {
      console.error("Error updating answers:", error)
      showToast(t("error"), t("unknownError"), "error")
    }
  }

  const handleGenerateAnswers = async (regenerate = false) => {
    const actionToExecute = regenerate ? setIsRegenerating : setIsGeneratingAnswers
    actionToExecute(true)

    try {
      if (format === "PDF") {
        const answersResult = await generateDocumentAnswer(extractedText, selectedModel)

        if (answersResult.success) {
          setQuestions([{
            ...questions[0],
            answer: answersResult.evaluation,
          }])
          setShowAnswers(true)
        } else {
          showToast(t("error"), t("aiGeneration.error"), "error")
        }
      } else {
        const answersResult = await generateAnswers(questions, selectedModel)

        if (answersResult.success && answersResult.questions) {
          setQuestions(answersResult.questions.map((q, index) => ({
            ...q,
            id: questions[index].id,
            isEditingAnswer: false
          })))
          setShowAnswers(true)
        } else {
          showToast(t("error"), t("aiGeneration.error"), "error")
        }
      }
    } catch (error) {
      console.error("Error generating answers:", error)
      showToast(t("error"), t("aiGeneration.error"), "error")
    } finally {
      actionToExecute(false)
    }
  }

  const AnswerSkeleton = () => (
    <div className="space-y-6">
      {questions.map((question) => (
        <Card key={question.id} className="border-primary/20">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

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
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-lg font-medium">
                        <FileText className="h-5 w-5 text-primary" />
                        {t("uploadDocument")}
                      </Label>
                      {file && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-primary">
                            {file.name.split('.').pop()?.toUpperCase()}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80"
                            onClick={() => {
                              setFile(undefined)
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ""
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        type="file"
                        accept=".pdf,.md,.tex,.txt"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFile(file)
                            // uploadFile(file)
                          }
                        }}
                        className="dark:bg-zinc-800 cursor-pointer file:cursor-pointer file:border-0 file:bg-primary/10 file:text-primary file:font-medium hover:file:bg-primary/20 transition-colors"
                      />
                    </div>

                    {file && (
                      <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 rounded-lg bg-primary/5 border border-dashed border-primary/20">
                    <p className="text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
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
                          <Label>{t(`choices.${format}`)}</Label>
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
                  disabled={format === "CODE" && questions.length >= 1}
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

            <Card className="border-primary/20 py-0 overflow-hidden">
              <CardHeader className=" border-b py-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    {title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">{t("type")}</h3>
                      </div>
                      <p className="text-lg">{type}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Code className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">{t("format")}</h3>
                      </div>
                      <p className="text-lg flex items-center gap-2">
                        {format === "QCM" && <CheckSquare className="h-5 w-5 text-primary" />}
                        {format === "PDF" && <FileText className="h-5 w-5 text-primary" />}
                        {format === "CODE" && <Code className="h-5 w-5 text-primary" />}
                        {format}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Repeat className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">{t("maxAttempts")}</h3>
                      </div>
                      <p className="text-lg">{maxAttempts}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">{t("deadline")}</h3>
                      </div>
                      <p className="text-lg">{new Date(deadline).toLocaleString()}</p>
                    </div>
                  </div>

                  {format === "PDF" && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">{t("attachedFile")}</h3>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-md shadow-sm">
                        <FileText className="h-5 w-5 text-primary" />
                        <p className="font-medium">{file?.name}</p>
                      </div>
                    </div>
                  )}

                  {format !== "PDF" && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-md bg-primary/10">
                          <FileQuestion className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">{t("questionCount")}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="px-4 py-1.5 text-lg font-semibold">
                          {questions.length}
                        </Badge>
                        <p className="text-lg">{t("questions").toLowerCase()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="border-t p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <AlertCircle className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm leading-relaxed">{t("finalConfirmation")}</p>
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
        Icon={<Notebook className="h-5 w-5" />}
      />
      <div className="container py-10">
        <Card className="mb-8 shadow-md border-zinc-200 dark:border-primary/20">
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
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-primary hover:bg-primary/90"
                >
                  {t('next')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  {!examCreated ? (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isGeneratingAnswers}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isGeneratingAnswers ? (
                        <div className="flex items-center">
                          <Bot className="mr-2 h-4 w-4 animate-pulse" />
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('aiGeneration.generating')}
                        </div>
                      ) : (
                        <>
                          <Bot className="mr-2 h-4 w-4" />
                          {t('aiGeneration.generate')}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleGenerateAnswers(true)}
                      disabled={isRegenerating}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isRegenerating ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('aiGeneration.regenerating')}
                        </div>
                      ) : (
                        <>
                          <Bot className="mr-2 h-4 w-4" />
                          {t('aiGeneration.regenerate')}
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Affichage des réponses générées */}
        {showAnswers && (
          <Card className="mt-8 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('aiGeneration.preview')}</CardTitle>
              <Button
                onClick={() => handleGenerateAnswers(true)}
                disabled={isRegenerating}
                variant="outline"
                size="sm"
              >
                {isRegenerating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('aiGeneration.regenerating')}
                  </div>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    {t('aiGeneration.regenerate')}
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {(isGeneratingAnswers || isRegenerating) ? (
                <AnswerSkeleton />
              ) : (
                <div className="space-y-6">
                  {format === "PDF" ? (
                    <Card className="border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-lg">{t("documentAnswer")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Textarea
                            value={questions[0].answer || ''}
                            onChange={(e) => updateAnswer(questions[0].id, e.target.value)}
                            placeholder={t("aiGeneration.answerPlaceholder")}
                            className="min-h-[300px]"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    questions.map((question) => (
                      <Card key={question.id} className="border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-lg">{question.text}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Textarea
                              value={question.answer || ''}
                              onChange={(e) => updateAnswer(question.id, e.target.value)}
                              placeholder={t("aiGeneration.answerPlaceholder")}
                              className="min-h-[100px]"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAnswers(false)}
              >
                {t('back')}
              </Button>
              <Button
                onClick={handleRedirect}
                className="bg-primary hover:bg-primary/90"
              >
                {t('finalize')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  )
}

export default ExamCreator

